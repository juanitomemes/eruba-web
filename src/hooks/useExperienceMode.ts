"use client";

import { useSyncExternalStore, useState, useCallback } from "react";
import {
  type ExperienceProfile,
  EXPERIENCE_PROFILES,
  checkWebGLSupport,
  isWebGLSupportProbed,
} from "@/lib/experienceProfiles";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Prioritize accessibility: only probe WebGL2 if user does NOT prefer reduced motion
  if (!reducedMotionQuery.matches) {
    checkWebGLSupport();
  }

  const handlePreferenceChange = () => {
    if (!reducedMotionQuery.matches) {
      checkWebGLSupport();
    }
    callback();
  };

  window.addEventListener("resize", callback, { passive: true });
  reducedMotionQuery.addEventListener("change", handlePreferenceChange);

  return () => {
    window.removeEventListener("resize", callback);
    reducedMotionQuery.removeEventListener("change", handlePreferenceChange);
  };
}

function getSnapshot(): ExperienceProfile {
  if (typeof window === "undefined") {
    return "desktop";
  }

  // 1. Accessibility priority: check reduced motion first without GPU probing
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "static";
  }

  // 2. Pure cached read: never allocate probe context inside getSnapshot
  // If already probed and unsupported, fall back to static
  if (isWebGLSupportProbed() && !checkWebGLSupport()) {
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
    manualFallback,
    triggerFallback,
  };
}
