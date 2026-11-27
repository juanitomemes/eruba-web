import { DRILLING_CONTENT, type EditorialPillar } from "@/lib/drillingContent";
import { ANNOTATION_REVEAL_RANGES, interval } from "@/lib/drillingTimeline";

export type AnnotationId = "planning" | "analysis" | "control" | "supervision";

export const ANNOTATION_IDS: readonly AnnotationId[] = [
  "planning",
  "analysis",
  "control",
  "supervision",
] as const;

export interface AnnotationAnchor3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /**
   * Conceptual reference to the scene element.
   * NOTE: Conceptual visual association, not physical hardware sensors or drilling instruments.
   */
  readonly visualReference: string;
}

export interface AnnotationPlacement {
  /** Offset in px from the 2D projected anchor point */
  readonly xOffset: number;
  readonly yOffset: number;
  /** Alignment of text card relative to connector line endpoint */
  readonly align: "left" | "right";
  /** Optional vertical anchor alignment */
  readonly verticalAlign?: "top" | "center" | "bottom";
}

export interface AnnotationConfig {
  readonly id: AnnotationId;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly anchor3D: AnnotationAnchor3D;
  readonly revealRange: readonly [number, number];
  readonly desktopPlacement: AnnotationPlacement;
}

export interface ProjectedPoint2D {
  x: number;
  y: number;
  visible: boolean;
}

export type ProjectedAnnotationsMap = Record<AnnotationId, ProjectedPoint2D>;

const findPillar = (id: AnnotationId): EditorialPillar => {
  const pillar = DRILLING_CONTENT.engineering.pillars.find((p) => p.id === id);
  if (!pillar) {
    throw new Error(`Pillar ${id} not found in DRILLING_CONTENT.engineering.pillars`);
  }
  return pillar;
};

/**
 * Technical annotations configuration for Chapter 04 (Ingeniería aplicada).
 * Connects shared editorial concepts to conceptual 3D scene visual zones.
 */
export const ENGINEERING_ANNOTATIONS: readonly AnnotationConfig[] = [
  {
    id: "planning",
    number: "01",
    title: findPillar("planning").title,
    description: findPillar("planning").description,
    anchor3D: {
      x: 2.6,
      y: 0.35,
      z: 0.0,
      visualReference:
        "Collar superior de la sarta / Criterios de diseño y planeación",
    },
    revealRange: [
      ANNOTATION_REVEAL_RANGES.planning.start,
      ANNOTATION_REVEAL_RANGES.planning.end,
    ],
    desktopPlacement: {
      xOffset: -270,
      yOffset: -45,
      align: "right",
      verticalAlign: "center",
    },
  },
  {
    id: "analysis",
    number: "02",
    title: findPillar("analysis").title,
    description: findPillar("analysis").description,
    anchor3D: {
      x: 1.45,
      y: -0.15,
      z: 0.45,
      visualReference:
        "Frente estratigráfico / Análisis de condiciones litológicas",
    },
    revealRange: [
      ANNOTATION_REVEAL_RANGES.analysis.start,
      ANNOTATION_REVEAL_RANGES.analysis.end,
    ],
    desktopPlacement: {
      xOffset: -280,
      yOffset: 30,
      align: "right",
      verticalAlign: "center",
    },
  },
  {
    id: "control",
    number: "03",
    title: findPillar("control").title,
    description: findPillar("control").description,
    anchor3D: {
      x: 2.85,
      y: -0.55,
      z: -0.15,
      visualReference:
        "Estructura de conos cortadores / Control de parámetros de perforación",
    },
    revealRange: [
      ANNOTATION_REVEAL_RANGES.control.start,
      ANNOTATION_REVEAL_RANGES.control.end,
    ],
    desktopPlacement: {
      xOffset: 120,
      yOffset: -30,
      align: "left",
      verticalAlign: "center",
    },
  },
  {
    id: "supervision",
    number: "04",
    title: findPillar("supervision").title,
    description: findPillar("supervision").description,
    anchor3D: {
      x: 1.75,
      y: -1.05,
      z: 0.35,
      visualReference:
        "Profundidad de avance / Supervisión técnica de la ejecución",
    },
    revealRange: [
      ANNOTATION_REVEAL_RANGES.supervision.start,
      ANNOTATION_REVEAL_RANGES.supervision.end,
    ],
    desktopPlacement: {
      xOffset: 130,
      yOffset: 45,
      align: "left",
      verticalAlign: "center",
    },
  },
] as const;

/**
 * Computes reveal opacity for a specific annotation based on local engineering progress.
 */
export function getAnnotationOpacity(
  annotationId: AnnotationId,
  engineeringProgress: number
): number {
  const config = ENGINEERING_ANNOTATIONS.find((a) => a.id === annotationId);
  if (!config) return 0;
  return interval(
    engineeringProgress,
    config.revealRange[0],
    config.revealRange[1]
  );
}

/**
 * Creates default empty coordinates map for SSR or pre-mount initial states.
 */
export function createDefaultProjectedMap(): ProjectedAnnotationsMap {
  return {
    planning: { x: 0, y: 0, visible: false },
    analysis: { x: 0, y: 0, visible: false },
    control: { x: 0, y: 0, visible: false },
    supervision: { x: 0, y: 0, visible: false },
  };
}
