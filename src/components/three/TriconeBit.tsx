"use client";

import type { RefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getDrillingMotion } from "@/lib/drillingMotion";

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

    const progress = progressRef.current;
    const motion = getDrillingMotion(progress);

    if (progress < 0.22) {
      ambientAngleRef.current += Math.min(delta, 0.05) * 0.08;
    }
    group.rotation.y = ambientAngleRef.current + motion.scrollRotation;
    group.position.y = motion.bitY;
  });

  return (
    <group ref={groupRef} position={[2.6, 0, 0]} scale={0.94}>
      {/* The CAD import points upward; flip the centered geometry so the cones face down. */}
      <group rotation={[0, 0, Math.PI]}>
        <primitive object={normalizedScene} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/tricone-bit.glb");
