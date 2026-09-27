"use client";

import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface GroundProps {
  progressRef: RefObject<number>;
}

// Conceptual vertical cross-section, not a representation of real site geology.
// Its front is open and the two banks share continuous horizontal boundaries.
const layerColors = ["#62564b", "#4d4945", "#393d3d"] as const;
const top = -1.65;
const layerHeight = 0.9;
const shaftCenterX = 2.6;
const sideWidth = 2.0;
const sideDepth = 1.6;
const leftX = 0.25;
const rightX = 4.95;
const rearZ = -1.58;

export default function Ground({ progressRef }: GroundProps) {
  const rootRef = useRef<THREE.Group>(null);
  const materials = useMemo(
    () => layerColors.map(
      (color) => new THREE.MeshStandardMaterial({
        color,
        roughness: 0.98,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    ),
    []
  );
  const edgeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#8b7c6d",
      roughness: 1,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    []
  );

  useEffect(() => () => {
    materials.forEach((material) => material.dispose());
    edgeMaterial.dispose();
  }, [materials, edgeMaterial]);

  useFrame(() => {
    const reveal = THREE.MathUtils.smoothstep(progressRef.current, 0.46, 0.62);
    if (rootRef.current) rootRef.current.visible = reveal > 0.001;

    materials.forEach((material) => {
      material.opacity = reveal;
      material.depthWrite = reveal >= 0.999;
    });
    edgeMaterial.opacity = reveal;
    edgeMaterial.depthWrite = reveal >= 0.999;
  });

  return (
    <group ref={rootRef} visible={false}>
      {materials.map((material, index) => {
        const y = top - layerHeight * (index + 0.5);
        return (
          <group key={layerColors[index]}>
            {/* Two uninterrupted banks bordering the open central shaft. */}
            <mesh position={[leftX, y, -0.8]} material={material} receiveShadow>
              <boxGeometry args={[sideWidth, layerHeight, sideDepth]} />
            </mesh>
            <mesh position={[rightX, y, -0.8]} material={material} receiveShadow>
              <boxGeometry args={[sideWidth, layerHeight, sideDepth]} />
            </mesh>
            {/* Recessed back face: no front wall conceals the cutting cones. */}
            <mesh position={[shaftCenterX, y, rearZ]} material={material} receiveShadow>
              <boxGeometry args={[2.7, layerHeight, 0.04]} />
            </mesh>
          </group>
        );
      })}

      {[leftX, rightX].map((x) => (
        <mesh key={x} position={[x, top + 0.012, -0.8]} material={edgeMaterial}>
          <boxGeometry args={[sideWidth, 0.025, sideDepth]} />
        </mesh>
      ))}
      {/* Light lines visually delimit the shaft's inner edges. */}
      {[1.25, 3.95].map((x) => (
        <mesh
          key={x}
          position={[x, top - (layerHeight * 3) / 2, 0.015]}
          material={edgeMaterial}
        >
          <boxGeometry args={[0.024, layerHeight * 3, 0.025]} />
        </mesh>
      ))}
    </group>
  );
}
