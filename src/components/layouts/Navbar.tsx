import Image from "next/image";

export default function Navbar() {
    return (
        <header className="absolute left-0 top-0 z-50 w-full">
            <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-10">
                <a href="/" aria-label="Eru-BA - Inicio">
                    <Image
                        src="/images/logotipo_Eru-BA.png"
                        alt="Eru-BA Drilling Consulting"
                        width={45}
                        height={45}
                        priority
                        className="h-auto w-[45px] lg:w-[45px]"
                    />
                </a>

                <nav
                    aria-label="Navegación principal"
                    className="hidden items-center gap-8 lg:flex"
                >
                    <a
                        href="#servicios"
                        className="text-sm text-neutral-300 transition hover:text-white"
                    >
                        Servicios
                    </a>

                    <a
                        href="#experiencia"
                        className="text-sm text-neutral-300 transition hover:text-white"
                    >
                        Experiencia
                    </a>

                    <a
                        href="#proyectos"
                        className="text-sm text-neutral-300 transition hover:text-white"
                    >
                        Proyectos
                    </a>

                    <a
                        href="#equipo"
                        className="text-sm text-neutral-300 transition hover:text-white"
                    >
                        Equipo
                    </a>

                    <a
                        href="#conocimiento"
                        className="text-sm text-neutral-300 transition hover:text-white"
                    >
                        Conocimiento
                    </a>

                    <a
                        href="#contacto"
                        className="border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-red-600 hover:bg-red-600"
                    >
                        Contacto
                    </a>
                </nav>

                {/* El menú móvil lo construiremos después */}
                <button
                    type="button"
                    aria-label="Abrir menú"
                    className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
                >
                    <span className="h-px w-6 bg-white" />
                    <span className="h-px w-6 bg-white" />
                </button>
            </div>
        </header>
    );
}