"use client";

import { useRef, type RefObject, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  ENGINEERING_ANNOTATIONS,
  type ProjectedAnnotationsMap,
} from "@/lib/engineeringAnnotations";

interface SceneAnnotationBridgeProps {
  engineeringProgressRef: RefObject<number>;
  projectedCoordsRef: MutableRefObject<ProjectedAnnotationsMap>;
  onProjectionUpdate?: () => void;
}

/**
 * Bridge component mounted inside the persistent Three.js Canvas.
 * Projects conceptual 3D anchor positions into 2D viewport pixel coordinates
 * for the HTML/SVG technical overlay.
 *
 * Characteristics:
 * - Reuses single Vector3 instance (zero heap allocations per frame).
 * - Avoids React state churn by updating a shared mutable coordinates ref.
 * - Disables projection when engineering chapter is not active and size hasn't changed.
 * - Detects points behind camera or outside view frustum.
 */
export default function SceneAnnotationBridge({
  engineeringProgressRef,
  projectedCoordsRef,
  onProjectionUpdate,
}: SceneAnnotationBridgeProps) {
  const { camera, size } = useThree();
  const tempVec = useRef(new THREE.Vector3());
  const prevSize = useRef({ width: 0, height: 0 });

  useFrame(() => {
    if (!projectedCoordsRef.current) return;

    const engP = engineeringProgressRef.current ?? 0;
    const sizeChanged =
      size.width !== prevSize.current.width ||
      size.height !== prevSize.current.height;

    if (sizeChanged) {
      prevSize.current.width = size.width;
      prevSize.current.height = size.height;
    }

    // Skip heavy projection calculations when engineering chapter is inactive and viewport hasn't resized
    if (engP <= 0 && !sizeChanged) return;

    let hasChanged = false;
    const targetMap = projectedCoordsRef.current;

    for (let i = 0; i < ENGINEERING_ANNOTATIONS.length; i++) {
      const annotation = ENGINEERING_ANNOTATIONS[i];
      const anchor = annotation.anchor3D;

      tempVec.current.set(anchor.x, anchor.y, anchor.z);
      tempVec.current.project(camera);

      // Check if point is in front of camera plane (-1 < z < 1 in NDC)
      const isInFront = tempVec.current.z > -1 && tempVec.current.z < 1;
      const isWithinBounds =
        tempVec.current.x >= -1.25 &&
        tempVec.current.x <= 1.25 &&
        tempVec.current.y >= -1.25 &&
        tempVec.current.y <= 1.25;

      const isVisible = isInFront && isWithinBounds;

      // Convert NDC [-1, 1] to Canvas local pixel coordinates
      const screenX = ((tempVec.current.x + 1) / 2) * size.width;
      const screenY = ((1 - tempVec.current.y) / 2) * size.height;

      const current = targetMap[annotation.id];
      if (
        !current ||
        Math.abs(current.x - screenX) > 0.5 ||
        Math.abs(current.y - screenY) > 0.5 ||
        current.visible !== isVisible
      ) {
        targetMap[annotation.id] = {
          x: Math.round(screenX * 10) / 10,
          y: Math.round(screenY * 10) / 10,
          visible: isVisible,
        };
        hasChanged = true;
      }
    }

    if (hasChanged && onProjectionUpdate) {
      onProjectionUpdate();
    }
  });

  return null;
}
