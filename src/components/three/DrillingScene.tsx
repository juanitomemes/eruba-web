"use client";

import { useEffect, useState, Suspense, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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

/**
 * Listens to unexpected WebGL context loss on the active canvas element.
 * Distinguishes intentional unmount from GPU driver/browser context drops.
 */
function WebGLContextWatcher({
  onWebGLError,
}: {
  onWebGLError?: (error: Error) => void;
}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    let isDisposed = false;

    const handleContextLost = (event: Event) => {
      // Prevent browser default recovery cycle to safely trigger document-level static fallback
      event.preventDefault();
      if (!isDisposed) {
        console.warn("Unexpected WebGL context loss detected.");
        onWebGLError?.(new Error("WebGL context lost"));
      }
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    return () => {
      isDisposed = true;
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
    };
  }, [gl, onWebGLError]);

  return null;
}

export default function DrillingScene({
  progressRef,
  isCompact = false,
  onWebGLError,
}: DrillingSceneProps) {
  const [isVisible, setIsVisible] = useState(() =>
    typeof document !== "undefined" ? !document.hidden : true
  );

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="h-full w-full bg-neutral-950" aria-hidden="true">
      <SceneErrorBoundary onError={onWebGLError}>
        <Canvas
          frameloop={isVisible ? "always" : "never"}
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
          <WebGLContextWatcher onWebGLError={onWebGLError} />
          <SceneLighting progressRef={progressRef} isCompact={isCompact} />
          <SceneCamera progressRef={progressRef} isCompact={isCompact} />
          <Suspense fallback={null}>
            <Ground progressRef={progressRef} />
            <TriconeBit progressRef={progressRef} />
            {/* Local HDRI reflection environment */}
            <Environment files="/environments/studio.hdr" />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
