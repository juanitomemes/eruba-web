"use client";

import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import TriconeBit from "./TriconeBit";
import Ground from "./Ground";
import SceneLighting from "./SceneLighting";
import SceneCamera from "./SceneCamera";
import SceneErrorBoundary from "./SceneErrorBoundary";

interface DrillingSceneProps {
  progressRef: RefObject<number>;
  isCompact?: boolean;
  onWebGLError?: (error: Error) => void;
}

export default function DrillingScene({
  progressRef,
  isCompact = false,
  onWebGLError,
}: DrillingSceneProps) {
  return (
    <div className="h-full w-full bg-neutral-950" aria-hidden="true">
      <SceneErrorBoundary onError={onWebGLError}>
        <Canvas
          camera={{
            position: [4, 2.2, 6],
            fov: 38,
            near: 0.1,
            far: 1000,
          }}
          dpr={isCompact ? [1, 1.25] : [1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          shadows
        >
          <SceneLighting progressRef={progressRef} isCompact={isCompact} />
          <SceneCamera progressRef={progressRef} isCompact={isCompact} />
          <Ground progressRef={progressRef} />
          <TriconeBit progressRef={progressRef} />
          {/* Local HDRI reflection environment */}
          <Environment files="/environments/studio.hdr" />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
