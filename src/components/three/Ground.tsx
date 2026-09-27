"use client";

import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface GroundProps {
  progressRef: RefObject<number>;
}

// Conceptual cutaway, not a geological or mechanical simulation.
// The front of the borehole is deliberately left open so the bit stays visible.
const layers = [
  { y: -2.05, color: "#66574b" },
  { y: -2.85, color: "#514a43" },
  { y: -3.65, color: "#383b3b" },
] as const;

export default function Ground({ progressRef }: GroundProps) {
  const groundRef = useRef<THREE.Group>(null);

  const materials = useMemo(
    () => layers.map(({ color }) => new THREE.MeshStandardMaterial({
      color,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })),
    []
  );

  const accent = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#827366",
    roughness: 1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }), []);

  useEffect(() => () => {
    materials.forEach((material) => material.dispose());
    accent.dispose();
  }, [materials, accent]);

  useFrame(() => {
    const reveal = THREE.MathUtils.smoothstep(
      progressRef.current,
      0.47,
      0.64
    );
    if (groundRef.current) groundRef.current.visible = reveal > 0.001;
    for (const material of [...materials, accent]) {
      material.opacity = reveal;
      material.depthWrite = reveal > 0.995;
    }
  });

  return (
    <group ref={groundRef} visible={false}>
      {layers.map((layer, i) => (
        <group key={layer.y}>
          {/* Layered banks to either side of an open central borehole. */}
          <mesh position={[0.28, layer.y, -0.6]} receiveShadow material={materials[i]}>
            <boxGeometry args={[1.8, 0.78, 2.1]} />
          </mesh>
          <mesh position={[4.92, layer.y, -0.6]} receiveShadow material={materials[i]}>
            <boxGeometry args={[1.8, 0.78, 2.1]} />
          </mesh>
          {/* Rear wall gives the impression of a vertical section, with no front wall. */}
          <mesh position={[2.6, layer.y, -1.66]} receiveShadow material={materials[i]}>
            <boxGeometry args={[2.86, 0.78, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* Surface edges: a gap remains over the bit, rather than a solid lid. */}
      <mesh position={[0.28, -1.65, -0.6]} material={accent}>
        <boxGeometry args={[1.8, 0.035, 2.12]} />
      </mesh>
      <mesh position={[4.92, -1.65, -0.6]} material={accent}>
        <boxGeometry args={[1.8, 0.035, 2.12]} />
      </mesh>
      {/* Subtle reference lines mark the open shaft in the rear wall. */}
      <mesh position={[1.16, -2.85, -1.60]} material={accent}>
        <boxGeometry args={[0.025, 2.38, 0.025]} />
      </mesh>
      <mesh position={[4.04, -2.85, -1.60]} material={accent}>
        <boxGeometry args={[0.025, 2.38, 0.025]} />
      </mesh>
    </group>
  );
}
