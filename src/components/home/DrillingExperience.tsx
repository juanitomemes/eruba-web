"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "./Hero";
import SubsurfaceChapter from "./SubsurfaceChapter";
import StaticDrillingExperience from "./StaticDrillingExperience";
import DrillingScene from "@/components/three/DrillingScene";
import { useExperienceMode } from "@/hooks/useExperienceMode";

gsap.registerPlugin(ScrollTrigger);

const interval = (progress: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (progress - start) / (end - start)));

export default function DrillingExperience() {
  const { profile, config, isCompact, isStatic, triggerFallback } =
    useExperienceMode();

  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const conclusionRef = useRef<HTMLParagraphElement>(null);
  const subsurfaceRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    // If user prefers reduced motion or WebGL is unavailable, static mode handles the layout
    if (isStatic) return;

    const section = sectionRef.current;
    const hero = heroRef.current;
    const intro = introRef.current;
    const conclusion = conclusionRef.current;
    const subsurface = subsurfaceRef.current;
    if (!section || !hero || !intro || !conclusion || !subsurface) return;

    const update = (p: number) => {
      progressRef.current = p;

      // The entry choreography occupies the first 72% of the timeline.
      const heroOpacity = 1 - interval(p, 0.158, 0.259);
      const introOpacity =
        interval(p, 0.281, 0.368) * (1 - interval(p, 0.72, 0.795));
      const conclusionOpacity = interval(p, 0.468, 0.562) * introOpacity;
      const subsurfaceOpacity = interval(p, 0.795, 0.875);

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

    update(trigger.progress);

    return () => {
      trigger.kill();
    };
  }, [isStatic, profile]);

  // When reduced motion or fallback is requested, render clean accessible standard flow
  if (isStatic) {
    return <StaticDrillingExperience />;
  }

  return (
    <section
      ref={sectionRef}
      style={{ height: config.timelineHeight }}
      className="relative bg-neutral-950 text-white selection:bg-red-600 selection:text-white"
      aria-label="Experiencia de perforación"
    >
      <div className="sticky top-0 h-screen h-[100dvh] overflow-hidden">
        {/* Exactly one persistent Canvas instance for immersive mode */}
        <div className="absolute inset-0">
          <DrillingScene
            progressRef={progressRef}
            isCompact={isCompact}
            onWebGLError={triggerFallback}
          />
        </div>

        {/* Adaptive visual contrast gradient (vertical on mobile, horizontal on desktop) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent lg:bg-gradient-to-r lg:from-black lg:via-black/55 lg:to-transparent" />

        <div ref={heroRef} className="absolute inset-0 z-20">
          <Hero />
        </div>

        <div
          ref={introRef}
          aria-hidden="true"
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
          aria-hidden="true"
          className="pointer-events-none invisible absolute inset-0 z-10 flex items-end pb-24 sm:items-center sm:pb-0"
        >
          <SubsurfaceChapter />
        </div>
      </div>
    </section>
  );
}
