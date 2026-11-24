"use client";

import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import TriconeBit from "./TriconeBit";
import Ground from "./Ground";
import SceneLighting from "./SceneLighting";
import SceneCamera from "./SceneCamera";

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
        <SceneLighting progressRef={progressRef} />
        <SceneCamera progressRef={progressRef} />
        <Ground progressRef={progressRef} />
        <TriconeBit progressRef={progressRef} />
        {/* Local HDRI reflection environment - eliminates external CDN dependency */}
        <Environment files="/environments/studio.hdr" />
      </Canvas>
    </div>
  );
}
