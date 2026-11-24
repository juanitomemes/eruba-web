"use client";

import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getDrillingMotion } from "@/lib/drillingMotion";
import {
  makeCutawayGeometry,
  makeIllustrativeStriations,
} from "@/lib/groundGeometry";
import {
  createGroundBumpTexture,
  GROUND_MATERIAL_CONFIG,
} from "@/lib/groundMaterials";

interface GroundProps {
  progressRef: RefObject<number>;
}

export default function Ground({ progressRef }: GroundProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => makeCutawayGeometry(), []);
  const striations = useMemo(() => makeIllustrativeStriations(), []);
  const bumpTexture = useMemo(() => createGroundBumpTexture(), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      striations.dispose();
      bumpTexture?.dispose();
    };
  }, [geometry, striations, bumpTexture]);

  useFrame(() => {
    const motion = getDrillingMotion(progressRef.current);
    if (groupRef.current) {
      groupRef.current.visible = motion.groundReveal > 0.001;
      groupRef.current.position.y = motion.terrainY;
    }
    if (materialRef.current) {
      materialRef.current.opacity = motion.groundReveal;
      materialRef.current.depthWrite = motion.groundReveal > 0.995;
    }
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity =
        motion.groundReveal * GROUND_MATERIAL_CONFIG.lineOpacityFactor;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          ref={materialRef}
          vertexColors
          bumpMap={bumpTexture ?? undefined}
          bumpScale={GROUND_MATERIAL_CONFIG.bumpScale}
          side={THREE.DoubleSide}
          roughness={GROUND_MATERIAL_CONFIG.roughness}
          metalness={GROUND_MATERIAL_CONFIG.metalness}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={striations}>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color={GROUND_MATERIAL_CONFIG.lineColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
