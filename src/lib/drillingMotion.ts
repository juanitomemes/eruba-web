/**
 * Visual choreography shared by the bit, cutaway and camera.
 * Scene units are illustrative; they are not geological or drilling data.
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

  // Transition from the original Hero view to the lower, nearly frontal
  // cutting-zone view. All effects use this same scroll progress.
  const cameraBlend = smoothStep(progress, 0.51, 0.87);

  // The tricone first approaches the conceptual surface. Then the cutaway
  // advances upwards around it so that the cutting cones remain in frame.
  const bitY = -0.3 * approach - 0.12 * penetration;
  const terrainY = 1.15 * penetration;

  return {
    groundReveal,
    approach,
    penetration,
    cameraBlend,
    bitY,
    terrainY,
    scrollRotation: smoothStep(progress, 0.55, 1) * Math.PI * 4,
  };
}
