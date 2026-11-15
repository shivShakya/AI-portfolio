"use client";
// The talking 3D avatar: lip-sync from word timestamps, natural eye movement, blinking (when the
// model has blink shapes), and head movement (idle sway, nods while speaking, follows the pointer).
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setVoiceContent } from "@/redux/voiceContent";
import { voiceBus } from "../voiceBus";

interface ThreeJSModelViewerProps {
  modelUrl: string;
  /** Small round face for the phone chat sheet header. */
  compact?: boolean;
}

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface VoiceState {
  TaskStatus: string;
  TimestampsUri: string;
  OutputUri: string;
}

// ---------------------------------------------------------------------------------------------
// Lip-sync: text -> visemes (the 15 Oculus/Ready Player Me mouth shapes)
// ---------------------------------------------------------------------------------------------
type Viseme = "sil" | "PP" | "FF" | "TH" | "DD" | "kk" | "CH" | "SS" | "nn" | "RR" | "aa" | "E" | "I" | "O" | "U";
const VISEMES: Viseme[] = ["sil", "PP", "FF", "TH", "DD", "kk", "CH", "SS", "nn", "RR", "aa", "E", "I", "O", "U"];
const VOWELS = new Set<Viseme>(["aa", "E", "I", "O", "U"]);

// How strongly each shape is used. Lip closures (PP) must fully close; wide vowels look odd at 100%.
const STRENGTH: Record<Viseme, number> = {
  sil: 1, PP: 1, FF: 0.9, TH: 0.8, DD: 0.7, kk: 0.65, CH: 0.85, SS: 0.75, nn: 0.65, RR: 0.75,
  aa: 0.8, E: 0.8, I: 0.75, O: 0.85, U: 0.85,
};

// Letter pairs first (they sound like one shape), then single letters.
const DIGRAPHS: Record<string, Viseme[]> = {
  th: ["TH"], sh: ["CH"], ch: ["CH"], zh: ["CH"], ph: ["FF"], gh: [], ck: ["kk"], ng: ["nn"],
  qu: ["kk", "U"], wh: ["U"], ee: ["I"], ea: ["I"], ie: ["I"], oo: ["U"], ou: ["aa", "U"],
  ow: ["O"], oa: ["O"], ai: ["E"], ay: ["E"], ei: ["E"], ey: ["E"], au: ["O"], aw: ["O"], oi: ["O", "I"], oy: ["O", "I"],
};
const LETTERS: Record<string, Viseme[]> = {
  a: ["aa"], e: ["E"], i: ["I"], o: ["O"], u: ["U"], y: ["I"],
  b: ["PP"], m: ["PP"], p: ["PP"], f: ["FF"], v: ["FF"],
  d: ["DD"], t: ["DD"], l: ["DD"], n: ["nn"],
  k: ["kk"], g: ["kk"], c: ["kk"], q: ["kk"], x: ["kk", "SS"],
  s: ["SS"], z: ["SS"], j: ["CH"], r: ["RR"], w: ["U"], h: [],
};

// Common words that aren't spoken the way they're spelled.
const WORDS: Record<string, Viseme[]> = {
  i: ["aa", "I"], a: ["E"], the: ["TH", "E"], to: ["DD", "U"], do: ["DD", "U"], who: ["U"], you: ["I", "U"],
  your: ["I", "O", "RR"], are: ["aa", "RR"], one: ["U", "aa", "nn"], what: ["U", "aa", "DD"], is: ["I", "SS"],
  was: ["U", "aa", "SS"], of: ["aa", "FF"], hi: ["aa", "I"], my: ["PP", "aa", "I"], by: ["PP", "aa", "I"],
  why: ["U", "aa", "I"], hello: ["E", "DD", "O"], have: ["aa", "FF"], know: ["nn", "O"], work: ["U", "RR", "kk"],
  ai: ["E", "I", "aa", "I"], ui: ["I", "U", "aa", "I"],
};

// Letter names, for acronyms like "AWS" or "AR" (spoken letter by letter).
const LETTER_NAMES: Record<string, Viseme[]> = {
  a: ["E", "I"], b: ["PP", "I"], c: ["SS", "I"], d: ["DD", "I"], e: ["I"], f: ["E", "FF"], g: ["CH", "I"],
  h: ["E", "CH"], i: ["aa", "I"], j: ["CH", "E"], k: ["kk", "E"], l: ["E", "DD"], m: ["E", "PP"], n: ["E", "nn"],
  o: ["O", "U"], p: ["PP", "I"], q: ["kk", "U"], r: ["aa", "RR"], s: ["E", "SS"], t: ["DD", "I"], u: ["I", "U"],
  v: ["FF", "I"], w: ["DD", "U"], x: ["E", "kk", "SS"], y: ["U", "aa", "I"], z: ["SS", "I"],
};

