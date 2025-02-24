"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useSelector , useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setOutput } from "@/redux/outputTextSlice";
import { setVoiceContent } from "@/redux/voiceContent";


interface ThreeJSModelViewerProps {
  modelUrl: string;
}

interface AlignmentData {
  phonemes: string;
  word: string;
  start: number;
  end: number;
}

interface VoiceState {
  TaskStatus: string;
  TimestampsUri: string;
  OutputUri: string;
}

const VoiceBot: React.FC<ThreeJSModelViewerProps> = ({ modelUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preloadedModel, setPreloadedModel] = useState<THREE.Object3D | null>(null);
  const voiceContent = useSelector((state: RootState) => state.voice.value) as unknown as VoiceState;
  const device = useSelector((state: RootState) => state.device.value);
  const headObject = preloadedModel?.getObjectByName("Wolf3D_Head") as THREE.Mesh & {
    morphTargetDictionary?: Record<string, number>;
    morphTargetInfluences?: number[];
  } | null;
  let audio: HTMLAudioElement | null = null;
  let wordsWithTiming: AlignmentData[] = [];
  let previousPhoneme: string | null = null;
  const timeouts: NodeJS.Timeout[] = [];
  const dispatch = useDispatch();

  const phonemeToMorph: Record<string, string> = {
    "a": "a", "b": "E", "c": "k", "d": "t",
    "e": "e", "f": "f", "g": "E", "h": "au",
    "i": "i", "j": "k", "k": "k", "l": "pi",
    "m": "pa", "n": "pa", "o": "O", "p": "e",
    "q": "uO", "r": "r", "s": "s", "t": "t",
    "u": "u", "v": "E", "w": "uo", "x": "kf",
    "y": "i", "z": "rf", "1": "op", "2": "u", "3": "ee",
    "4": "oa", "5": "aeo", "6": "ES", "7": "eea", "8": "aeT",
    "9": "aei", "0": "eo"
  };

  const match: Record<string, string> = {
    "p": "viseme_PP",
    "f": "viseme_FF",
    "E": "viseme_E",
    "i": "viseme_I",
    "o": "viseme_O",
    "O": "viseme_O",
    "k": "viseme_kk",
    "s": "viseme_SS",
    "t": "viseme_TH",
    "u": "viseme_U",
    "a": "viseme_aa",
    "r": "viseme_RR",
  }; 

 

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => setPreloadedModel(gltf.scene),
      undefined,
      (error) => console.error("Model failed to load:", error)
    );
  }, [modelUrl]);

  useEffect(() => {
    if (!canvasRef.current || !preloadedModel) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.7, 0.6);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.setClearColor("#1E8787", 1);

    const ambientLight = new THREE.AmbientLight(0x404040, 4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight.position.set(0.069, 1.748, 1.586);
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight("#00AAFF", "#FFAA00", 4);
    hemisphereLight.position.set(0, 1.538, 0);
    scene.add(hemisphereLight);

    scene.add(preloadedModel);
    preloadedModel.position.set(0, 0, 0);

    if (voiceContent?.TaskStatus === "completed") {
      const fetchAlignmentData = async () => {
        try {
          const response = await fetch(voiceContent.TimestampsUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch timestamps: ${response.statusText}`);
          }


          const alignment = (await response.json()) as AlignmentData[];
          wordsWithTiming = wordsWithPhonemesAndTiming(alignment);
          audio = new Audio(voiceContent.OutputUri);
          audio.play();
          dispatch(setVoiceContent(null));
        } catch (error) {
          console.error("Error processing lipsync generation:", error);
        }
      };

      fetchAlignmentData();
    }

    const wordsWithPhonemesAndTiming = (alignment: AlignmentData[]) => {
      return alignment.map(({ word, start, end }) => ({
        word,
        phonemes: wordToPhonemes(word),
        start,
        end,
      }));
    };

    const wordToPhonemes = (word: string) => {
      return Array.from(word)
        .map((char) => phonemeToMorph[char] || "")
        .join("");
    };

    const animate = () => {
      requestAnimationFrame(animate);

      if (audio) {
        const currentTime = audio.currentTime;
        const currentPhoneme = wordsWithTiming.find(
          ({ start, end }) => currentTime >= start && currentTime < end
        );

        if (currentPhoneme && currentPhoneme.phonemes !== previousPhoneme) {
          previousPhoneme = currentPhoneme.phonemes;

          dispatch(setOutput(currentPhoneme.word));

          const phonemeArray = currentPhoneme.phonemes.split("");
          let delay = 0;

          timeouts.forEach(clearTimeout);
          timeouts.length = 0;

          phonemeArray.forEach((phoneme: string | number) => {
            const timeout = setTimeout(() => {
              const viseme = match[phonemeToMorph[phoneme]];
              const morphTargetIndex = headObject?.morphTargetDictionary?.[viseme];

              if (morphTargetIndex !== undefined && headObject?.morphTargetInfluences) {
                headObject.morphTargetInfluences[morphTargetIndex] = 0.7;

                setTimeout(() => {
                  headObject.morphTargetInfluences![morphTargetIndex] = 0;
                }, 200);
              }
            }, delay);
            delay += 300;
            timeouts.push(timeout);
          });
        }

        if (!currentPhoneme) {
          previousPhoneme = null;
          timeouts.forEach(clearTimeout);
          timeouts.length = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect =
        canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [preloadedModel, voiceContent, audio]);

  return (
    <>
     {
        device !== 'mobile' ? <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-[30vh] max-h-[30vh] mt-5 rounded-full border-4 border-customColor hover:border-customDark aspect-square"
        /> : <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-[25vh] max-h-[25vh] mt-1 rounded-full border-4 border-customColor hover:border-customDark aspect-square"
        />
    }
    </>  
  );
};

export default VoiceBot;
