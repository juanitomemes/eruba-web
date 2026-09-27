"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "./Hero";
import DrillingScene from "@/components/three/DrillingScene";

gsap.registerPlugin(ScrollTrigger);

export default function DrillingExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  // A ref keeps the WebGL animation independent of React's render cycle.
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    progressRef.current = trigger.progress;
    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] bg-neutral-950 text-white"
    >
      {/* One persistent WebGL scene for the entire experience. */}
      <div className="sticky top-0 z-0 h-screen overflow-hidden">
        <DrillingScene progressRef={progressRef} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />
      </div>

      {/* HTML overlays occupy scroll distance without creating another Canvas. */}
      <div className="pointer-events-none relative z-10 -mt-[100vh]">
        <Hero />
        <section className="relative h-[200vh]" aria-label="Inicio de perforación">
          <div className="sticky top-0 flex h-screen items-center">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
              <p className="max-w-lg text-4xl font-black leading-tight md:text-5xl">
                Un pozo no comienza con la perforadora.
              </p>
              <p className="mt-6 max-w-lg text-xl font-semibold text-red-500 md:text-2xl">
                Comienza con ingeniería.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
