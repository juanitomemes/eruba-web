"use client";

import type { RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { getDrillingMotion } from "@/lib/drillingMotion";

interface SceneCameraProps {
  progressRef: RefObject<number>;
}

/**
 * Camera controller for the Drilling Experience:
 * - Hero Framing: Exact approved camera position [4, 2.2, 6] and focus [0, 0, 0].
 * - Section Transition: Transitions smoothly to section view [3.35, 0.55, 9] looking at [0.65, -0.76, -0.4],
 *   shifting the 3D cutaway right-of-center to preserve ample negative space for the narrative HTML text.
 * - Subsurface Descent: Subtly tracks the downward progress of the tool without abrupt zoom or clipping.
 * - Architecture: Encapsulates all mutable vectors inside component-owned refs, avoiding module-global mutable state.
 */
export default function SceneCamera({ progressRef }: SceneCameraProps) {
  const { camera } = useThree();

  const heroPosition = useRef(new THREE.Vector3(4, 2.2, 6));
  const heroFocus = useRef(new THREE.Vector3(0, 0, 0));

  const baseSectionPosition = useRef(new THREE.Vector3(3.35, 0.55, 9));
  const baseSectionFocus = useRef(new THREE.Vector3(0.65, -0.76, -0.4));

  const targetSectionPosition = useRef(new THREE.Vector3());
  const targetSectionFocus = useRef(new THREE.Vector3());

  const currentPosition = useRef(new THREE.Vector3());
  const currentFocus = useRef(new THREE.Vector3());

  useFrame(() => {
    const motion = getDrillingMotion(progressRef.current);
    const blend = motion.cameraBlend;
    const subsurface = motion.subsurface;

    // Subsurface chapter depth refinement:
    // Follow the tool's downward progression subtly, conveying underground depth
    // while keeping the focal center right-of-center to protect readability.
    targetSectionPosition.current.copy(baseSectionPosition.current);
    targetSectionPosition.current.y -= 0.12 * subsurface;
    targetSectionPosition.current.z += 0.15 * subsurface;

    targetSectionFocus.current.copy(baseSectionFocus.current);
    targetSectionFocus.current.y -= 0.16 * subsurface;

    currentPosition.current.lerpVectors(
      heroPosition.current,
      targetSectionPosition.current,
      blend
    );
    currentFocus.current.lerpVectors(
      heroFocus.current,
      targetSectionFocus.current,
      blend
    );

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentFocus.current);
  });

  return null;
}
