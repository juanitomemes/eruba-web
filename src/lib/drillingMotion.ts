/**
 * Choreography for the introductory 3D illustration.
 * These are normalized scene units, not borehole dimensions or drilling data.
 */
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothStep(progress: number, from: number, to: number) {
  const t = clamp01((progress - from) / (to - from));
  return t * t * (3 - 2 * t);
}

export const SURFACE_Y = -1.7;
export const BOREHOLE_X = 2.6;

export function getDrillingMotion(progress: number) {
  const groundReveal = smoothStep(progress, 0.46, 0.62);
  const approach = smoothStep(progress, 0.54, 0.66);
  const penetration = smoothStep(progress, 0.66, 1);
  const cameraFollow = smoothStep(progress, 0.68, 1);

  // The tool reaches the conceptual surface first; afterwards the terrain
  // travels upward relative to it, keeping the cutting end visible.
  const bitY = -0.3 * approach - 0.12 * penetration;
  const terrainY = 1.15 * penetration;

  return {
    groundReveal,
    approach,
    penetration,
    cameraFollow,
    bitY,
    terrainY,
    scrollRotation: smoothStep(progress, 0.55, 1) * Math.PI * 4,
    cameraOffsetX: cameraFollow * 0.18,
    cameraOffsetY: cameraFollow * -0.62,
  };
}
