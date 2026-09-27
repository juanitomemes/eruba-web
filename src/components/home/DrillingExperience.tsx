"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import DrillingScene from "@/components/three/DrillingScene";

gsap.registerPlugin(ScrollTrigger);

export default function DrillingExperience() {
    const sectionRef = useRef<HTMLElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const section = sectionRef.current;

        if (!section) return;

        const trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,

            onUpdate: (self) => {
                setProgress(self.progress);
            },
        });

        return () => {
            trigger.kill();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative h-[250vh] bg-neutral-950"
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <DrillingScene progress={progress} />

                <div className="pointer-events-none absolute inset-0 flex items-center">
                    <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                        <p className="max-w-lg text-4xl font-black leading-tight text-white md:text-5xl">
                            Un pozo no comienza con la perforadora.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}