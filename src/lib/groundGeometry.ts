import * as THREE from "three";
import { BOREHOLE_X, SURFACE_Y } from "@/lib/drillingMotion";

/**
 * Open-front 2.5D conceptual geological cutaway section.
 * Illustrative architectural model for engineering context;
 * does not represent real geological lithology, borehole diameter or project data.
 */
export const LEFT_END = -0.65;
export const RIGHT_END = 5.85;
export const FRONT_Z = -0.25;
export const BACK_Z = -2.1;
export const SHAFT_RADIUS = 1.35;
export const WALL_DEPTH = 1.5;
export const LAYER_HEIGHT = 1.12;

// Refined mineral color palette: earthy, muted, low-saturation tones
export const LAYER_COLORS = ["#625244", "#4a4843", "#333d3e"] as const;

export interface GeometryMetrics {
  vertexCount: number;
  triangleCount: number;
}

type Point = [number, number, number];
type UV = [number, number];

/**
 * Coherent stratigraphic boundary with multi-frequency subtle undulation.
 * Continuous across both banks and around the internal borehole wall.
 */
export function getStratumBoundary(layer: number, x: number): number {
  if (layer === 0) return SURFACE_Y;
  const numLayers = LAYER_COLORS.length;
  if (layer === numLayers) {
    return SURFACE_Y - numLayers * LAYER_HEIGHT;
  }

  // Harmonic organic undulation: subtle, continuous, non-exaggerated
  const primaryWave = 0.038 * Math.sin(x * 1.85 + layer * 1.42);
  const secondaryWave = 0.014 * Math.cos(x * 3.6 + layer * 2.1);
  return SURFACE_Y - layer * LAYER_HEIGHT + primaryWave + secondaryWave;
}

/**
 * Generates the conceptual cutaway BufferGeometry with:
 * - Seamless open frontal cut
 * - Curved borehole wall with matching stratigraphic boundaries
 * - Solid side return walls and top caps
 * - Full UV coordinates for procedural bump mapping
 * - Per-vertex mineral colors and calculated normals
 */
