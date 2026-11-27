/**
 * Centralized narrative timeline definitions and progress remapping for Eru-BA Drilling Experience.
 *
 * Coordinates multi-chapter narrative progression:
 * 01. Hero [implemented]
 * 02. Inicio del pozo [implemented]
 * 03. El subsuelo [implemented]
 * 04. Ingeniería aplicada [current]
 * 05. Servicios [future]
 * 06. El acuífero [future]
 */

export type ChapterId = "hero" | "intro" | "subsurface" | "engineering";

export const CHAPTER_IDS: readonly ChapterId[] = [
  "hero",
  "intro",
  "subsurface",
  "engineering",
] as const;

export const TIMELINE_BOUNDARIES = {
  /** Global progress endpoint for legacy chapters 01-03 choreography */
  legacyEnd: 0.75,
  /** Global progress start for chapter 04 (Engineering) */
  engineeringStart: 0.75,
  /** Global progress end for chapter 04 (Engineering) */
  engineeringEnd: 1.0,
} as const;

/**
 * Legacy narrative ranges defined in legacy progress domain [0, 1].
 */
export const LEGACY_NARRATIVE_RANGES = {
  heroFade: { start: 0.158, end: 0.259 },
  introReveal: { start: 0.281, end: 0.368 },
  introConclusion: { start: 0.468, end: 0.562 },
  introExit: { start: 0.72, end: 0.795 },
  subsurfaceReveal: { start: 0.795, end: 0.875 },
} as const;

/**
 * Global timeline visual transition ranges for chapter overlays.
 */
export const GLOBAL_TRANSITION_RANGES = {
  subsurfaceExit: { start: 0.74, end: 0.78 },
  engineeringEnter: { start: 0.78, end: 0.85 },
  engineeringExit: { start: 1.0, end: 1.0 }, // Reserved for future chapter 05 extension
} as const;

/**
 * Local engineering progress [0, 1] reveal ranges for technical annotations.
 */
export const ANNOTATION_REVEAL_RANGES = {
  planning: { start: 0.2, end: 0.3 },
  analysis: { start: 0.35, end: 0.45 },
  control: { start: 0.5, end: 0.6 },
  supervision: { start: 0.65, end: 0.75 },
} as const;

/**
 * Accessibility active chapter thresholds (governs aria-hidden and inert).
 */
export const ACCESSIBILITY_CHAPTER_THRESHOLDS = {
  hero: { min: 0.0, max: 0.195 },
  intro: { min: 0.195, max: 0.57 },
  subsurface: { min: 0.57, max: 0.78 },
  engineering: { min: 0.78, max: 1.0 },
} as const;

export interface NarrativeTimelineChapterConfig {
  id: ChapterId;
  name: string;
  wireframeRange: readonly [number, number];
  globalActiveRange: readonly [number, number];
}

export const NarrativeTimeline: Record<ChapterId, NarrativeTimelineChapterConfig> = {
  hero: {
    id: "hero",
    name: "Hero",
    wireframeRange: [0.0, 0.15],
    globalActiveRange: [0.0, 0.195],
  },
  intro: {
    id: "intro",
    name: "Inicio del pozo",
    wireframeRange: [0.15, 0.27],
    globalActiveRange: [0.195, 0.57],
  },
  subsurface: {
    id: "subsurface",
    name: "El subsuelo",
    wireframeRange: [0.27, 0.43],
    globalActiveRange: [0.57, 0.78],
  },
  engineering: {
    id: "engineering",
    name: "Ingeniería aplicada",
    wireframeRange: [0.43, 0.61],
    globalActiveRange: [0.78, 1.0],
  },
};

const clamp01 = (val: number) => Math.min(1, Math.max(0, val));

export const interval = (progress: number, start: number, end: number): number =>
  end <= start
    ? progress >= end
      ? 1
      : 0
    : Math.max(0, Math.min(1, (progress - start) / (end - start)));

