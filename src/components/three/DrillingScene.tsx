"use client";

import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { getDrillingMotion } from "@/lib/drillingMotion";
import * as THREE from "three";
import TriconeBit from "./TriconeBit";
import Ground from "./Ground";

interface DrillingSceneProps {
  progressRef: RefObject<number>;
}

function CameraFollow({ progressRef }: DrillingSceneProps) {
  const { camera } = useThree();
  const heroPosition = new THREE.Vector3(4, 2.2, 6);
  const heroTarget = new THREE.Vector3(0, 0, 0);

  // A less elevated and more frontal view is needed to read the cutaway,
  // but the target remains right of center to protect the HTML text.
  const sectionPosition = new THREE.Vector3(3.35, 0.55, 9);
  const sectionTarget = new THREE.Vector3(0.65, -0.76, -0.4);

  useFrame(() => {
    const motion = getDrillingMotion(progressRef.current);
    const blend = motion.cameraBlend;
    camera.position.lerpVectors(heroPosition, sectionPosition, blend);
    const focus = heroTarget.clone().lerp(sectionTarget, blend);
    camera.lookAt(focus);
  });

  return null;
}

export default function DrillingScene({ progressRef }: DrillingSceneProps) {
  return (
    <div className="h-full w-full bg-neutral-950">
      <Canvas
        camera={{
          position: [4, 2.2, 6],
          fov: 38,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 6, 5]} intensity={5} />
        <directionalLight position={[-3, 1, 4]} intensity={1.7} />
        <spotLight
          position={[4, 5, 6]}
          intensity={8}
          angle={0.5}
          penumbra={0.7}
        />
        <CameraFollow progressRef={progressRef} />
        <Ground progressRef={progressRef} />
        <TriconeBit progressRef={progressRef} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
