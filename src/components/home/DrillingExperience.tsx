"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "./Hero";
import DrillingScene from "@/components/three/DrillingScene";

gsap.registerPlugin(ScrollTrigger);

const interval = (progress: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (progress - start) / (end - start)));

export default function DrillingExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const conclusionRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const hero = heroRef.current;
    const intro = introRef.current;
    const conclusion = conclusionRef.current;
    if (!section || !hero || !intro || !conclusion) return;

    const update = (p: number) => {
      progressRef.current = p;

      // A deliberate gap between messages prevents overlapping headlines.
      const heroOpacity = 1 - interval(p, 0.22, 0.36);
      const introOpacity =
        interval(p, 0.39, 0.51) * (1 - interval(p, 0.83, 0.95));
      const conclusionOpacity = interval(p, 0.65, 0.78) * introOpacity;

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

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] bg-neutral-950 text-white"
      aria-label="Experiencia de perforación"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Exactly one Canvas, shared from the hero through the descent. */}
        <div className="absolute inset-0">
          <DrillingScene progressRef={progressRef} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />

        <div ref={heroRef} className="absolute inset-0 z-20">
          <Hero />
        </div>

        <div
          ref={introRef}
          className="pointer-events-none invisible absolute inset-0 z-10 flex items-center"
        >
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <h2 className="max-w-lg text-4xl font-black leading-tight md:text-5xl">
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
      </div>
    </section>
  );
}
