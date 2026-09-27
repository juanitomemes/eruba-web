"use client";

import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface GroundProps {
  progressRef: RefObject<number>;
}

// Visual cross-section only: these colors and layer boundaries do not
// represent a particular borehole or a geological interpretation.
const SURFACE_Y = -1.7;
const LAYER_HEIGHT = 1.0;
const COLORS = ["#5c5148", "#514b44", "#40413e"];
const CUT_CENTER = 2.6;
const CUT_HALF_WIDTH = 1.35;
const LEFT_END = -0.5;
const RIGHT_END = 5.7;
const FRONT_Z = -0.35;
const BACK_Z = -2.15;

function makeSectionFace(x0: number, x1: number, z: number) {
  const positions: number[] = [];
  const colors: number[] = [];
  const segments = 14;

  const boundary = (layer: number, x: number) =>
    SURFACE_Y - layer * LAYER_HEIGHT +
    (layer > 0 && layer < COLORS.length
      ? 0.055 * Math.sin(x * 2.4 + layer * 1.7)
      : 0);

  const vertex = (
    x: number,
    y: number,
    color: THREE.Color
  ) => {
    positions.push(x, y, z);
    colors.push(color.r, color.g, color.b);
  };

  COLORS.forEach((hex, layer) => {
    const color = new THREE.Color(hex);
    for (let i = 0; i < segments; i++) {
      const a = THREE.MathUtils.lerp(x0, x1, i / segments);
      const b = THREE.MathUtils.lerp(x0, x1, (i + 1) / segments);
      const topA = boundary(layer, a);
      const topB = boundary(layer, b);
      const bottomA = boundary(layer + 1, a);
      const bottomB = boundary(layer + 1, b);

      // Counterclockwise triangles, facing the camera (+Z).
      vertex(a, topA, color);
      vertex(a, bottomA, color);
      vertex(b, bottomB, color);

      vertex(a, topA, color);
      vertex(b, bottomB, color);
      vertex(b, topB, color);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );
  geometry.computeVertexNormals();
  return geometry;
}

export default function Ground({ progressRef }: GroundProps) {
  const groupRef = useRef<THREE.Group>(null);
  const faceMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }), []);
  const edgeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#73665a",
    roughness: 1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }), []);

  const faces = useMemo(() => [
    makeSectionFace(LEFT_END, CUT_CENTER - CUT_HALF_WIDTH, FRONT_Z),
    makeSectionFace(CUT_CENTER + CUT_HALF_WIDTH, RIGHT_END, FRONT_Z),
    makeSectionFace(
      CUT_CENTER - CUT_HALF_WIDTH,
      CUT_CENTER + CUT_HALF_WIDTH,
      BACK_Z
    ),
  ], []);

  useEffect(() => () => {
    faces.forEach((geometry) => geometry.dispose());
    faceMaterial.dispose();
    edgeMaterial.dispose();
  }, [faces, faceMaterial, edgeMaterial]);

  const totalHeight = COLORS.length * LAYER_HEIGHT;
  const topDepth = FRONT_Z - BACK_Z;

  useFrame(() => {
    const p = progressRef.current;
    const reveal = THREE.MathUtils.smoothstep(p, 0.46, 0.62);
    const travel = THREE.MathUtils.smoothstep(p, 0.74, 1) * 1.1;

    if (groupRef.current) {
      groupRef.current.visible = reveal > 0.001;
      // Once the bit has entered, the section moves upwards around it.
      groupRef.current.position.y = travel;
    }
    faceMaterial.opacity = reveal;
    faceMaterial.depthWrite = reveal > 0.995;
    edgeMaterial.opacity = reveal;
    edgeMaterial.depthWrite = reveal > 0.995;
  });

  return (
    <group ref={groupRef} visible={false}>
      {faces.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={faceMaterial} receiveShadow />
      ))}
      {/* A recessed back face; nothing is placed in front of the tricone. */}
      {[CUT_CENTER - CUT_HALF_WIDTH, CUT_CENTER + CUT_HALF_WIDTH].map((x) => (
        <mesh
          key={x}
          position={[x, SURFACE_Y - totalHeight / 2, (FRONT_Z + BACK_Z) / 2]}
          receiveShadow
          material={edgeMaterial}
        >
          <boxGeometry args={[0.055, totalHeight, topDepth]} />
        </mesh>
      ))}
      {[LEFT_END, CUT_CENTER + CUT_HALF_WIDTH].map((x, index) => (
        <mesh
          key={x}
          position={[
            index === 0
              ? (LEFT_END + CUT_CENTER - CUT_HALF_WIDTH) / 2
              : (CUT_CENTER + CUT_HALF_WIDTH + RIGHT_END) / 2,
            SURFACE_Y + 0.013,
            (FRONT_Z + BACK_Z) / 2,
          ]}
          receiveShadow
          material={edgeMaterial}
        >
          <boxGeometry
            args={[
              index === 0
                ? CUT_CENTER - CUT_HALF_WIDTH - LEFT_END
                : RIGHT_END - CUT_CENTER - CUT_HALF_WIDTH,
              0.026,
              topDepth,
            ]}
          />

        </mesh>
      ))}
    </group>
  );
}
