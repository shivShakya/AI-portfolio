"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// @ts-ignore
import { GroundProjectedSkybox } from 'three/examples/jsm/objects/GroundProjectedSkybox.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  let model: THREE.Object3D | null = null;
  let isDragging = false;

  const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(-3, 1, 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
   // scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-3, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffa500, 4, 10);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);

    const pointLight3 = new THREE.PointLight(0xffa500, 4, 10);
    pointLight3.position.set(-1, 1, 0);
    scene.add(pointLight3);

    const pointLight2 = new THREE.PointLight(0xffa500, 4, 10);
    pointLight2.position.set(-2, 1, -3);
    scene.add(pointLight2);

    const hemLight = new THREE.HemisphereLight("#B30000", "#66D4EA", 2);
    hemLight.position.set(0, 1, 0);
   // scene.add(hemLight);


    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
    .setDataType(THREE.FloatType) 
    .load("./back2.hdr", function (texture) {
         const envMap = pmremGenerator.fromEquirectangular(texture).texture;

         const skybox = new GroundProjectedSkybox(texture);
         skybox.scale.setScalar(300);
         scene.add(skybox);

         scene.environment = envMap;
         scene.background = envMap; 
         texture.dispose(); 
         pmremGenerator.dispose();
  });

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load("home-opt.glb", (gltf) => {
      model = gltf.scene;
      model.scale.set(0.5,0.5,0.5);
      model.position.set(0, -22, 0);
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(model);
    });

    // Add 10-15 random boxes
const pointLights = [];
for (let i = 0; i < 5; i++) {
  // Create sphere geometry
  const sphereGeometry = new THREE.SphereGeometry(0.05, 32, 32);
  
  // Create a standard material with emissive property
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000, // Base color
    emissive: new THREE.Color(Math.random() * 0xffffff), // Emissive (glow) color
    emissiveIntensity: 1, // Emissive intensity
  });
  
  // Create the mesh
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  
  // Set random position
  sphere.position.set(
    (Math.random() - 0.5) * 40,
    Math.random() * 2,
    (Math.random() - 0.5) * 40
  );
  
  // Enable shadows
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  
  // Add the sphere to the scene
  scene.add(sphere);
  
  // Create a point light at the same position as the sphere
  const pointLight = new THREE.PointLight(sphereMaterial.emissive, 1, 10); // Color, intensity, distance
  pointLight.position.copy(sphere.position);
  scene.add(pointLight);
  
  // Store the point light
  pointLights.push(pointLight);
}


const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // Strength
  0.4, // Radius
  0.85 // Threshold
);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);


    // Handle movement
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          movement.forward = true;
          break;
        case "s":
        case "arrowdown":
          movement.backward = true;
          break;
        case "a":
        case "arrowleft":
          movement.left = true;
          break;
        case "d":
        case "arrowright":
          movement.right = true;
          break;
        case "e":
          movement.up = true;
          break;
        case "q":
          movement.down = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          movement.forward = false;
          break;
        case "s":
        case "arrowdown":
          movement.backward = false;
          break;
        case "a":
        case "arrowleft":
          movement.left = false;
          break;
        case "d":
        case "arrowright":
          movement.right = false;
          break;
        case "e":
          movement.up = false;
          break;
        case "q":
          movement.down = false;
          break;
      }
    };

    // Handle mouse drag for camera rotation
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) isDragging = true;
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) isDragging = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !cameraRef.current) return;
      const camera = cameraRef.current;

      const cameraSensitivity = 0.002;
      let movementX = event.movementX * cameraSensitivity;
      let movementY = event.movementY * cameraSensitivity;

      camera.rotation.y -= movementX;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);



    let collisionPoint: THREE.Vector3 | null = null;
    const raycaster = new THREE.Raycaster();
    const someThreshold = 1.2;
    const directions = [
      new THREE.Vector3(1, 0, 0), // Forward
      new THREE.Vector3(-1, 0, 0), // Backward
      new THREE.Vector3(0, 1, 0), // Up
      new THREE.Vector3(0, -1, 0), // Down
      new THREE.Vector3(0, 0, 1), // Right
      new THREE.Vector3(0, 0, -1) // Left
    ];


    function collisionDetection() {
      let minDistance = Infinity;
      collisionPoint = null;
      
      for (const direction of directions) {
          raycaster.ray.origin.copy(camera.position);
          raycaster.ray.direction.copy(direction.clone().normalize());
      
          const intersects = raycaster.intersectObjects(scene.children, true);
      
          if (intersects.length > 0) {
              const point = intersects[0].point;
              const distance = camera.position.distanceTo(point);
      
              if (distance < minDistance && distance < someThreshold) {
                  minDistance = distance;
                  collisionPoint = point;
              }
          }
      }
      
      return collisionPoint !== null;
      }
      

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      updateCameraPosition();

      if (collisionDetection()) {
        if (collisionPoint) {
            const directionToCollision = collisionPoint.clone().sub(camera.position).normalize();
            const newPosition = collisionPoint.clone().sub(directionToCollision.multiplyScalar(someThreshold));
            camera.position.copy(newPosition);
        }                      
    }
       composer.render();
      renderer.render(scene, camera);
    };

    const updateCameraPosition = () => {
      if (!cameraRef.current) return;
      const camera = cameraRef.current;
      const speed = 0.3;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(direction, camera.up).normalize();

      if (movement.forward) camera.position.addScaledVector(direction, speed);
      if (movement.backward) camera.position.addScaledVector(direction, -speed);
      if (movement.left) camera.position.addScaledVector(right, -speed);
      if (movement.right) camera.position.addScaledVector(right, speed);
      if (movement.up) camera.position.y += speed;
      if (movement.down) camera.position.y -= speed;
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-screen h-screen" />;
};

export default Canvas;
