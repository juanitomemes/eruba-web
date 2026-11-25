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
    timelineHeight: "430vh",
  },
  compact: {
    name: "compact",
    isImmersive: true,
    simplify3D: true,
    dprCap: 1.25,
    enableShadows: true,
    timelineHeight: "380vh",
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

/**
 * Checks if WebGL is available in the current environment.
 */
export function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}
