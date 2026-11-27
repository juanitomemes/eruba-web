import * as THREE from "three";

/**
 * Procedural deterministic material and texture system for the conceptual ground section.
 * Generates an in-memory 512x512 mineral albedo texture and correlated bump map.
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

export interface GroundTextures {
  albedoTexture: THREE.CanvasTexture;
  bumpTexture: THREE.CanvasTexture;
}

/**
 * Generates both correlated procedural textures in a single deterministic pass:
 * 1. Albedo modulation map (THREE.SRGBColorSpace)
 * 2. Bump relief map (THREE.NoColorSpace)
 */
export function createGroundTextures(): GroundTextures | null {
  if (typeof document === "undefined") {
    return null;
  }

  const size = 512;
  const albedoCanvas = document.createElement("canvas");
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const albedoCtx = albedoCanvas.getContext("2d");

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext("2d");

  if (!albedoCtx || !bumpCtx) return null;

  const albedoImgData = albedoCtx.createImageData(size, size);
  const bumpImgData = bumpCtx.createImageData(size, size);
  const aData = albedoImgData.data;
  const bData = bumpImgData.data;

  // Fixed seed for 100% visual determinism
  const prng = createDeterministicRandom(42819);

  // Precompute periodic 24x24 multi-octave noise grid for macro and warm/cool variations
  const G = 24;
  const macroGrid = new Float32Array(G * G);
  const warmGrid = new Float32Array(G * G);
  for (let i = 0; i < G * G; i++) {
    macroGrid[i] = prng();
    warmGrid[i] = (prng() - 0.5) * 16;
  }

  const PI2 = Math.PI * 2;
  const sinLut = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    sinLut[i] = Math.sin((i / size) * PI2);
  }

  for (let y = 0; y < size; y++) {
    const v = y / size;
    const gy = v * G;
    const y0 = Math.floor(gy) % G;
    const y1 = (y0 + 1) % G;
    const fy = gy - Math.floor(gy);
    const sy = fy * fy * (3 - 2 * fy);

    for (let x = 0; x < size; x++) {
      const u = x / size;
      const gx = u * G;
      const x0 = Math.floor(gx) % G;
      const x1 = (x0 + 1) % G;
      const fx = gx - Math.floor(gx);
      const sx = fx * fx * (3 - 2 * fx);

      const idx = (y * size + x) * 4;

      // 1. Macro mineral variation (smooth periodic noise)
      const m00 = macroGrid[y0 * G + x0];
      const m10 = macroGrid[y0 * G + x1];
      const m01 = macroGrid[y1 * G + x0];
      const m11 = macroGrid[y1 * G + x1];
      const macro =
        (m00 * (1 - sx) + m10 * sx) * (1 - sy) +
        (m01 * (1 - sx) + m11 * sx) * sy;

      // Subtle warm iron/mineral shifts
      const w00 = warmGrid[y0 * G + x0];
      const w10 = warmGrid[y0 * G + x1];
      const w01 = warmGrid[y1 * G + x0];
      const w11 = warmGrid[y1 * G + x1];
      const warm =
        (w00 * (1 - sx) + w10 * sx) * (1 - sy) +
        (w01 * (1 - sx) + w11 * sx) * sy;

      // 2. Subtle horizontal sedimentary micro-banding
      const lutIdx = Math.floor(u * size * 3) % size;
      const waveU = sinLut[lutIdx] * 0.035;
      const strata =
        Math.sin((v + waveU) * PI2 * 14) * 0.48 +
        Math.sin((v + waveU * 1.6) * PI2 * 28) * 0.28;

      // 3. Clastic / granular micro-texture
      const grain = prng();

      // --- Albedo Texture (neutral high-key modulation for vertex colors) ---
      // Base around 228 (preserves strata differentiation without muddy darkening)
      const baseLuminance =
        228 + (macro - 0.5) * 36 + strata * 15 + (grain - 0.5) * 16;
      const r = Math.max(0, Math.min(255, Math.round(baseLuminance + warm)));
      const g = Math.max(0, Math.min(255, Math.round(baseLuminance + strata * 3)));
      const b = Math.max(0, Math.min(255, Math.round(baseLuminance - warm)));

      aData[idx] = r;
      aData[idx + 1] = g;
      aData[idx + 2] = b;
      aData[idx + 3] = 255;

      // --- Correlated Bump Map (tactile relief matching mineral strata) ---
      // Centers at 128, medium-scale relief gives visible tactile dimension
      const bumpHeight =
        128 + (macro - 0.5) * 64 + strata * 38 + (grain - 0.5) * 26;
      const bH = Math.max(0, Math.min(255, Math.round(bumpHeight)));

      bData[idx] = bH;
      bData[idx + 1] = bH;
      bData[idx + 2] = bH;
      bData[idx + 3] = 255;
    }
  }

  albedoCtx.putImageData(albedoImgData, 0, 0);
  bumpCtx.putImageData(bumpImgData, 0, 0);

  // Configure Albedo Texture
  const albedoTexture = new THREE.CanvasTexture(albedoCanvas);
  albedoTexture.wrapS = THREE.RepeatWrapping;
  albedoTexture.wrapT = THREE.RepeatWrapping;
  albedoTexture.repeat.set(3.5, 2.0);
  albedoTexture.generateMipmaps = true;
  albedoTexture.minFilter = THREE.LinearMipmapLinearFilter;
  albedoTexture.magFilter = THREE.LinearFilter;
  albedoTexture.colorSpace = THREE.SRGBColorSpace;
  albedoTexture.needsUpdate = true;

  // Configure Bump Texture
  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(3.5, 2.0);
  bumpTexture.generateMipmaps = true;
  bumpTexture.minFilter = THREE.LinearMipmapLinearFilter;
  bumpTexture.magFilter = THREE.LinearFilter;
  bumpTexture.colorSpace = THREE.NoColorSpace;
  bumpTexture.needsUpdate = true;

  return { albedoTexture, bumpTexture };
}

export const GROUND_MATERIAL_CONFIG = {
  roughness: 0.92,
  metalness: 0.0,
  bumpScale: 0.09, // Calibrated for visible, tactile mineral relief at scene camera scale
  lineColor: "#9c9284",
  lineOpacityFactor: 0.28, // Refined technical linework harmonized with mineral texture
} as const;
