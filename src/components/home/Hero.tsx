"use client";

import DrillingScene from "@/components/three/DrillingScene";
import Navbar from "@/components/layouts/Navbar";

export default function Hero() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
            <Navbar />
            {/* Escena 3D */}
            <div className="absolute inset-0 z-0">
                <DrillingScene />
            </div>

            {/* Degradado para proteger la lectura */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black via-black/55 to-transparent" />

            {/* Contenido */}
            <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl items-center px-6 lg:px-10">
                <div className="max-w-2xl">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
                        Ingeniería que llega más profundo
                    </p>
                    <div className="mb-6 h-[2px] w-12 bg-red-600" />

                    <h1 className="max-w-2xl text-4xl font-black leading-[0.98] tracking-tight md:text-5xl lg:text-6xl">
                        Calidad e Ingeniería en{" "}
                        <span className="text-white">
                            Perforación de Pozos de Agua Profundos.
                        </span>
                    </h1>

                    <p className="mt-7 max-w-lg text-base leading-7 text-neutral-300 md:text-lg">
                        Experiencia técnica, ingeniería y seguridad aplicadas a proyectos
                        de perforación de pozos de agua.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <a
                            href="#experiencia"
                            className="inline-flex items-center justify-center bg-red-600 px-6 py-3 text-sm font-semibold transition hover:bg-red-700"
                        >
                            Conocer Eru-BA
                        </a>

                        <a
                            href="#contacto"
                            className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm font-semibold transition hover:border-white hover:bg-white/10"
                        >
                            Hablemos de un proyecto
                        </a>
                    </div>
                </div>
            </div>

            {/* Indicador inferior */}
            <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400 md:flex">
                <span className="h-8 w-px bg-red-600" />
                Desliza para iniciar
            </div>
        </section>
    );
}