export function makeCutawayGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];

  const totalWidth = RIGHT_END - LEFT_END;
  const totalDepth = Math.abs(BACK_Z - FRONT_Z);
  const bottomY = SURFACE_Y - LAYER_COLORS.length * LAYER_HEIGHT;
  const totalHeight = Math.abs(SURFACE_Y - bottomY);

  function addVertex(p: Point, c: THREE.Color, uv: UV) {
    positions.push(p[0], p[1], p[2]);
    colors.push(c.r, c.g, c.b);
    uvs.push(uv[0], uv[1]);
  }

  function addQuad(
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point,
    color: THREE.Color,
    uv0: UV,
    uv1: UV,
    uv2: UV,
    uv3: UV
  ) {
    // First triangle: p0, p1, p2
    addVertex(p0, color, uv0);
    addVertex(p1, color, uv1);
    addVertex(p2, color, uv2);

    // Second triangle: p0, p2, p3
    addVertex(p0, color, uv0);
    addVertex(p2, color, uv2);
    addVertex(p3, color, uv3);
  }

  // 1. Front cut banks (left and right of the borehole opening)
  function buildFrontBank(xStart: number, xEnd: number, segments: number) {
    LAYER_COLORS.forEach((hex, layer) => {
      const shade = new THREE.Color(hex);
      for (let i = 0; i < segments; i++) {
        const xa = THREE.MathUtils.lerp(xStart, xEnd, i / segments);
        const xb = THREE.MathUtils.lerp(xStart, xEnd, (i + 1) / segments);

        const yTopA = getStratumBoundary(layer, xa);
        const yBotA = getStratumBoundary(layer + 1, xa);
        const yTopB = getStratumBoundary(layer, xb);
        const yBotB = getStratumBoundary(layer + 1, xb);

        const uA = (xa - LEFT_END) / totalWidth;
        const uB = (xb - LEFT_END) / totalWidth;
        const vTopA = (yTopA - bottomY) / totalHeight;
        const vBotA = (yBotA - bottomY) / totalHeight;
        const vTopB = (yTopB - bottomY) / totalHeight;
        const vBotB = (yBotB - bottomY) / totalHeight;

        addQuad(
          [xa, yTopA, FRONT_Z],
          [xa, yBotA, FRONT_Z],
          [xb, yBotB, FRONT_Z],
          [xb, yTopB, FRONT_Z],
          shade,
          [uA, vTopA],
          [uA, vBotA],
          [uB, vBotB],
          [uB, vTopB]
        );
      }
    });
  }

  const bankSegments = 24;
  buildFrontBank(LEFT_END, BOREHOLE_X - SHAFT_RADIUS, bankSegments);
  buildFrontBank(BOREHOLE_X + SHAFT_RADIUS, RIGHT_END, bankSegments);

  // 2. Curved rear wall of the borehole shaft
  // Angle t ranges from 0 (right front edge) to PI (left front edge)
  const shaftArcSteps = 40;
  LAYER_COLORS.forEach((hex, layer) => {
    // Subtle cavity depth modulation: slightly darker for natural ambient occlusion
    const cavityShade = new THREE.Color(hex).multiplyScalar(0.76);

    for (let i = 0; i < shaftArcSteps; i++) {
      const t0 = (i / shaftArcSteps) * Math.PI;
      const t1 = ((i + 1) / shaftArcSteps) * Math.PI;

      const x0 = BOREHOLE_X + SHAFT_RADIUS * Math.cos(t0);
      const x1 = BOREHOLE_X + SHAFT_RADIUS * Math.cos(t1);
      const z0 = FRONT_Z - WALL_DEPTH * Math.sin(t0);
      const z1 = FRONT_Z - WALL_DEPTH * Math.sin(t1);

      // Boundaries match the exact stratigraphic function
      const yTop0 = getStratumBoundary(layer, x0);
      const yBot0 = getStratumBoundary(layer + 1, x0);
      const yTop1 = getStratumBoundary(layer, x1);
      const yBot1 = getStratumBoundary(layer + 1, x1);

      const u0 = (x0 - LEFT_END) / totalWidth;
      const u1 = (x1 - LEFT_END) / totalWidth;
      const vTop0 = (yTop0 - bottomY) / totalHeight;
      const vBot0 = (yBot0 - bottomY) / totalHeight;
      const vTop1 = (yTop1 - bottomY) / totalHeight;
      const vBot1 = (yBot1 - bottomY) / totalHeight;

      addQuad(
        [x0, yTop0, z0],
        [x0, yBot0, z0],
        [x1, yBot1, z1],
        [x1, yTop1, z1],
        cavityShade,
        [u0, vTop0],
        [u0, vBot0],
        [u1, vBot1],
        [u1, vTop1]
      );
    }
  });

  // 3. Lateral return faces (solid volume side walls at LEFT_END and RIGHT_END)
  [LEFT_END, RIGHT_END].forEach((x) => {
    const isLeft = x === LEFT_END;
    LAYER_COLORS.forEach((hex, layer) => {
      const sideShade = new THREE.Color(hex).multiplyScalar(0.82);
      const yTop = getStratumBoundary(layer, x);
      const yBot = getStratumBoundary(layer + 1, x);
      const vTop = (yTop - bottomY) / totalHeight;
      const vBot = (yBot - bottomY) / totalHeight;

      if (isLeft) {
        addQuad(
          [x, yTop, FRONT_Z],
          [x, yBot, FRONT_Z],
          [x, yBot, BACK_Z],
          [x, yTop, BACK_Z],
          sideShade,
          [0, vTop],
          [0, vBot],
          [1, vBot],
          [1, vTop]
        );
      } else {
        addQuad(
          [x, yTop, BACK_Z],
          [x, yBot, BACK_Z],
          [x, yBot, FRONT_Z],
          [x, yTop, FRONT_Z],
          sideShade,
          [0, vTop],
          [0, vBot],
          [1, vBot],
          [1, vTop]
        );
      }
    });
  });

  // 4. Top horizontal ground surface caps
  const capShade = new THREE.Color(LAYER_COLORS[0]).multiplyScalar(0.72);

  // Left bank top cap
  const uLeftStart = 0;
  const uLeftEnd = (BOREHOLE_X - SHAFT_RADIUS - LEFT_END) / totalWidth;
  addQuad(
    [LEFT_END, SURFACE_Y, FRONT_Z],
    [BOREHOLE_X - SHAFT_RADIUS, SURFACE_Y, FRONT_Z],
    [BOREHOLE_X - SHAFT_RADIUS, SURFACE_Y, BACK_Z],
    [LEFT_END, SURFACE_Y, BACK_Z],
    capShade,
    [uLeftStart, 0],
    [uLeftEnd, 0],
    [uLeftEnd, 1],
    [uLeftStart, 1]
  );

  // Right bank top cap
  const uRightStart = (BOREHOLE_X + SHAFT_RADIUS - LEFT_END) / totalWidth;
  const uRightEnd = 1;
  addQuad(
    [BOREHOLE_X + SHAFT_RADIUS, SURFACE_Y, FRONT_Z],
    [RIGHT_END, SURFACE_Y, FRONT_Z],
    [RIGHT_END, SURFACE_Y, BACK_Z],
    [BOREHOLE_X + SHAFT_RADIUS, SURFACE_Y, BACK_Z],
    capShade,
    [uRightStart, 0],
    [uRightEnd, 0],
    [uRightEnd, 1],
    [uRightStart, 1]
  );

  // Rear cap strip behind the borehole opening to ensure solid volume closure
  for (let i = 0; i < shaftArcSteps; i++) {
    const t0 = (i / shaftArcSteps) * Math.PI;
    const t1 = ((i + 1) / shaftArcSteps) * Math.PI;

    const x0 = BOREHOLE_X + SHAFT_RADIUS * Math.cos(t0);
    const x1 = BOREHOLE_X + SHAFT_RADIUS * Math.cos(t1);
    const z0 = FRONT_Z - WALL_DEPTH * Math.sin(t0);
    const z1 = FRONT_Z - WALL_DEPTH * Math.sin(t1);

    const u0 = (x0 - LEFT_END) / totalWidth;
    const u1 = (x1 - LEFT_END) / totalWidth;
    const v0 = (z0 - BACK_Z) / totalDepth;
    const v1 = (z1 - BACK_Z) / totalDepth;

    addQuad(
      [x0, SURFACE_Y, z0],
      [x1, SURFACE_Y, z1],
      [x1, SURFACE_Y, BACK_Z],
      [x0, SURFACE_Y, BACK_Z],
      capShade,
      [u0, v0],
      [u1, v1],
      [u1, 0],
      [u0, 0]
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generates fine CAD/engineering graphic striations highlighting formation divisions.
 * Kept subtle and low-contrast to avoid noise while reinforcing technical precision.
 */
export function makeIllustrativeStriations(): THREE.BufferGeometry {
  const vertices: number[] = [];
  const banks: ReadonlyArray<readonly [number, number]> = [
    [LEFT_END, BOREHOLE_X - SHAFT_RADIUS],
    [BOREHOLE_X + SHAFT_RADIUS, RIGHT_END],
  ];

  for (const [x0, x1] of banks) {
    for (let layer = 0; layer < LAYER_COLORS.length; layer++) {
      const topY = SURFACE_Y - layer * LAYER_HEIGHT;
      for (const fraction of [0.32, 0.65, 0.88]) {
        const baseFractionY = topY - fraction * LAYER_HEIGHT;
        const start = x0 + 0.08;
        const end = x1 - 0.08;
        const segments = 12;

        for (let i = 0; i < segments; i++) {
          const a = THREE.MathUtils.lerp(start, end, i / segments);
          const b = THREE.MathUtils.lerp(start, end, (i + 1) / segments);

          const wave = (x: number) =>
            0.02 * Math.sin(x * 4.8 + layer * 2.6 + fraction * 5.2) +
            0.008 * Math.cos(x * 9.2 + layer * 1.5);

          // Subtle offset in Z to prevent z-fighting with the front face
          vertices.push(a, baseFractionY + wave(a), FRONT_Z + 0.006);
          vertices.push(b, baseFractionY + wave(b), FRONT_Z + 0.006);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

/**
 * Computes the vertex count and triangle count for reporting.
 */
export function computeGeometryMetrics(geometry: THREE.BufferGeometry): GeometryMetrics {
  const positionAttr = geometry.getAttribute("position");
  const vertexCount = positionAttr ? positionAttr.count : 0;
  const triangleCount = geometry.index ? geometry.index.count / 3 : vertexCount / 3;
  return { vertexCount, triangleCount };
}
