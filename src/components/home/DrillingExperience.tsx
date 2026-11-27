"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "./Hero";
import SubsurfaceChapter from "./SubsurfaceChapter";
import StaticDrillingExperience from "./StaticDrillingExperience";
import { useExperienceMode } from "@/hooks/useExperienceMode";

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

const interval = (progress: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (progress - start) / (end - start)));

type NarrativeChapter = "hero" | "intro" | "subsurface";

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
  const progressRef = useRef(0);
  const activeChapterRef = useRef<NarrativeChapter>("hero");

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
    if (!section || !hero || !intro || !conclusion || !subsurface) return;

    const setChapterAccessibility = (chapter: NarrativeChapter) => {
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
    };

    // Reconcile accessibility state when focus moves out of an inactive chapter
    const handleFocusOut =
      (chapter: NarrativeChapter, el: HTMLElement) => (e: FocusEvent) => {
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

    hero.addEventListener("focusout", heroFocusOut);
    intro.addEventListener("focusout", introFocusOut);
    subsurface.addEventListener("focusout", subsurfaceFocusOut);

    const update = (p: number) => {
      progressRef.current = p;

      // The entry choreography occupies the first 72% of the timeline.
      const heroOpacity = 1 - interval(p, 0.158, 0.259);
      const introOpacity =
        interval(p, 0.281, 0.368) * (1 - interval(p, 0.72, 0.795));
      const conclusionOpacity = interval(p, 0.468, 0.562) * introOpacity;
      const subsurfaceOpacity = interval(p, 0.795, 0.875);

      // Determine active narrative chapter only crossing state boundaries
      let targetChapter: NarrativeChapter = "hero";
      if (p >= 0.76) {
        targetChapter = "subsurface";
      } else if (p >= 0.26) {
        targetChapter = "intro";
      }

      if (targetChapter !== activeChapterRef.current) {
        activeChapterRef.current = targetChapter;
        setChapterAccessibility(targetChapter);
      }

      gsap.set(hero, {
        autoAlpha: heroOpacity,
        y: -22 * (1 - heroOpacity),
        pointerEvents: heroOpacity > 0.5 ? "auto" : "none",
      });
      gsap.set(intro, {
        autoAlpha: introOpacity,
        y: 25 * (1 - introOpacity),
      });
      gsap.set(conclusion, {
        autoAlpha: conclusionOpacity,
        y: 16 * (1 - conclusionOpacity),
      });
      gsap.set(subsurface, {
        autoAlpha: subsurfaceOpacity,
        y: 25 * (1 - subsurfaceOpacity),
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
    let initialChapter: NarrativeChapter = "hero";
    if (initialProgress >= 0.76) {
      initialChapter = "subsurface";
    } else if (initialProgress >= 0.26) {
      initialChapter = "intro";
    }
    activeChapterRef.current = initialChapter;
    setChapterAccessibility(initialChapter);

    update(initialProgress);

    return () => {
      trigger.kill();
      hero.removeEventListener("focusout", heroFocusOut);
      intro.removeEventListener("focusout", introFocusOut);
      subsurface.removeEventListener("focusout", subsurfaceFocusOut);
    };
  }, [isStatic, profile]);

  // When reduced motion or fallback is requested, render clean accessible standard flow
  if (isStatic) {
    return <StaticDrillingExperience autoFocusHeading={manualFallback} />;
  }

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
      </div>
    </section>
  );
}
