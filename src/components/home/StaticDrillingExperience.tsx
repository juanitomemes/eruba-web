"use client";

import { useEffect, useRef } from "react";
import Navbar from "@/components/layouts/Navbar";
import { DRILLING_CONTENT } from "@/lib/drillingContent";

interface StaticDrillingExperienceProps {
  autoFocusHeading?: boolean;
}

/**
 * Accessible, static fallback experience for Eru-BA Drilling Consulting.
 * Displayed when:
 * 1. User has enabled 'prefers-reduced-motion'
 * 2. WebGL is unavailable, fails to initialize, or context is lost
 *
 * Provides the complete narrative roadmap in standard document flow without 3D canvas locks.
 */
export default function StaticDrillingExperience({
  autoFocusHeading = false,
}: StaticDrillingExperienceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { hero, intro, subsurface, engineering } = DRILLING_CONTENT;

  useEffect(() => {
    if (autoFocusHeading) {
      headingRef.current?.focus();
    }
  }, [autoFocusHeading]);

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white selection:bg-red-600 selection:text-white">
      {/* Top corporate navigation */}
      <Navbar />

      <div className="relative">
        {/* Chapter 01: Hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative flex min-h-[90vh] items-center px-6 pt-28 pb-16 lg:px-10 lg:pt-0"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
                {hero.eyebrow}
              </p>
              <div className="mb-6 h-[2px] w-12 bg-red-600" />

              <h1
                ref={headingRef}
                id="hero-heading"
                tabIndex={-1}
                className="outline-none text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
              >
                {hero.title}{" "}
                <span className="text-white">
                  {hero.titleHighlight}
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 md:text-lg">
                {hero.body}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#experiencia"
                  className="inline-flex items-center justify-center bg-red-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  {hero.ctaPrimary}
                </a>
                <a
                  href="#contacto"
                  className="inline-flex items-center justify-center border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  {hero.ctaSecondary}
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
                {intro.eyebrow}
              </p>
              <div className="mb-6 h-[2px] w-12 bg-red-600" />

              <h2
                id="intro-heading"
                className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl"
              >
                {intro.headline}
              </h2>
              <p className="mt-4 text-2xl font-bold text-red-500 md:text-3xl">
                {intro.conclusion}
              </p>
              <p className="mt-6 text-base leading-relaxed text-neutral-300 md:text-lg">
                {intro.body}
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
                {subsurface.eyebrow}
              </p>
              <div className="mb-6 h-[2px] w-12 bg-red-600" />

              <h2
                id="subsurface-heading"
                className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl"
              >
                {subsurface.headline}
              </h2>

              <p className="mt-6 text-base leading-relaxed text-neutral-300 md:text-lg">
                {subsurface.body}
              </p>

              <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                <p className="text-xs leading-relaxed text-neutral-400">
                  <strong className="text-neutral-300">Nota técnica:</strong>{" "}
                  {subsurface.technicalDisclaimer}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 04: Ingeniería aplicada */}
        <section
          aria-labelledby="engineering-heading"
          className="border-t border-neutral-800/80 bg-neutral-900/40 px-6 py-24 lg:px-10"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
                {engineering.eyebrow}
              </p>
              <div className="mb-6 h-[2px] w-12 bg-red-600" />

              <h2
                id="engineering-heading"
                className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl"
              >
                {engineering.headline}
              </h2>

              <p className="mt-6 text-base leading-relaxed text-neutral-300 md:text-lg">
                {engineering.body}
              </p>

              {/* Four pillars of engineering */}
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {engineering.pillars.map((pillar) => (
                  <div
                    key={pillar.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 transition-colors hover:border-neutral-700"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-red-600" />
                      <h3 className="text-lg font-bold text-white">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-400">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