function wordToVisemes(raw: string): Viseme[] {
  const letters = raw.replace(/[^A-Za-z]/g, "");
  const w = letters.toLowerCase();
  if (!w) return /\d/.test(raw) ? ["E", "aa"] : []; // numbers: generic open-close
  if (WORDS[w]) return WORDS[w];
  // Short all-caps words are acronyms: AWS, AR, VR, CDAC.
  if (letters.length >= 2 && letters.length <= 4 && letters === letters.toUpperCase()) {
    return [...w].flatMap((c) => LETTER_NAMES[c] ?? []).filter((v, i, all) => v !== all[i - 1]);
  }
  const out: Viseme[] = [];
  for (let i = 0; i < w.length; ) {
    const pair = w.slice(i, i + 2);
    if (pair.length === 2 && DIGRAPHS[pair]) {
      out.push(...DIGRAPHS[pair]);
      i += 2;
      continue;
    }
    // Silent final "e" (make, time) doesn't open the mouth.
    if (w[i] === "e" && i === w.length - 1 && w.length > 2) break;
    out.push(...(LETTERS[w[i]] ?? []));
    i += 1;
  }
  return out.filter((v, i) => v !== out[i - 1]); // repeated shapes merge into one
}

type Segment = { start: number; end: number; viseme: Viseme };

// Spread each word's shapes across its actual spoken time (from the TTS timestamps).
function buildSchedule(words: WordTiming[]): Segment[] {
  const segs: Segment[] = [];
  for (const { word, start, end } of words) {
    const vis = wordToVisemes(word);
    if (!vis.length || end <= start) continue;
    // Vowels hold a little longer than consonants.
    const weights = vis.map((v) => (VOWELS.has(v) ? 1.4 : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let t = start;
    vis.forEach((viseme, i) => {
      const d = ((end - start) * weights[i]) / total;
      segs.push({ start: t, end: t + d, viseme });
      t += d;
    });
  }
  return segs;
}

// The reply being spoken and its lip-sync timing. Module-level so it survives page switches:
// the avatar on the dashboard keeps lip-syncing a reply that started on the home page.
const speech = { audio: null as HTMLAudioElement | null, schedule: [] as Segment[], wordStarts: [] as number[] };
let playToken = 0;

// ---------------------------------------------------------------------------------------------
// Environment: theme colours + a soft round sprite texture
// ---------------------------------------------------------------------------------------------
const cssColor = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); // "r g b"
  const [r, g, b] = v.split(/\s+/).map(Number);
  return Number.isFinite(b) ? new THREE.Color(r / 255, g / 255, b / 255) : new THREE.Color(fallback);
};
const readTheme = () => ({
  top: cssColor("--n-50", "#f8fafc"),
  bottom: cssColor("--n-300", "#cbd5e1"),
  accent: cssColor("--accent", "#16766e"),
  dark: document.documentElement.classList.contains("dark"),
});

// Radial "soft dot" used for particles and the halo.
const softDot = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// ---------------------------------------------------------------------------------------------
type MorphMesh = THREE.Mesh & { morphTargetDictionary: Record<string, number>; morphTargetInfluences: number[] };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const damp = (current: number, target: number, speed: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-speed * dt));

