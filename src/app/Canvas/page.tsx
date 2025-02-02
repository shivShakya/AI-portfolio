"use client";
import { Canvas as ThreeCanvas, useFrame, useThree } from "@react-three/fiber";
import { FirstPersonControls } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import Home2 from "./Home2";

function AppCanvas() {
  const [canMove, setCanMove] = useState(true);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  return (
    <div className="w-screen h-screen">
      <ThreeCanvas
        gl={{ preserveDrawingBuffer: true }}
        style={{ background: "black" }}
        camera={{ position: [0, 53, -10], rotation: [0, Math.PI / 2, 0] }}
      >
        <RaycastCollisionDetection
          canMove={canMove}
          setCanMove={setCanMove}
          raycasterRef={raycasterRef}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Home2 />
        <FirstPersonControls
          movementSpeed={5}
          lookSpeed={0.06}
          lookVertical={false}
          enabled={canMove} 
        />
      </ThreeCanvas>
    </div>
  );
}

type RaycastCollisionDetectionProps = {
  canMove: boolean;
  setCanMove: React.Dispatch<React.SetStateAction<boolean>>;
  raycasterRef: React.RefObject<THREE.Raycaster>;
};

function RaycastCollisionDetection({
  canMove,
  setCanMove,
  raycasterRef,
}: RaycastCollisionDetectionProps) {
  const { camera, scene } = useThree() as { camera: THREE.PerspectiveCamera; scene: THREE.Scene };

  // Raycasting logic to detect collisions
  useFrame(() => {
    if (!canMove) return;

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection); // Get the direction the camera is facing
    const cameraPosition = camera.position.clone();

    raycasterRef.current.set(cameraPosition, cameraDirection.normalize());
    raycasterRef.current.far = 5; // Collision check distance

    // Check for intersections with scene objects
    const intersects = raycasterRef.current.intersectObjects(
      scene.children, // Include all scene objects or filter relevant ones
      true
    );

    if (intersects.length > 0) {
      setCanMove(false); // Stop movement when collision detected
      console.log("Collision detected!", intersects);

      // Allow movement again after a short delay (e.g., 1 second)
      setTimeout(() => {
        setCanMove(true);
      }, 1000);
    }
  });

  return null;
}

export default AppCanvas;
