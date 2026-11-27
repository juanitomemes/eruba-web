"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "./Hero";
import SubsurfaceChapter from "./SubsurfaceChapter";
import EngineeringChapter from "./EngineeringChapter";
import EngineeringOverlay, {
  type EngineeringOverlayHandle,
} from "./EngineeringOverlay";
import StaticDrillingExperience from "./StaticDrillingExperience";
import { useExperienceMode } from "@/hooks/useExperienceMode";
import {
  ChapterId,
  getActiveChapter,
  getLegacyProgress,
  getEngineeringProgress,
  getChapterVisibility,
} from "@/lib/drillingTimeline";
import {
  type ProjectedAnnotationsMap,
  createDefaultProjectedMap,
} from "@/lib/engineeringAnnotations";

const DrillingScene = dynamic(
  () => import("@/components/three/DrillingScene"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-neutral-950" aria-hidden="true" />
    ),
  }
);

gsap.registerPlugin(ScrollTrigger);

export default function DrillingExperience() {
  const {
    profile,
    config,
    isCompact,
    isStatic,
    manualFallback,
    triggerFallback,
  } = useExperienceMode();

  const [hasMounted, setHasMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const conclusionRef = useRef<HTMLParagraphElement>(null);
  const subsurfaceRef = useRef<HTMLDivElement>(null);
  const engineeringRef = useRef<HTMLDivElement>(null);

  // Motion and timeline progress refs
  const progressRef = useRef(0);
  const engineeringProgressRef = useRef(0);
  const projectedCoordsRef = useRef<ProjectedAnnotationsMap>(
    createDefaultProjectedMap()
  );
  const overlayRef = useRef<EngineeringOverlayHandle>(null);
  const activeChapterRef = useRef<ChapterId>("hero");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // If user prefers reduced motion or WebGL is unavailable, static mode handles the layout
    if (isStatic) return;

    const section = sectionRef.current;
    const hero = heroRef.current;
    const intro = introRef.current;
    const conclusion = conclusionRef.current;
    const subsurface = subsurfaceRef.current;
    const engineering = engineeringRef.current;
    if (
      !section ||
      !hero ||
      !intro ||
      !conclusion ||
      !subsurface ||
      !engineering
    )
      return;

    const setChapterAccessibility = (chapter: ChapterId) => {
      const applyState = (el: HTMLElement | null, isActive: boolean) => {
        if (!el) return;
        if (isActive) {
          el.removeAttribute("aria-hidden");
          el.removeAttribute("inert");
        } else {
          // Never apply aria-hidden / inert to a container holding active keyboard focus
          if (!el.contains(document.activeElement)) {
            el.setAttribute("aria-hidden", "true");
            el.setAttribute("inert", "");
          }
        }
      };

      applyState(hero, chapter === "hero");
      applyState(intro, chapter === "intro");
      applyState(subsurface, chapter === "subsurface");
      applyState(engineering, chapter === "engineering");
    };

    // Reconcile accessibility state when focus moves out of an inactive chapter
    const handleFocusOut =
      (chapter: ChapterId, el: HTMLElement) => (e: FocusEvent) => {
        if (activeChapterRef.current !== chapter) {
          const nextTarget = e.relatedTarget as Node | null;
          if (!nextTarget || !el.contains(nextTarget)) {
            el.setAttribute("aria-hidden", "true");
            el.setAttribute("inert", "");
          }
        }
      };

    const heroFocusOut = handleFocusOut("hero", hero);
    const introFocusOut = handleFocusOut("intro", intro);
    const subsurfaceFocusOut = handleFocusOut("subsurface", subsurface);
    const engineeringFocusOut = handleFocusOut("engineering", engineering);

    hero.addEventListener("focusout", heroFocusOut);
    intro.addEventListener("focusout", introFocusOut);
    subsurface.addEventListener("focusout", subsurfaceFocusOut);
    engineering.addEventListener("focusout", engineeringFocusOut);

    const update = (globalProgress: number) => {
      // 3D scene receives remapped legacy progress [0, 1] clamped at 1.0 when entering chapter 04
      const legacyProgress = getLegacyProgress(globalProgress);
      progressRef.current = legacyProgress;

      // Chapter 04 local engineering progress [0, 1]
      const engineeringProgress = getEngineeringProgress(globalProgress);
      engineeringProgressRef.current = engineeringProgress;

      // Update technical annotations overlay without React state overhead
      overlayRef.current?.update(
        engineeringProgress,
        projectedCoordsRef.current
      );

      // Centralized narrative visibility computation
      const visibility = getChapterVisibility(globalProgress);

      // Determine active narrative chapter only crossing state boundaries
      const targetChapter = getActiveChapter(globalProgress);
      if (targetChapter !== activeChapterRef.current) {
        activeChapterRef.current = targetChapter;
        setChapterAccessibility(targetChapter);
      }

      gsap.set(hero, {
        autoAlpha: visibility.heroOpacity,
        y: -22 * (1 - visibility.heroOpacity),
        pointerEvents: visibility.heroOpacity > 0.5 ? "auto" : "none",
      });
      gsap.set(intro, {
        autoAlpha: visibility.introOpacity,
        y: 25 * (1 - visibility.introOpacity),
      });
      gsap.set(conclusion, {
        autoAlpha: visibility.conclusionOpacity,
        y: 16 * (1 - visibility.conclusionOpacity),
      });
      gsap.set(subsurface, {
        autoAlpha: visibility.subsurfaceOpacity,
        y: 25 * (1 - visibility.subsurfaceOpacity),
      });
      gsap.set(engineering, {
        autoAlpha: visibility.engineeringOpacity,
        y: 25 * (1 - visibility.engineeringOpacity),
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });

    // Synchronize initial chapter accessibility directly from actual trigger progress
    const initialProgress = trigger.progress;
    const initialChapter = getActiveChapter(initialProgress);
    activeChapterRef.current = initialChapter;
    setChapterAccessibility(initialChapter);

    update(initialProgress);

    return () => {
      trigger.kill();
      hero.removeEventListener("focusout", heroFocusOut);
      intro.removeEventListener("focusout", introFocusOut);
      subsurface.removeEventListener("focusout", subsurfaceFocusOut);
      engineering.removeEventListener("focusout", engineeringFocusOut);
    };
  }, [isStatic, profile]);

  // When reduced motion or fallback is requested, render clean accessible standard flow
  if (isStatic) {
    return <StaticDrillingExperience autoFocusHeading={manualFallback} />;
  }

  const handleProjectionUpdate = () => {
    overlayRef.current?.update(
      engineeringProgressRef.current,
      projectedCoordsRef.current
    );
  };

  return (
    <section
      ref={sectionRef}
      style={{ height: config.timelineHeight }}
      className="relative bg-neutral-950 text-white selection:bg-red-600 selection:text-white"
      aria-label="Experiencia de perforación"
    >
      {/* Accessible skip link allowing screen reader and keyboard users to switch to standard text mode */}
      <button
        type="button"
        onClick={triggerFallback}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:border focus:border-red-600 focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Cambiar a versión de lectura estática (accesible)
      </button>

      <div className="sticky top-0 h-screen h-[100dvh] overflow-hidden">
        {/* Exactly one persistent Canvas instance for immersive mode, mounted only when confirmed */}
        <div className="absolute inset-0">
          {hasMounted && !isStatic && (
            <DrillingScene
              progressRef={progressRef}
              engineeringProgressRef={engineeringProgressRef}
              projectedCoordsRef={projectedCoordsRef}
              onProjectionUpdate={handleProjectionUpdate}
              isCompact={isCompact}
              onWebGLError={triggerFallback}
            />
          )}
        </div>

        {/* Adaptive visual contrast gradient (vertical on mobile, horizontal on desktop) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/80 via-35% to-transparent to-70% lg:bg-gradient-to-r lg:from-black lg:via-black/55 lg:to-transparent lg:via-50% lg:to-100%" />

        <div ref={heroRef} className="absolute inset-0 z-20">
          <Hero />
        </div>

        <div
          ref={introRef}
          className="pointer-events-none invisible absolute inset-0 z-10 flex items-end pb-24 sm:items-center sm:pb-0"
        >
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <h2 className="max-w-lg text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              Un pozo no comienza con la perforadora.
            </h2>
            <p
              ref={conclusionRef}
              className="invisible mt-6 max-w-lg text-xl font-semibold text-red-500 md:text-2xl"
            >
              Comienza con ingeniería.
            </p>
          </div>
        </div>

        <div
          ref={subsurfaceRef}
          className="pointer-events-none invisible absolute inset-0 z-10 flex items-end pb-24 sm:items-center sm:pb-0"
        >
          <SubsurfaceChapter />
        </div>

        <div
          ref={engineeringRef}
          className="pointer-events-none invisible absolute inset-0 z-10"
        >
          {/* Main narrative text container */}
          <div className="flex h-full w-full items-end pb-24 sm:items-center sm:pb-0">
            <EngineeringChapter />
          </div>

          {/* Technical annotations overlay with SVG lines and HTML callout cards */}
          <EngineeringOverlay ref={overlayRef} isCompact={isCompact} />
        </div>
      </div>
    </section>
  );
}
