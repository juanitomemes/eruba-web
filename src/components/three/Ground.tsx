"use client";

import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BOREHOLE_X,
  SURFACE_Y,
  getDrillingMotion,
} from "@/lib/drillingMotion";

interface GroundProps {
  progressRef: RefObject<number>;
}

/**
 * Open-front 2.5D conceptual section:
 * continuous outer ground faces, a curved internal borehole wall and top caps.
 * No real formations, depths, diameters or project measurements are implied.
 */
const LEFT_END = -0.65;
const RIGHT_END = 5.85;
const FRONT_Z = -0.25;
const BACK_Z = -2.1;
const SHAFT_RADIUS = 1.35;
const WALL_DEPTH = 1.5;
const LAYER_HEIGHT = 1.12;
const COLORS = ["#4e463e", "#413f3a", "#303532"] as const;

type Point = [number, number, number];

function makeCutawayGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];

  function point(p: Point, color: THREE.Color) {
    positions.push(p[0], p[1], p[2]);
    colors.push(color.r, color.g, color.b);
  }

  function quad(a: Point, b: Point, c: Point, d: Point, color: THREE.Color) {
    point(a, color);
    point(b, color);
    point(c, color);
    point(a, color);
    point(c, color);
    point(d, color);
  }

  function boundary(layer: number, x: number) {
    if (layer === 0) return SURFACE_Y;
    if (layer === COLORS.length) {
      return SURFACE_Y - layer * LAYER_HEIGHT;
    }
    return (
      SURFACE_Y -
      layer * LAYER_HEIGHT +
      0.045 * Math.sin(x * 2.1 + layer * 1.35)
    );
  }

  function frontBank(x0: number, x1: number) {
    const segments = 18;
    COLORS.forEach((hex, layer) => {
      const shade = new THREE.Color(hex);
      for (let i = 0; i < segments; i++) {
        const a = THREE.MathUtils.lerp(x0, x1, i / segments);
        const b = THREE.MathUtils.lerp(x0, x1, (i + 1) / segments);
        quad(
          [a, boundary(layer, a), FRONT_Z],
          [a, boundary(layer + 1, a), FRONT_Z],
          [b, boundary(layer + 1, b), FRONT_Z],
          [b, boundary(layer, b), FRONT_Z],
          shade
        );
      }
    });
  }

  // Both banks share the exact same formation boundaries.
  frontBank(LEFT_END, BOREHOLE_X - SHAFT_RADIUS);
  frontBank(BOREHOLE_X + SHAFT_RADIUS, RIGHT_END);

  // Curved rear half of the hole. The camera-facing half is deliberately open.
  // The wall is darker than the cut face to make the cavity legible.
  const arcSteps = 32;
  COLORS.forEach((hex, layer) => {
    const shade = new THREE.Color(hex).multiplyScalar(0.72);
    for (let i = 0; i < arcSteps; i++) {
      const t0 = (i / arcSteps) * Math.PI;
      const t1 = ((i + 1) / arcSteps) * Math.PI;
      const x0 = BOREHOLE_X + SHAFT_RADIUS * Math.cos(t0);
      const x1 = BOREHOLE_X + SHAFT_RADIUS * Math.cos(t1);
      const z0 = FRONT_Z - WALL_DEPTH * Math.sin(t0);
      const z1 = FRONT_Z - WALL_DEPTH * Math.sin(t1);

      quad(
        [x0, boundary(layer, x0), z0],
        [x0, boundary(layer + 1, x0), z0],
        [x1, boundary(layer + 1, x1), z1],
        [x1, boundary(layer, x1), z1],
        shade
      );
    }
  });

  // Outer return faces and slim top caps make the terrain a single section.
  [LEFT_END, RIGHT_END].forEach((x) => {
    COLORS.forEach((hex, layer) => {
      const sideShade = new THREE.Color(hex).multiplyScalar(0.83);
      quad(
        [x, boundary(layer, x), FRONT_Z],
        [x, boundary(layer + 1, x), FRONT_Z],
        [x, boundary(layer + 1, x), BACK_Z],
        [x, boundary(layer, x), BACK_Z],
        sideShade
      );
    });
  });

  const capShade = new THREE.Color(COLORS[0]).multiplyScalar(0.7);
  (
    [
      [LEFT_END, BOREHOLE_X - SHAFT_RADIUS],
      [BOREHOLE_X + SHAFT_RADIUS, RIGHT_END],
    ] as const
  ).forEach(([x0, x1]) => {
    quad(
      [x0, SURFACE_Y, FRONT_Z],
      [x1, SURFACE_Y, FRONT_Z],
      [x1, SURFACE_Y, BACK_Z],
      [x0, SURFACE_Y, BACK_Z],
      capShade
    );
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export default function Ground({ progressRef }: GroundProps) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(makeCutawayGeometry, []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame(() => {
    const motion = getDrillingMotion(progressRef.current);
    if (groupRef.current) {
      groupRef.current.visible = motion.groundReveal > 0.001;
      groupRef.current.position.y = motion.terrainY;
    }
    material.opacity = motion.groundReveal;
    material.depthWrite = motion.groundReveal > 0.995;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh geometry={geometry} material={material} receiveShadow />
    </group>
  );
}
