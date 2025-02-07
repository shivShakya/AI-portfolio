import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface ThreeJSModelViewerProps {
  modelUrl: string;
}

const VoiceBot: React.FC<ThreeJSModelViewerProps> = ({ modelUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set up the scene
    const scene = new THREE.Scene();

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 0.6;
    camera.position.y = 1.7;

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, 1);

    const ambientLight = new THREE.AmbientLight(0x404040, 4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight.position.set(0.069, 1.748, 1.586);
    scene.add(directionalLight);

    const hemesphereLight = new THREE.HemisphereLight("#00AAFF", "#FFAA00" , 4);
    hemesphereLight.position.set(0.000 , 1.538 , 0.000);
    scene.add(hemesphereLight);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf: { scene: THREE.Object3D<THREE.Object3DEventMap>; }) => {
        scene.add(gltf.scene);
        gltf.scene.position.set(0, 0, 0);
        animate();
      },
      undefined,
      (error: any) => {
        console.error('An error occurred while loading the model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    // Handle window resize
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
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="w-56 h-56 rounded-full object-cover border border-black"
    />
  );
};

export default VoiceBot;
