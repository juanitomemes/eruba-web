"use client";

import { useSyncExternalStore, useState, useCallback } from "react";
import {
  type ExperienceProfile,
  EXPERIENCE_PROFILES,
  checkWebGLSupport,
} from "@/lib/experienceProfiles";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  window.addEventListener("resize", callback, { passive: true });
  reducedMotionQuery.addEventListener("change", callback);

  return () => {
    window.removeEventListener("resize", callback);
    reducedMotionQuery.removeEventListener("change", callback);
  };
}

function getSnapshot(): ExperienceProfile {
  if (typeof window === "undefined") {
    return "desktop";
  }

  // 1. WebGL support check
  if (!checkWebGLSupport()) {
    return "static";
  }

  // 2. Reduced motion check
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "static";
  }

  // 3. Compact/mobile breakpoint
  if (window.innerWidth < 1024) {
    return "compact";
  }

  return "desktop";
}

function getServerSnapshot(): ExperienceProfile {
  return "desktop";
}

export function useExperienceMode() {
  const [manualFallback, setManualFallback] = useState(false);
  const detectedProfile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const profile: ExperienceProfile = manualFallback
    ? "static"
    : detectedProfile;

  const triggerFallback = useCallback(() => {
    setManualFallback(true);
  }, []);

  return {
    profile,
    config: EXPERIENCE_PROFILES[profile],
    isDesktop: profile === "desktop",
    isCompact: profile === "compact",
    isStatic: profile === "static",
    triggerFallback,
  };
}
