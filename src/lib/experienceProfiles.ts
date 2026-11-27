/**
 * Centralized experience profiles for Eru-BA Drilling Experience.
 * Coordinates responsive breakpoints, accessibility (reduced motion), and WebGL capabilities.
 */

export type ExperienceProfile = "desktop" | "compact" | "static";

export interface ProfileConfig {
  name: ExperienceProfile;
  isImmersive: boolean;
  simplify3D: boolean;
  dprCap: number;
  enableShadows: boolean;
  timelineHeight: string;
}

export const EXPERIENCE_PROFILES: Record<ExperienceProfile, ProfileConfig> = {
  desktop: {
    name: "desktop",
    isImmersive: true,
    simplify3D: false,
    dprCap: 1.75,
    enableShadows: true,
    timelineHeight: "550vh",
  },
  compact: {
    name: "compact",
    isImmersive: true,
    simplify3D: true,
    dprCap: 1.25,
    enableShadows: true,
    timelineHeight: "480vh",
  },
  static: {
    name: "static",
    isImmersive: false,
    simplify3D: true,
    dprCap: 1.0,
    enableShadows: false,
    timelineHeight: "auto",
  },
};

let cachedWebGLSupport: boolean | null = null;

/**
 * Resets the cached WebGL support check (useful for unit tests or simulations).
 */
export function resetWebGLSupportCache(): void {
  cachedWebGLSupport = null;
}

/**
 * Checks if WebGL2 is available in the current environment and caches the result.
 * Three.js (r163+) requires WebGL2.
 * Allocates a temporary probe canvas only once, releases its context immediately
 * via WEBGL_lose_context if supported, and avoids GPU context leaks.
 */
export function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;

  try {
    if (!window.WebGL2RenderingContext) {
      cachedWebGLSupport = false;
      return false;
    }
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    const hasSupport = Boolean(gl);

    if (gl) {
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
      }
    }

    cachedWebGLSupport = hasSupport;
    return hasSupport;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}

/**
 * Returns true if WebGL support has already been determined without probing.
 */
export function isWebGLSupportProbed(): boolean {
  return cachedWebGLSupport !== null;
}
