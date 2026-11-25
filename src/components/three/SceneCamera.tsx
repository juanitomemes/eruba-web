"use client";

import type { RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { getDrillingMotion } from "@/lib/drillingMotion";

interface SceneCameraProps {
  progressRef: RefObject<number>;
  isCompact?: boolean;
}

/**
 * Camera controller for the Drilling Experience:
 * - Desktop: Exact approved camera positions ([4, 2.2, 6] Hero, [3.35, 0.55, 9] Section).
 * - Compact / Mobile: Adapts framing based on portrait aspect ratio (w/h < 1.0),
 *   framing the 3D model in the upper visual field to leave room for text without overlap or clipping.
 * - Architecture: Encapsulates all mutable vectors inside component-owned refs.
 */
export default function SceneCamera({ progressRef }: SceneCameraProps) {
  const { camera, size } = useThree();

  const heroPosition = useRef(new THREE.Vector3());
  const heroFocus = useRef(new THREE.Vector3());
  const sectionPosition = useRef(new THREE.Vector3());
  const sectionFocus = useRef(new THREE.Vector3());

  const currentPosition = useRef(new THREE.Vector3());
  const currentFocus = useRef(new THREE.Vector3());

  useFrame(() => {
    const motion = getDrillingMotion(progressRef.current);
    const blend = motion.cameraBlend;
    const subsurface = motion.subsurface;

    const aspect = size.width / Math.max(1, size.height);
    const isPortrait = aspect < 1.0;

    if (isPortrait) {
      // Compact/Mobile: Adjust camera distance and focal point for narrow vertical viewports
      // Place the 3D object in the upper half of the screen
      const zoomFactor = Math.min(1.4, Math.max(1.0, 0.9 / aspect));

      heroPosition.current.set(2.6, 2.1, 6.8 * zoomFactor);
      heroFocus.current.set(2.0, 0.25, 0);

      sectionPosition.current.set(
        2.6,
        0.65 - 0.14 * subsurface,
        8.8 * zoomFactor + 0.15 * subsurface
      );
      sectionFocus.current.set(1.9, -0.65 - 0.18 * subsurface, -0.4);
    } else {
      // Desktop: Exact approved framing preserving left-hand text space and right-hand 3D stage
      heroPosition.current.set(4, 2.2, 6);
      heroFocus.current.set(0, 0, 0);

      sectionPosition.current.set(3.35, 0.55 - 0.12 * subsurface, 9 + 0.15 * subsurface);
      sectionFocus.current.set(0.65, -0.76 - 0.16 * subsurface, -0.4);
    }

    currentPosition.current.lerpVectors(
      heroPosition.current,
      sectionPosition.current,
      blend
    );
    currentFocus.current.lerpVectors(
      heroFocus.current,
      sectionFocus.current,
      blend
    );

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentFocus.current);
  });

  return null;
}
