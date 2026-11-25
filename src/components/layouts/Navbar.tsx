import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <header className="absolute left-0 top-0 z-50 w-full">
            <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-10">
                <Link
                    href="/"
                    aria-label="Eru-BA - Inicio"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                    <Image
                        src="/images/Logotipo_Eru-BA.png"
                        alt="Eru-BA Drilling Consulting"
                        width={45}
                        height={45}
                        priority
                        className="h-auto w-[45px] lg:w-[45px]"
                    />
                </Link>

                <nav
                    aria-label="Navegación principal"
                    className="hidden items-center gap-8 lg:flex"
                >
                    <a
                        href="#servicios"
                        className="text-sm text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    >
                        Servicios
                    </a>

                    <a
                        href="#experiencia"
                        className="text-sm text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    >
                        Experiencia
                    </a>

                    <a
                        href="#proyectos"
                        className="text-sm text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    >
                        Proyectos
                    </a>

                    <a
                        href="#equipo"
                        className="text-sm text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    >
                        Equipo
                    </a>

                    <a
                        href="#conocimiento"
                        className="text-sm text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    >
                        Conocimiento
                    </a>

                    <a
                        href="#contacto"
                        className="border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-red-600 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    >
                        Contacto
                    </a>
                </nav>

                {/* Control de menú móvil (preparado para integración de drawer en sprints posteriores) */}
                <button
                    type="button"
                    aria-label="Abrir menú"
                    aria-expanded="false"
                    className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded border border-white/10 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                    <span className="h-px w-6 bg-white" />
                    <span className="h-px w-6 bg-white" />
                </button>
            </div>
        </header>
    );
}
