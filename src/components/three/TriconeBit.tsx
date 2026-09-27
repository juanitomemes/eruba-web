"use client";

import type { RefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface TriconeBitProps {
  progressRef: RefObject<number>;
}

export default function TriconeBit({ progressRef }: TriconeBitProps) {
  const { scene } = useGLTF("/models/tricone-bit.glb");
  const groupRef = useRef<THREE.Group>(null);
  const ambientAngleRef = useRef(0);

  const normalizedScene = useMemo(() => {
    const model = scene.clone(true);
    const steel = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#55585b"),
      metalness: 0.82,
      roughness: 0.32,
    });

    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.material = steel;
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = maxDimension > 0 ? 3 / maxDimension : 1;
    model.scale.setScalar(scale);
    model.position.copy(center).multiplyScalar(-scale);
    return model;
  }, [scene]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // The first portion of the experience remains the original hero.
    const drillingProgress = THREE.MathUtils.clamp(
      (progressRef.current - 0.35) / 0.65,
      0,
      1
    );

    ambientAngleRef.current += Math.min(delta, 0.05) * 0.08;
    // The scroll-driven component reverses when the user scrolls upwards.
    group.rotation.y = ambientAngleRef.current + drillingProgress * Math.PI * 4;
    group.position.y = THREE.MathUtils.lerp(0.15, -1.4, drillingProgress);
  });

  return (
    <group ref={groupRef} position={[2.6, 0.15, 0]} scale={1.2}>
      <primitive object={normalizedScene} />
    </group>
  );
}

useGLTF.preload("/models/tricone-bit.glb");
