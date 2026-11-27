# Línea Base Técnica - Fase 03: El Subsuelo
**Proyecto:** Eru-BA Drilling Consulting  
**Rama:** `feature/scroll-experience`  
**Fecha de Cierre:** Noviembre 2026  
**Fase Completada:** 03 - El subsuelo  
**Próxima Fase:** 04 - Ingeniería aplicada  

---

## 1. Inventario de Capítulos Implementados

| Capítulo | Estado | Componente Visual | Rango Scroll | Descripción |
|---|---|---|---|---|
| **01. Hero** | Consolidado | `src/components/home/Hero.tsx` | `p: 0.000` a `0.259` | Apertura institucional con barrena rotando sobre su eje, titular H1 y botones CTA. |
| **02. Inicio del pozo** | Consolidado | `src/components/home/DrillingExperience.tsx` | `p: 0.281` a `0.795` | Filosofía de perforación: *"Un pozo no comienza con la perforadora. Comienza con ingeniería."* |
| **03. El subsuelo** | Consolidado | `src/components/home/SubsurfaceChapter.tsx` | `p: 0.795` a `1.000` | Corte conceptual estratigráfico y penetración de la barrena en el terreno mineral. |

---

## 2. Arquitectura de Componentes

```mermaid
flowchart TD
    Page["src/app/page.tsx (main)"] --> ExpMode["useExperienceMode()"]
    ExpMode -->|Profile: desktop / compact| DrillingExp["DrillingExperience (Sticky 100dvh)"]
    ExpMode -->|Profile: static (reduced-motion / no WebGL)| StaticExp["StaticDrillingExperience (Flujo Documental)"]
    
    DrillingExp --> HTMLOverlays["Capas Narrativas HTML (Hero, Intro, Subsurface)"]
    DrillingExp -->|next/dynamic ssr:false| Scene["DrillingScene (Canvas persistente único)"]
    
    Scene --> SceneErr["SceneErrorBoundary"]
    Scene --> ContextWatcher["WebGLContextWatcher (webglcontextlost)"]
    Scene --> SceneCam["SceneCamera (Encuadres por perfil)"]
    Scene --> SceneLight["SceneLighting (Iluminación dinámica)"]
    Scene --> Ground["Ground (Corte litológico procedural)"]
    Scene --> Bit["TriconeBit (public/models/tricone-bit.optimized.glb)"]
    Scene --> Env["Environment (public/environments/studio.hdr)"]
```

### Principios Fundamentales:
1. **Separación de Responsabilidades:** El marcado semántico HTML (`Navbar`, `Hero`, `SubsurfaceChapter`) reside en componentes React estándar compatibles con SSR. La escena 3D es exclusivamente escénica y se desacopla mediante `next/dynamic` con `ssr: false`.
2. **Único Canvas Persistente:** Se instancia exactamente un `<Canvas>` durante la experiencia inmersiva para evitar duplicación de contextos WebGL y recarga de shaders.
3. **Flujo de Respaldo Estático (`StaticDrillingExperience`):** Proporciona la totalidad del contenido editorial en flujo documental limpio cuando el usuario solicita reducción de movimiento, el dispositivo carece de WebGL2 o se produce una pérdida de contexto GPU.

---

## 3. Selección de Perfiles de Experiencia

La selección se centraliza en `src/lib/experienceProfiles.ts` y se consume reactivamente mediante `src/hooks/useExperienceMode.ts`:

| Perfil | Criterio de Activación | DPR Cap | Sombras | Timeline Height | Escena 3D |
|---|---|---|---|---|---|
| **`desktop`** | Viewport $\ge 1024\text{px}$, WebGL2 activo, sin reduced-motion | `1.75` | 1024x1024 | `430vh` | Completa |
| **`compact`** | Viewport $< 1024\text{px}$, WebGL2 activo, sin reduced-motion | `1.25` | 512x512 | `380vh` | Simplificada en sombras / Encuadre superior |
| **`static`** | `prefers-reduced-motion`, WebGL2 ausente, o error de contexto | `1.0` | Desactivadas | `auto` | Desmontada (0 descargas 3D) |

### Detección Pura de Capacidades:
- `getSnapshot` es una función **pura y sin efectos secundarios**. No crea elementos `<canvas>` ni solicita contextos GPU durante la fase de render.
- La evaluación de `prefers-reduced-motion` tiene **prioridad absoluta**; si está activo, nunca se sondea la GPU.
- El sondeo de WebGL2 se ejecuta una única vez fuera de la fase de render, liberando inmediatamente el contexto de prueba mediante `WEBGL_lose_context`.

---

## 4. Ciclo de Vida del Canvas y Bucle de Renderizado

- **Suspensión en Pestañas Ocultas:** `DrillingScene` conmuta su propiedad `frameloop` a `"never"` cuando `document.hidden` es verdadero, deteniendo el 100% de los ciclos de renderizado de la GPU mientras la pestaña se encuentra en segundo plano.
- **Gestión de Pérdida de Contexto:** `WebGLContextWatcher` captura el evento `webglcontextlost`, invoca `event.preventDefault()` y activa de forma determinista el modo estático documental (`triggerFallback()`) para prevenir bucles de reinicialización infinitos.
- **Manejo de Errores React y de Red:** `SceneErrorBoundary` captura fallos de red en la carga del modelo o del mapa HDRI, transfiriendo de forma transparente al usuario al modo documental accesible.

---

## 5. Arquitectura de Movimiento Compartido

Todas las transformaciones de cámara, iluminación, elevación de la barrena y revelado del terreno están gobernadas por `src/lib/drillingMotion.ts`:

