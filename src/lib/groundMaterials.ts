import * as THREE from "three";

/**
 * Procedural deterministic material and texture system for the conceptual ground section.
 * Generates an in-memory 512x512 mineral microtexture and bump map.
 * Zero external network requests, zero bundle asset weight, 100% deterministic.
 */

// Mulberry32 deterministic 32-bit pseudo-random number generator
function createDeterministicRandom(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a 512x512 bump texture combining:
 * 1. Broad mineral tonal variation (low frequency)
 * 2. Subtle horizontal sedimentary banding (medium frequency)
 * 3. Granular sand/rock microtexture (high frequency)
 */
export function createGroundBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") {
    return null;
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Fixed seed for 100% visual determinism
  const prng = createDeterministicRandom(42819);

  // Precompute smooth low-frequency noise grid (16x16)
  const gridSize = 16;
  const noiseGrid: number[][] = [];
  for (let gy = 0; gy <= gridSize; gy++) {
    noiseGrid[gy] = [];
    for (let gx = 0; gx <= gridSize; gx++) {
      noiseGrid[gy][gx] = prng();
    }
  }

  function sampleLowFreq(xNorm: number, yNorm: number): number {
    const gx = xNorm * gridSize;
    const gy = yNorm * gridSize;
    const x0 = Math.floor(gx) % gridSize;
    const y0 = Math.floor(gy) % gridSize;
    const x1 = (x0 + 1) % gridSize;
    const y1 = (y0 + 1) % gridSize;
    const fx = gx - Math.floor(gx);
    const fy = gy - Math.floor(gy);

    // Smoothstep interpolation
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const top = noiseGrid[y0][x0] * (1 - sx) + noiseGrid[y0][x1] * sx;
    const bot = noiseGrid[y1][x0] * (1 - sx) + noiseGrid[y1][x1] * sx;
    return top * (1 - sy) + bot * sy;
  }

  for (let y = 0; y < size; y++) {
    const yNorm = y / size;
    // Layer 2: Subtle horizontal sedimentary micro-banding
    const bandWave =
      Math.sin(yNorm * Math.PI * 18) * 0.45 +
      Math.sin(yNorm * Math.PI * 42) * 0.25;

    for (let x = 0; x < size; x++) {
      const xNorm = x / size;
      const idx = (y * size + x) * 4;

      // 1. Low frequency mineral variation
      const macro = sampleLowFreq(xNorm, yNorm);

      // 3. High frequency fine mineral grain
      const grain = prng();

      // Combine layers into neutral grayscale height/bump value (128 centered)
      const baseValue = 128;
      const macroOffset = (macro - 0.5) * 42;
      const bandOffset = bandWave * 16;
      const grainOffset = (grain - 0.5) * 34;

      const gray = Math.max(0, Math.min(255, Math.round(baseValue + macroOffset + bandOffset + grainOffset)));

      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.5, 2.0);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;

  return texture;
}

export const GROUND_MATERIAL_CONFIG = {
  roughness: 0.94,
  metalness: 0.0,
  bumpScale: 0.04,
  lineColor: "#9e9384",
  lineOpacityFactor: 0.35,
} as const;
