/**
 * Visual choreography shared by the bit, cutaway and camera.
 * Scene units and layer transitions are illustrative, never drilling data.
 */
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothStep(progress: number, from: number, to: number) {
  const t = clamp01((progress - from) / (to - from));
  return t * t * (3 - 2 * t);
}

export const SURFACE_Y = -1.7;
export const BOREHOLE_X = 2.6;

// The already approved Hero/entry choreography occupies the first 72%;
// the remaining scroll distance belongs to the subsurface chapter.
export const ENTRY_END = 0.72;

export interface DrillingMotion {
  groundReveal: number;
  approach: number;
  penetration: number;
  cameraBlend: number;
  lightingBlend: number;
  subsurface: number;
  bitY: number;
  terrainY: number;
  scrollRotation: number;
}

let lastProgress = -1;
let cachedMotion: DrillingMotion | null = null;

function computeDrillingMotion(progress: number): DrillingMotion {
  const entry = clamp01(progress / ENTRY_END);
  const subsurface = smoothStep(progress, 0.72, 1);

  const groundReveal = smoothStep(entry, 0.46, 0.62);
  const approach = smoothStep(entry, 0.54, 0.66);
  const penetration = smoothStep(entry, 0.66, 1);
  const cameraBlend = smoothStep(entry, 0.51, 0.87);
  const lightingBlend = smoothStep(entry, 0.48, 0.88);

  // The tool reaches the conceptual surface; the cutaway then travels up
  // around the cutting end to convey the progression through the subsurface.
  const bitY = -0.3 * approach - 0.12 * penetration - 0.03 * subsurface;
  const terrainY = 1.15 * penetration + 1.35 * subsurface;

  return {
    groundReveal,
    approach,
    penetration,
    cameraBlend,
    lightingBlend,
    subsurface,
    bitY,
    terrainY,
    scrollRotation:
      smoothStep(entry, 0.55, 1) * Math.PI * 4 + subsurface * Math.PI * 2,
  };
}

/**
 * Returns the drilling motion curves for a given progress.
 * Caches the last computed frame to avoid duplicate calculations across
 * SceneCamera, SceneLighting, Ground, and TriconeBit within the same frame.
 * Output is frozen and read-only to prevent accidental consumer mutation.
 */
export function getDrillingMotion(progress: number): Readonly<DrillingMotion> {
  if (progress === lastProgress && cachedMotion !== null) {
    return cachedMotion;
  }
  lastProgress = progress;
  cachedMotion = Object.freeze(computeDrillingMotion(progress));
  return cachedMotion;
}
