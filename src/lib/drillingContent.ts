/**
 * Shared editorial content for Eru-BA Drilling Experience.
 * Consumed by both immersive 3D experience and static accessible fallback.
 */

export interface EditorialPillar {
  id: string;
  title: string;
  description: string;
}

export interface DrillingEditorialContent {
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollHint: string;
  };
  intro: {
    eyebrow: string;
    headline: string;
    conclusion: string;
    body: string;
  };
  subsurface: {
    eyebrow: string;
    headline: string;
    body: string;
    technicalDisclaimer: string;
  };
  engineering: {
    id: string;
    eyebrow: string;
    headline: string;
    body: string;
    pillars: readonly EditorialPillar[];
  };
}

export const DRILLING_CONTENT: DrillingEditorialContent = {
  hero: {
    eyebrow: "Ingeniería que llega más profundo",
    title: "Calidad e Ingeniería en",
    titleHighlight: "Perforación de Pozos de Agua Profundos.",
    body: "Experiencia técnica, ingeniería y seguridad aplicadas a proyectos de perforación de pozos de agua en México.",
    ctaPrimary: "Conocer Eru-BA",
    ctaSecondary: "Hablemos de un proyecto",
    scrollHint: "Desliza para iniciar",
  },
  intro: {
    eyebrow: "02 / Filosofía de perforación",
    headline: "Un pozo no comienza con la perforadora.",
    conclusion: "Comienza con ingeniería.",
    body: "El éxito y longevidad de una obra subterránea dependen del análisis hidrogeológico previo, la selección adecuada del tren de perforación y un control riguroso de cada parámetro operativo.",
  },
  subsurface: {
    eyebrow: "03 / El subsuelo",
    headline: "Cada proyecto presenta condiciones diferentes.",
    body: "Comprender lo que ocurre durante la perforación permite tomar mejores decisiones en cada etapa de la obra.",
    technicalDisclaimer:
      "Visualización conceptual de la interacción de perforación; no representa una formación litológica ni un proyecto específico.",
  },
  engineering: {
    id: "engineering",
    eyebrow: "04 / Ingeniería aplicada",
    headline: "La ingeniería orienta cada decisión.",
    body: "El análisis de las condiciones del proyecto, la planeación y el control técnico permiten orientar las decisiones durante la perforación de un pozo de agua.",
    pillars: [
      {
        id: "planning",
        title: "Planeación",
        description: "Definición de criterios y estrategia de trabajo.",
      },
      {
        id: "analysis",
        title: "Análisis",
        description: "Comprensión de las condiciones del proyecto.",
      },
      {
        id: "control",
        title: "Control",
        description: "Seguimiento de parámetros operativos.",
      },
      {
        id: "supervision",
        title: "Supervisión",
        description: "Seguimiento técnico de la ejecución.",
      },
    ],
  },
} as const;
