"use client";

import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface GroundProps {
  progressRef: RefObject<number>;
}

// Conceptual ground surface for the first scroll prototype. This is not
// intended to represent a specific geological formation.
export default function Ground({ progressRef }: GroundProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const reveal = THREE.MathUtils.clamp(
      (progressRef.current - 0.47) / 0.16,
      0,
      1
    );
    if (materialRef.current) {
      materialRef.current.opacity = reveal;
      materialRef.current.depthWrite = reveal > 0.98;
    }
    if (meshRef.current) {
      meshRef.current.visible = reveal > 0;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[2.6, -2.65, 0]}
      receiveShadow
      visible={false}
    >
      <boxGeometry args={[8, 1.5, 5]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#50443c"
        roughness={1}
        metalness={0}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}