- **Progreso Normalizado:** $p \in [0, 1]$.
- **Coreografía de Entrada:** $p \in [0, 0.72]$ (`ENTRY_END = 0.72`).
- **Coreografía de Subsuelo:** $p \in [0.72, 1.0]$.
- **Memoización e Inmutabilidad:** `getDrillingMotion` almacena en caché el resultado del último progreso evaluado y retorna un objeto sellado mediante `Object.freeze()`. Esto elimina las evaluaciones matemáticas redundantes entre `SceneCamera`, `SceneLighting`, `Ground` y `TriconeBit` en un 75%.

### Valores Clave de Referencia:
- $p = 0.000$: Barrena en posición de reposo Hero ($y = 0$), terreno oculto ($groundReveal = 0$).
- $p = 0.500$: Comienza descenso de aproximación ($bitY \approx -0.30$), terreno revelado al 100%, iluminación transitando a rasante.
- $p = 0.720$: La barrena alcanza el estrato superior ($bitY = -0.42$), rotación acumulada de $4\pi$ radianes.
- $p = 1.000$: Penetración completa en subsuelo ($bitY = -0.45$, $terrainY = 2.50$, rotación total $6\pi$).

---

## 6. Inventario de Recursos y Verificación de Integridad

| Recurso | Ruta | Tamaño (Bytes) | Tamaño (MB) | SHA-256 | Estado |
|---|---|---|---|---|---|
| **GLB Maestro** | `public/models/tricone-bit.glb` | 10,036,392 | 9.57 MB | `8791c48da4e09f57476029b3b63a0bfcf449b19596f6e9ae2d73fc87ee8218ae` | **Intacto / Protegido** |
| **GLB Optimizado (B1)** | `public/models/tricone-bit.optimized.glb` | 1,750,072 | 1.67 MB | `6b800a3644f801b48fd53fa896c33988299946d7c309c0c70109a005de73fbcd` | **En Producción (-82.6%)** |
| **Entorno HDRI** | `public/environments/studio.hdr` | 1,680,234 | 1.60 MB | `29267a4aa8c10de26cae758e4e3c4daadde88673798666ad657724bab7224a35` | **Intacto (1024x512)** |

### Optimizaciones Estructurales Aplicadas al GLB:
- **Consolidación de Mallas:** De 248 mallas separadas a 1 sola primitiva estática, reduciendo las llamadas de dibujo (*draw calls*) en GPU de 248 a 1.
- **Compresión Meshopt:** Extensión `EXT_meshopt_compression` y `KHR_mesh_quantization`.
- **Fidelidad Geométrica:** 338,912 triángulos y 241,429 vértices (100% de preservación geométrica sin simplificación destructiva).
- **Decodificador en Runtime:** Incluido localmente mediante `three-stdlib`. **Cero dependencias de CDN externos** (prohibición estricta de `gstatic.com`).

---

## 7. Estrategia de Accesibilidad

1. **Jerarquía Semántica:** Exactamente un landmark `<main>` a nivel de página (`src/app/page.tsx`) y un único encabezado `<h1>` accesible.
2. **Visibilidad Asistiva Dinámica:** En la experiencia interactiva, los atributos `aria-hidden` e `inert` se gestionan en tiempo de ejecución únicamente al cruzar los umbrales de los capítulos narrativos (evitando re-renderizados de React durante el scroll).
3. **Reconciliación de Foco Inactivo:** Eventos `focusout` en los contenedores garantizan que si un control pierde el foco hacia otro capítulo, el contenedor inactivo se oculte de inmediato para lectores de pantalla.
4. **Skip Link Accesible:** Botón al inicio del scroll que permite a usuarios de tecnologías de asistencia transferir el foco al encabezado principal de la versión estática documental de forma inmediata y sin almacenamiento global.

---

## 8. Guía de Extensión para Fase 04 (Ingeniería Aplicada)

Cuando se implemente la Fase 04 (*Ingeniería aplicada*), se deben seguir estrictamente estas directrices:

1. **Conservar el Canvas Único:** No añadir un nuevo Canvas ni instanciar múltiples renderers. La Fase 04 debe integrarse dentro de la escena existente o extender la coreografía en `drillingMotion.ts`.
2. **Centralizar Nuevos Rangos de Scroll:** Cualquier nuevo capítulo debe extender la altura del timeline (`timelineHeight` en `src/lib/experienceProfiles.ts`) y parametrizar sus transiciones dentro de `drillingMotion.ts` en lugar de dispersar constantes numéricas en componentes individuales.
3. **Preservar la Autonomía HTML:** Los textos, etiquetas técnicas y diagramas de la Fase 04 deben residir en capas HTML semánticas posicionadas de forma coordinada con el scroll, garantizando que el modo estático siga siendo 100% accesible sin depender de WebGL.
4. **Conservar el GLB Optimizado:** No revertir al modelo de 10 MB ni reintroducir `useGLTF.preload` incondicional a nivel de módulo.
5. **Referencia al Wireframe Maestro:** Todo nuevo contenido debe respetar la narrativa técnica aprobada en el wireframe de Eru-BA (`Eru-BA Drilling Experience Wireframe.png`).

---

## 9. Registro de Pruebas de Producción

- **ESLint:** PASS (0 errores, 0 advertencias).
- **TypeScript (`tsc --noEmit`):** PASS (código de salida 0).
- **Next.js Turbopack Build (`next build`):** PASS (código de salida 0).
- **Prerenderizado:** Ruta `/` generada como contenido estático puro.