const VoiceBot: React.FC<ThreeJSModelViewerProps> = ({ modelUrl, compact }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const voiceContent = useSelector((state: RootState) => state.voice.value) as unknown as VoiceState | null;
  const device = useSelector((state: RootState) => state.device.value);
  const dispatch = useDispatch();


  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => setModel(gltf.scene),
      undefined,
      (error) => console.error("Model failed to load:", error)
    );
  }, [modelUrl]);

  // ---- Play a new reply: build the lip-sync schedule from its word timestamps ----
  useEffect(() => {
    if (voiceContent?.TaskStatus !== "completed") return;
    const { OutputUri, TimestampsUri } = voiceContent;
    dispatch(setVoiceContent(null)); // consume it
    const token = ++playToken; // a newer reply wins if two arrive close together

    (async () => {
      try {
        const res = await fetch(TimestampsUri);
        if (!res.ok) throw new Error(`timestamps ${res.status}`);
        const words = (await res.json()) as WordTiming[];
        if (token !== playToken) return;

        const audio = new Audio(OutputUri);
        speech.audio = audio;
        speech.schedule = buildSchedule(words);
        speech.wordStarts = words.filter((w) => w.end - w.start > 0.25).map((w) => w.start);
        voiceBus.play(audio); // lets the mic pause while the avatar talks
        audio.play().catch(() => voiceBus.stop());
      } catch (error) {
        console.error("Error starting the avatar's voice:", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceContent]);

  // ---- One renderer + animation loop for the lifetime of the model ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !model) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.7, 0.6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false); // keep the CSS size, only set the drawing buffer
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    scene.add(new THREE.AmbientLight(0x444040, 4));
    const key = new THREE.DirectionalLight(0xffffff, 6);
    key.position.set(0.069, 1.748, 1.586);
    scene.add(key);
    const hemi = new THREE.HemisphereLight("#0000FF", "#FFAA00", 4);
    hemi.position.set(0, 1.538, 0);
    scene.add(hemi);
    scene.add(model);
    model.position.set(0, 0, 0);

    // ---------- 3D environment (depth behind the character) ----------
    const HEAD = new THREE.Vector3(0, 1.66, 0);
    let theme = readTheme();
    const dot = softDot();

    // Backdrop dome: vertical gradient, vignette, and a faint accent glow behind the head.
    const domeMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: theme.top },
        bottom: { value: theme.bottom },
        accent: { value: theme.accent },
        glow: { value: theme.dark ? 0.35 : 0.22 },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 bottom; uniform vec3 accent; uniform float glow;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y * 2.2 + 0.5, 0.0, 1.0);
          vec3 col = mix(bottom, top, smoothstep(0.0, 1.0, h));
          float behind = max(dot(vDir, normalize(vec3(0.0, 0.05, -1.0))), 0.0);
          col = mix(col, accent, pow(behind, 6.0) * glow);          // glow behind the head
          col *= 1.0 - 0.18 * (1.0 - pow(behind, 1.5));             // darker towards the sides
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(8, 48, 24), domeMat);
    dome.position.copy(HEAD);
    dome.renderOrder = -1;
    scene.add(dome);

    // Fog fades far particles into the backdrop: the main depth cue.
    scene.fog = new THREE.Fog(theme.bottom.clone().lerp(theme.top, 0.5), 0.6, 3.2);

    // Halo behind the head (brightens a little while talking).
    const haloMat = new THREE.SpriteMaterial({
      map: dot, color: theme.accent, transparent: true, opacity: 0.25, depthWrite: false, fog: false,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.position.set(HEAD.x, HEAD.y + 0.02, -0.45);
    halo.scale.setScalar(0.85);
    scene.add(halo);

    // Floating particles at many depths behind and around the character.
    const COUNT = 140;
    const pos = new Float32Array(COUNT * 3);
    const speed = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const z = rand(-2.6, -0.25);
      const spread = 0.35 + (-z) * 0.45; // wider further back, so they fill the view
      pos[i * 3] = rand(-spread, spread);
      pos[i * 3 + 1] = HEAD.y + rand(-spread, spread);
      pos[i * 3 + 2] = z;
      speed[i] = rand(0.015, 0.05);
      phase[i] = rand(0, Math.PI * 2);
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({
      map: dot, color: theme.accent, size: 0.045, sizeAttenuation: true,
      transparent: true, opacity: theme.dark ? 0.75 : 0.55, depthWrite: false,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // Rim light from behind: outlines hair and shoulders, separating them from the backdrop.
    const rim = new THREE.DirectionalLight(theme.accent, theme.dark ? 5 : 3);
    rim.position.set(0.4, 2.2, -1.5);
    scene.add(rim);

    // Follow the light/dark toggle live.
    const applyTheme = () => {
      theme = readTheme();
      domeMat.uniforms.top.value = theme.top;
      domeMat.uniforms.bottom.value = theme.bottom;
      domeMat.uniforms.accent.value = theme.accent;
      domeMat.uniforms.glow.value = theme.dark ? 0.35 : 0.22;
      (scene.fog as THREE.Fog).color = theme.bottom.clone().lerp(theme.top, 0.5);
      haloMat.color = theme.accent;
      partMat.color = theme.accent;
      partMat.opacity = theme.dark ? 0.75 : 0.55;
      rim.color = theme.accent;
      rim.intensity = theme.dark ? 5 : 3;
    };
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Every mesh with mouth shapes (head, teeth, eyes) moves together.
    const morphMeshes: MorphMesh[] = [];
    model.traverse((o) => {
      const m = o as MorphMesh;
      if (m.isMesh && m.morphTargetDictionary && m.morphTargetInfluences) morphMeshes.push(m);
    });
    const setMorph = (name: string, value: number) => {
      for (const m of morphMeshes) {
        const i = m.morphTargetDictionary[name];
        if (i !== undefined) m.morphTargetInfluences[i] = value;
      }
    };
    const hasMorph = (name: string) => morphMeshes.some((m) => m.morphTargetDictionary[name] !== undefined);

    // Blinking works automatically if the model has blink shapes (ARKit names or "eyesClosed").
    const blinkNames = ["eyeBlinkLeft", "eyeBlinkRight", "eyesClosed"].filter(hasMorph);

    // Bones, with their rest pose so motion is always relative to it.
    const bone = (name: string) => {
      const b = model.getObjectByName(name);
      return b ? { obj: b, rest: b.quaternion.clone() } : null;
    };
    const head = bone("Head");
    const neck = bone("Neck");
    const spine = bone("Spine2");
    const eyes = [bone("LeftEye"), bone("RightEye")].filter(Boolean) as { obj: THREE.Object3D; rest: THREE.Quaternion }[];

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.3 : 1;

    // Pointer, in -1..1 relative to the avatar.
    const pointer = { x: 0, y: 0, active: false };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      pointer.y = THREE.MathUtils.clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
      pointer.active = true;
    };
    window.addEventListener("pointermove", onPointer);

    // Animation state.
    const weights: Record<string, number> = Object.fromEntries(VISEMES.map((v) => [v, 0]));
    let segIndex = 0;
    let lastAudio: HTMLAudioElement | null = null;
    let nextBlink = performance.now() / 1000 + rand(1.5, 4);
    let blinkStart = -1;
    let doubleBlink = false;
    let nextSaccade = 0;
    const saccade = { x: 0, y: 0 };
    const eyeLook = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    let nod = 0;
    let nodVel = 0;
    let wordIndex = 0;
    let talk = 0; // 0..1 how much it's speaking right now

    const euler = new THREE.Euler();
    const q = new THREE.Quaternion();
    const applyBone = (b: { obj: THREE.Object3D; rest: THREE.Quaternion } | null, x: number, y: number, z: number) => {
      if (!b) return;
      euler.set(x, y, z, "YXZ");
      b.obj.quaternion.copy(b.rest).multiply(q.setFromEuler(euler));
    };

    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const now = performance.now() / 1000;

      // ---------- Lip-sync ----------
      // Only animate the reply that is actually current (not one that was stopped).
      const audio = voiceBus.current() === speech.audio ? speech.audio : null;
      const speaking = !!audio && !audio.paused && !audio.ended;
      if (audio !== lastAudio) {
        lastAudio = audio;
        segIndex = 0;
        wordIndex = 0;
      }
      const targets: Record<string, number> = Object.fromEntries(VISEMES.map((v) => [v, 0]));
      if (speaking) {
        const at = audio!.currentTime;
        const segs = speech.schedule;
        while (segIndex < segs.length - 1 && segs[segIndex].end <= at) segIndex++;
        const seg = segs[segIndex];
        if (seg && at >= seg.start && at < seg.end) {
          targets[seg.viseme] = STRENGTH[seg.viseme];
          // Coarticulation: start shaping the next sound in the last third of this one.
          const next = segs[segIndex + 1];
          const p = (at - seg.start) / (seg.end - seg.start);
          if (next && next.start - seg.end < 0.05 && p > 0.66) {
            const blend = (p - 0.66) / 0.34;
            targets[seg.viseme] *= 1 - blend * 0.5;
            targets[next.viseme] = Math.max(targets[next.viseme], STRENGTH[next.viseme] * blend * 0.5);
          }
        } else {
          targets.sil = 1; // between words
        }
      } else {
        targets.sil = 1;
      }
      for (const v of VISEMES) {
        // Open fast, release a bit slower: snappy but smooth.
        const speed = targets[v] > weights[v] ? 28 : 16;
        weights[v] = damp(weights[v], targets[v], speed, dt);
        setMorph(`viseme_${v}`, weights[v]);
      }
      talk = damp(talk, speaking ? 1 : 0, 4, dt);

      // ---------- Blinking (only if the model has blink shapes) ----------
      if (blinkNames.length) {
        if (blinkStart < 0 && now >= nextBlink) {
          blinkStart = now;
          doubleBlink = Math.random() < 0.15;
        }
        let blink = 0;
        if (blinkStart >= 0) {
          const p = (now - blinkStart) / 0.16; // ~160ms blink
          blink = p < 1 ? Math.sin(Math.PI * p) : 0;
          if (p >= 1) {
            if (doubleBlink) {
              doubleBlink = false;
              blinkStart = now + 0.08;
            } else {
              blinkStart = -1;
              nextBlink = now + rand(2.2, 5.5);
            }
          }
        }
        blinkNames.forEach((n) => setMorph(n, blink));
      }

      // ---------- Eyes: small quick glances + follow the pointer ----------
      if (now >= nextSaccade) {
        saccade.x = rand(-0.06, 0.06);
        saccade.y = rand(-0.035, 0.035);
        nextSaccade = now + rand(0.8, 2.6);
      }
      const px = pointer.active ? pointer.x : 0;
      const py = pointer.active ? pointer.y : 0;
      eyeLook.x = damp(eyeLook.x, saccade.x + px * 0.18, 30, dt);
      eyeLook.y = damp(eyeLook.y, saccade.y + py * 0.1, 30, dt);
      eyes.forEach((e) => applyBone(e, eyeLook.y, eyeLook.x, 0));

      // ---------- Head: idle sway, look at pointer, nods while speaking ----------
      look.x = damp(look.x, px * 0.28, 3, dt);
      look.y = damp(look.y, py * 0.12, 3, dt);

      // Nod on longer words: a little spring kicked at each word start.
      if (speaking) {
        const at = audio!.currentTime;
        const starts = speech.wordStarts;
        while (wordIndex < starts.length && starts[wordIndex] <= at) {
          if (Math.random() < 0.45) nodVel += rand(0.35, 0.7);
          wordIndex++;
        }
      }
      nodVel += (-nod * 120 - nodVel * 14) * dt; // damped spring back to rest
      nod += nodVel * dt;

      const yaw = (0.035 * Math.sin(t * 0.47) + 0.015 * Math.sin(t * 1.31) + look.x + talk * 0.02 * Math.sin(t * 2.1)) * calm;
      const pitch =
        (0.018 * Math.sin(t * 0.71) + look.y + nod * 0.06 + talk * 0.012 * Math.sin(t * 5.3)) * calm;
      const roll = (0.012 * Math.sin(t * 0.39) + talk * 0.01 * Math.sin(t * 1.7)) * calm;

      applyBone(neck, pitch * 0.4, yaw * 0.4, roll * 0.4);
      applyBone(head, pitch * 0.6, yaw * 0.6, roll * 0.6);
      applyBone(spine, 0.008 * Math.sin(t * 1.6) * calm, 0, 0); // breathing

      // ---------- Environment ----------
      for (let i = 0; i < COUNT; i++) {
        const iy = i * 3 + 1;
        pos[iy] += speed[i] * dt * calm;
        if (pos[iy] > HEAD.y + 1.1) pos[iy] = HEAD.y - 1.1; // wrap to the bottom
        pos[i * 3] += Math.sin(t * 0.3 + phase[i]) * 0.0006 * calm;
      }
      partGeo.attributes.position.needsUpdate = true;
      haloMat.opacity = 0.22 + talk * 0.15 + 0.03 * Math.sin(t * 1.2);
      halo.scale.setScalar(0.85 + talk * 0.06);

      // Parallax: the camera drifts slightly with the pointer, so the backdrop moves more than the character.
      camera.position.x = damp(camera.position.x, px * 0.05 * calm, 2.5, dt);
      camera.position.y = damp(camera.position.y, 1.7 - py * 0.025 * calm, 2.5, dt);
      camera.lookAt(0, 1.7, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.remove(model);
      themeObserver.disconnect();
      dome.geometry.dispose();
      domeMat.dispose();
      partGeo.dispose();
      partMat.dispose();
      haloMat.dispose();
      dot.dispose();
      renderer.dispose();
    };
  }, [model]);

  return (
    <canvas
      ref={canvasRef}
      className={`
        h-auto aspect-square rounded-full border-2 border-gray-300
        transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.1)]
        ${compact ? "!w-12 !border" : device !== "mobile" ? "w-[min(26vh,220px)]" : "w-[min(22vh,180px)] sm:w-[min(24vh,220px)]"}
        bg-[radial-gradient(circle_at_50%_50%,_rgb(var(--n-100))_0%,_rgb(var(--n-200))_100%)]
        hover:shadow-[0_15px_40px_rgba(72,156,147,0.25)]
      `}
    />
  );
};

export default VoiceBot;
