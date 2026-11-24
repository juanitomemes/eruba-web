"use client";

import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { getDrillingMotion } from "@/lib/drillingMotion";

interface SceneLightingProps {
  progressRef: RefObject<number>;
}

/**
 * Dynamic lighting system for the Drilling Experience:
 * - Hero Stage: Preserves the approved corporate metallic reflection profile.
 * - Subsurface Stage: Shifts gradually to directional, grazing illumination that accentuates
 *   the mineral relief and cavity depth while eliminating flat, washed-out shadows.
 */
export default function SceneLighting({ progressRef }: SceneLightingProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const grazingLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const motion = getDrillingMotion(progressRef.current);
    const blend = motion.lightingBlend;

    // Ambient light: 0.8 (Hero) -> 0.46 (Subsurface)
    // Decreasing ambient prevents washed-out terrain and heightens sculptural cavity depth.
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.8, 0.46, blend);
    }

    // Key directional light: 5.0 (Hero) -> 4.2 (Subsurface)
    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.lerp(5.0, 4.2, blend);
    }

    // Fill directional light: 1.7 (Hero) -> 1.35 (Subsurface)
    if (fillLightRef.current) {
      fillLightRef.current.intensity = THREE.MathUtils.lerp(1.7, 1.35, blend);
    }

    // Main Spot light: 8.0 (Hero) -> 5.5 (Subsurface)
    if (spotLightRef.current) {
      spotLightRef.current.intensity = THREE.MathUtils.lerp(8.0, 5.5, blend);
    }

    // Raking / Grazing directional light: 0.0 (Hero) -> 2.4 (Subsurface)
    // Low-angle grazing light catches the procedural mineral bump map and internal curved borehole wall.
    if (grazingLightRef.current) {
      grazingLightRef.current.intensity = THREE.MathUtils.lerp(0.0, 2.4, blend);
    }
  });

  return (
    <>
      {/* Base ambient illumination */}
      <ambientLight ref={ambientRef} intensity={0.8} />

      {/* Primary Key light with soft shadow mapping */}
      <directionalLight
        ref={keyLightRef}
        position={[5, 6, 5]}
        intensity={5}
        castShadow
        shadow-bias={-0.0004}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />

      {/* Fill directional light from left */}
      <directionalLight
        ref={fillLightRef}
        position={[-3, 1, 4]}
        intensity={1.7}
      />

      {/* Hero spot light focused on the bit */}
      <spotLight
        ref={spotLightRef}
        position={[4, 5, 6]}
        intensity={8}
        angle={0.5}
        penumbra={0.7}
      />

      {/* Subtle grazing directional light for subterranean mineral tactile relief */}
      <directionalLight
        ref={grazingLightRef}
        position={[5.5, 2.0, 3.2]}
        intensity={0}
      />
    </>
  );
}
