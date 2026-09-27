"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface TriconeBitProps {
    progress?: number;
}

export default function TriconeBit({
    progress = 0,
}: TriconeBitProps) {
    const { scene } = useGLTF("/models/tricone-bit.glb");
    const groupRef = useRef<THREE.Group>(null);

    const normalizedScene = useMemo(() => {
        const model = scene.clone(true);

        model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color("#55585b"),
                    metalness: 0.82,
                    roughness: 0.32,
                });

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
        const targetSize = 3;
        const scale = targetSize / maxDimension;

        model.scale.setScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);

        return model;
    }, [scene]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        // Rotación ambiental + incremento conforme avanza el scroll
        const rotationSpeed = 0.08 + progress * 1.2;

        groupRef.current.rotation.y += delta * rotationSpeed;

        // Primera prueba de descenso
        groupRef.current.position.y =
            THREE.MathUtils.lerp(0.15, -1.4, progress);
    });

    return (
        <group
            ref={groupRef}
            position={[2.6, 0.15, 0]}
            scale={1.2}
        >
            <primitive object={normalizedScene} />
        </group>
    );
}

useGLTF.preload("/models/tricone-bit.glb");