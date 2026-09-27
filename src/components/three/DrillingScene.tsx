"use client";

import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import TriconeBit from "./TriconeBit";
import Ground from "./Ground";

interface DrillingSceneProps {
  progressRef: RefObject<number>;
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
        <directionalLight position={[-3, 1, 4]} intensity={2.5} />
        <spotLight
          position={[4, 5, 6]}
          intensity={12}
          angle={0.5}
          penumbra={0.7}
        />
        <Ground progressRef={progressRef} />
        <TriconeBit progressRef={progressRef} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