/**
 * Remaps global normalized progress [0, 1] into legacy progress domain [0, 1].
 * For p >= legacyEnd (0.75), clamps strictly to 1.0 to freeze legacy 3D motion at its endpoint.
 */
export function getLegacyProgress(globalProgress: number): number {
  if (globalProgress <= 0) return 0;
  if (globalProgress >= TIMELINE_BOUNDARIES.legacyEnd) return 1;
  return clamp01(globalProgress / TIMELINE_BOUNDARIES.legacyEnd);
}

/**
 * Computes local normalized progress [0, 1] for Chapter 04 (Engineering).
 * Returns 0 before the engineering chapter begins, smoothly interpolates 0 -> 1 across the chapter.
 */
export function getEngineeringProgress(globalProgress: number): number {
  if (globalProgress <= TIMELINE_BOUNDARIES.engineeringStart) return 0;
  if (globalProgress >= TIMELINE_BOUNDARIES.engineeringEnd) return 1;
  return clamp01(
    (globalProgress - TIMELINE_BOUNDARIES.engineeringStart) /
      (TIMELINE_BOUNDARIES.engineeringEnd - TIMELINE_BOUNDARIES.engineeringStart)
  );
}

/**
 * Returns the currently active narrative chapter based on global progress.
 * Used for deterministic accessibility state management (aria-hidden and inert).
 */
export function getActiveChapter(globalProgress: number): ChapterId {
  const p = clamp01(globalProgress);
  if (p >= ACCESSIBILITY_CHAPTER_THRESHOLDS.engineering.min) return "engineering";
  if (p >= ACCESSIBILITY_CHAPTER_THRESHOLDS.subsurface.min) return "subsurface";
  if (p >= ACCESSIBILITY_CHAPTER_THRESHOLDS.intro.min) return "intro";
  return "hero";
}

export interface ChapterVisibility {
  heroOpacity: number;
  introOpacity: number;
  conclusionOpacity: number;
  subsurfaceOpacity: number;
  engineeringOpacity: number;
}

/**
 * Computes visual opacity for all narrative chapters based on global progress.
 */
export function getChapterVisibility(globalProgress: number): ChapterVisibility {
  const pGlobal = clamp01(globalProgress);
  const pLegacy = getLegacyProgress(pGlobal);

  const heroOpacity =
    1 -
    interval(
      pLegacy,
      LEGACY_NARRATIVE_RANGES.heroFade.start,
      LEGACY_NARRATIVE_RANGES.heroFade.end
    );

  const introBase =
    interval(
      pLegacy,
      LEGACY_NARRATIVE_RANGES.introReveal.start,
      LEGACY_NARRATIVE_RANGES.introReveal.end
    ) *
    (1 -
      interval(
        pLegacy,
        LEGACY_NARRATIVE_RANGES.introExit.start,
        LEGACY_NARRATIVE_RANGES.introExit.end
      ));

  const conclusionOpacity =
    interval(
      pLegacy,
      LEGACY_NARRATIVE_RANGES.introConclusion.start,
      LEGACY_NARRATIVE_RANGES.introConclusion.end
    ) * introBase;

  const subsurfaceIn = interval(
    pLegacy,
    LEGACY_NARRATIVE_RANGES.subsurfaceReveal.start,
    LEGACY_NARRATIVE_RANGES.subsurfaceReveal.end
  );
  const subsurfaceOut = interval(
    pGlobal,
    GLOBAL_TRANSITION_RANGES.subsurfaceExit.start,
    GLOBAL_TRANSITION_RANGES.subsurfaceExit.end
  );
  const subsurfaceOpacity = subsurfaceIn * (1 - subsurfaceOut);

  const engineeringOpacity = interval(
    pGlobal,
    GLOBAL_TRANSITION_RANGES.engineeringEnter.start,
    GLOBAL_TRANSITION_RANGES.engineeringEnter.end
  );

  return {
    heroOpacity,
    introOpacity: introBase,
    conclusionOpacity,
    subsurfaceOpacity,
    engineeringOpacity,
  };
}
