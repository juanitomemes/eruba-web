import Navbar from "@/components/layouts/Navbar";

// The 3D Canvas belongs to DrillingExperience so it persists across scenes.
export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="pointer-events-none relative min-h-screen text-white"
    >
      <div className="pointer-events-auto">
        <Navbar />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-20 sm:items-center sm:pb-0 lg:px-10">
        <div className="pointer-events-auto max-w-2xl pt-24 sm:pt-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
            Ingeniería que llega más profundo
          </p>
          <div className="mb-6 h-[2px] w-12 bg-red-600" />

          <h1
            id="hero-title"
            className="max-w-2xl text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Calidad e Ingeniería en{" "}
            <span className="text-white">
              Perforación de Pozos de Agua Profundos.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-300 md:text-lg">
            Experiencia técnica, ingeniería y seguridad aplicadas a proyectos
            de perforación de pozos de agua en México.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <a
              href="#experiencia"
              className="inline-flex items-center justify-center bg-red-600 px-6 py-3.5 text-sm font-semibold transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Conocer Eru-BA
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center justify-center border border-white/30 px-6 py-3.5 text-sm font-semibold transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Hablemos de un proyecto
            </a>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400 md:flex"
      >
        <span className="h-8 w-px bg-red-600" />
        Desliza para iniciar
      </div>
    </section>
  );
}
