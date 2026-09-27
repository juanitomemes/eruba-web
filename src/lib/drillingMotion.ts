/**
 * Shared visual timeline for the introductory drilling scene.
 *
 * Coordinates are normalized scene units, not drilling measurements.
 * This is an illustrative cutaway, not a geotechnical simulation.
 */
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothStep(progress: number, from: number, to: number) {
  const t = clamp01((progress - from) / (to - from));
  return t * t * (3 - 2 * t);
}

export const SURFACE_Y = -1.7;

export function getDrillingMotion(progress: number) {
  // The unmodified Hero occupies the first portion of the scroll.
  const groundReveal = smoothStep(progress, 0.46, 0.62);
  const approach = smoothStep(progress, 0.54, 0.66);
  const penetration = smoothStep(progress, 0.66, 1);
  const cameraFollow = smoothStep(progress, 0.68, 1);

  // Bit tip initially sits about 0.29 scene units above the ground.
  // It touches the surface at the end of the approach; afterwards
  // ground ascends while the cutting end remains visible in the frame.
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
    cameraOffsetX: cameraFollow * 0.45,
    cameraOffsetY: cameraFollow * -0.9,
  };
}
