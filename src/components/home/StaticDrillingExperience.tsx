"use client";

import Navbar from "@/components/layouts/Navbar";

/**
 * Accessible, static fallback experience for Eru-BA Drilling Consulting.
 * Displayed when:
 * 1. User has enabled 'prefers-reduced-motion'
 * 2. WebGL is unavailable, fails to initialize, or context is lost
 *
 * Provides the complete narrative roadmap in standard document flow without 3D canvas locks.
 */
export default function StaticDrillingExperience() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-white selection:bg-red-600 selection:text-white">
      {/* Top corporate navigation */}
      <Navbar />

      <main>
        {/* Chapter 01: Hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative flex min-h-[90vh] items-center px-6 pt-28 pb-16 lg:px-10 lg:pt-0"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
                Ingeniería que llega más profundo
              </p>
              <div className="mb-6 h-[2px] w-12 bg-red-600" />

              <h1
                id="hero-heading"
                className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Calidad e Ingeniería en{" "}
                <span className="text-white">
                  Perforación de Pozos de Agua Profundos.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 md:text-lg">
                Experiencia técnica, ingeniería y seguridad aplicadas a proyectos
                de perforación de pozos de agua en México.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#experiencia"
                  className="inline-flex items-center justify-center bg-red-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Conocer Eru-BA
                </a>
                <a
                  href="#contacto"
                  className="inline-flex items-center justify-center border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Hablemos de un proyecto
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 02: Inicio del pozo / Filosofía de Ingeniería */}
        <section
          id="experiencia"
          aria-labelledby="intro-heading"
          className="border-t border-neutral-800/80 bg-neutral-900/40 px-6 py-24 lg:px-10"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
                02 / Filosofía de perforación
              </p>
              <div className="mb-6 h-[2px] w-12 bg-red-600" />

              <h2
                id="intro-heading"
                className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl"
              >
                Un pozo no comienza con la perforadora.
              </h2>
              <p className="mt-4 text-2xl font-bold text-red-500 md:text-3xl">
                Comienza con ingeniería.
              </p>
              <p className="mt-6 text-base leading-relaxed text-neutral-300 md:text-lg">
                El éxito y longevidad de una obra subterránea dependen del análisis
                hidrogeológico previo, la selección adecuada del tren de perforación
                y un control riguroso de cada parámetro operativo.
              </p>
            </div>
          </div>
        </section>

        {/* Chapter 03: El subsuelo */}
        <section
          aria-labelledby="subsurface-heading"
          className="border-t border-neutral-800/80 px-6 py-24 lg:px-10"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
                03 / El subsuelo
              </p>
              <div className="mb-6 h-[2px] w-12 bg-red-600" />

              <h2
                id="subsurface-heading"
                className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl"
              >
                Cada proyecto presenta condiciones diferentes.
              </h2>

              <p className="mt-6 text-base leading-relaxed text-neutral-300 md:text-lg">
                Comprender lo que ocurre durante la perforación permite tomar
                mejores decisiones en cada etapa de la obra.
              </p>

              <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                <p className="text-xs leading-relaxed text-neutral-400">
                  <strong className="text-neutral-300">Nota técnica:</strong>{" "}
                  Visualización conceptual de la interacción de perforación; no
                  representa una formación litológica ni un proyecto específico.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
