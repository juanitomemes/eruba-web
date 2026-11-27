# Arquitectura Narrativa y Extensión del Timeline - Fase 04: Ingeniería Aplicada
**Proyecto:** Eru-BA Drilling Consulting  
**Tarea:** `ERUBA-WEB-S04-01`  
**Rama:** `feature/scroll-experience`  
**Fecha:** Noviembre 2026  
**Fase:** 04 - Ingeniería aplicada (Sprint 04.1)

---

## 1. Resumen Ejecutivo de la Extensión

La fase 04 incorpora el capítulo **04. Ingeniería aplicada** al timeline continuo de la experiencia interactiva, manteniendo intacta la coreografía de las Fases 01 a 03 previamente aprobadas y asegurando plena paridad informativa en el modo estático documental (`StaticDrillingExperience`).

### Logros Principales:
1. **Centralización Narrativa (`src/lib/drillingTimeline.ts`):** Unificación de umbrales, progresos locales/globales y estados de accesibilidad en un módulo inmutable sin valores mágicos dispersos.
2. **Centralización Editorial (`src/lib/drillingContent.ts`):** Fuente única de verdad para textos corporativos, libre de afirmaciones técnicas inventadas y consumida por modos inmersivo y estático.
3. **Extensión del Timeline:** Incremento de altura (`550vh` en desktop, `480vh` en compact) conservando la velocidad física y distancia de scroll original de las Fases 01-03.
4. **Remapeo Determinista de Progreso:** La escena 3D y su coreografía original operan sobre el dominio local remapeado $p_{\text{legacy}} \in [0, 1]$, congelando su estado final de subsuelo ($p_{\text{legacy}} = 1.0$) al ingresar al Capítulo 04, garantizando cero discontinuidades.
5. **Alternativa Estática Accesible:** Integración de la sección documental de Ingeniería aplicada con los cuatro pilares fundamentales en cuadrícula semántica HTML (`<h2>`, `<h3>`), sin requerir WebGL ni descargas de recursos 3D.

---

## 2. Arquitectura de Progreso Global y Local

Para acomodar el capítulo de ingeniería sin comprimir los tiempos narrativos de Hero, Intro y Subsuelo, el scroll global normalizado $p_{\text{global}} \in [0, 1]$ se desacopla mediante funciones puras:

```mermaid
flowchart LR
    ScrollTrigger["ScrollTrigger (p_global: 0 -> 1)"] --> MapLegacy["getLegacyProgress(p_global)"]
    ScrollTrigger --> MapEng["getEngineeringProgress(p_global)"]
    ScrollTrigger --> ActiveChapter["getActiveChapter(p_global)"]
    ScrollTrigger --> Visibility["getChapterVisibility(p_global)"]
    
    MapLegacy -->|p_legacy: 0 -> 1 (clamped a 1 en p >= 0.75)| Motion3D["drillingMotion.ts (TriconeBit, Ground, Camera, Lighting)"]
    Visibility -->|hero, intro, subsurface, engineering opacities| HTMLOverlays["Capas HTML Inmersivas (DrillingExperience)"]
    ActiveChapter -->|hero / intro / subsurface / engineering| Accessibility["Gestión de aria-hidden e inert"]
    MapEng -->|p_eng: 0 -> 1| FutureExtensions["Sprint 04.2 (Etiquetas técnicas / diagramas)"]
```

### Ecuaciones de Remapeo:

1. **Progreso Legado ($p_{\text{legacy}}$):**
   $$p_{\text{legacy}} = \operatorname{clamp}_{0,1}\left(\frac{p_{\text{global}}}{0.75}\right)$$
   - Para $p_{\text{global}} \in [0, 0.75]$: transita lineal y suavemente de $0$ a $1$.
   - Para $p_{\text{global}} \ge 0.75$: se mantiene estrictamente fijo en $1.0$.

2. **Progreso de Ingeniería ($p_{\text{engineering}}$):**
   $$p_{\text{engineering}} = \operatorname{clamp}_{0,1}\left(\frac{p_{\text{global}} - 0.75}{1.0 - 0.75}\right)$$
   - Para $p_{\text{global}} \le 0.75$: $p_{\text{engineering}} = 0$.
   - Para $p_{\text{global}} \in [0.75, 1.0]$: transita linealmente de $0$ a $1$.

---

## 3. Rangos Narrativos y Umbrales de Transición

| Capítulo | Rango Wireframe (Ref.) | Rango Activo Global ($p_{\text{global}}$) | Entrada Visual | Salida Visual | Estado Accesible |
|---|---|---|---|---|---|
| **01. Hero** | `0.00 - 0.15` | `0.000 - 0.195` | Inicial ($1.0$) | `0.118 - 0.194` ($p_{\text{legacy}}: 0.158-0.259$) | `p < 0.195` |
| **02. Inicio del pozo** | `0.15 - 0.27` | `0.195 - 0.570` | `0.211 - 0.276` ($p_{\text{legacy}}: 0.281-0.368$) | `0.540 - 0.596` ($p_{\text{legacy}}: 0.720-0.795$) | `0.195 <= p < 0.570` |
| **03. El subsuelo** | `0.27 - 0.43` | `0.570 - 0.780` | `0.596 - 0.656` ($p_{\text{legacy}}: 0.795-0.875$) | `0.740 - 0.800` ($p_{\text{global}}$) | `0.570 <= p < 0.780` |
| **04. Ingeniería aplicada** | `0.43 - 0.61` | `0.780 - 1.000` | `0.780 - 0.850` ($p_{\text{global}}$) | Preparada en $1.0$ (Capítulo 05) | `p >= 0.780` |

---

## 4. Alturas por Perfil y Distancia de Scroll

| Perfil | Altura Anterior | Altura Actual | Incremento | Distancia Scrollable Anterior | Distancia Scrollable Actual | Proporción Legada ($330/450$) |
|---|---|---|---|---|---|---|
| **`desktop`** | `430vh` | `550vh` | `+120vh` | `330vh` | `450vh` | $73.33\%$ ($\approx 0.74$) |
| **`compact`** | `380vh` | `480vh` | `+100vh` | `280vh` | `380vh` | $73.68\%$ ($\approx 0.74$) |
| **`static`** | `auto` | `auto` | `0vh` | Flujo normal | Flujo normal | N/A (Documental) |

---

## 5. Contenido Editorial Unificado (`DRILLING_CONTENT`)

Se definieron los cuatro pilares fundamentales de la ingeniería de perforación para Eru-BA:
1. **Planeación:** Definición de criterios y estrategia de trabajo.
2. **Análisis:** Comprensión de las condiciones del proyecto.
3. **Control:** Seguimiento de parámetros operativos.
4. **Supervisión:** Seguimiento técnico de la ejecución.

Tanto `EngineeringChapter.tsx` (overlay interactivo) como `StaticDrillingExperience.tsx` (fallback accesible) consumen estos textos de forma declarativa desde `src/lib/drillingContent.ts`.

---

## 6. Verificación de Integridad de Recursos

Los activos 3D maestros y optimizados se mantienen protegidos e inalterados:

| Recurso | Ruta | SHA-256 | Estado |
|---|---|---|---|
| **GLB Maestro** | `public/models/tricone-bit.glb` | `8791c48da4e09f57476029b3b63a0bfcf449b19596f6e9ae2d73fc87ee8218ae` | **Intacto** |
| **GLB Optimizado** | `public/models/tricone-bit.optimized.glb` | `6b800a3644f801b48fd53fa896c33988299946d7c309c0c70109a005de73fbcd` | **Intacto** |
| **HDRI Local** | `public/environments/studio.hdr` | `29267a4aa8c10de26cae758e4e3c4daadde88673798666ad657724bab7224a35` | **Intacto** |

---

## 7. Puntos de Extensión para Sprint 04.2

- **Etiquetas Técnicas en Escena 3D:** Conectar callouts SVG/HTML orientados a las zonas clave de la barrena y el estrato cortado cuando $p_{\text{engineering}} \in [0.2, 0.8]$.
- **Diagramas de Flujo Operativo:** Integrar esquemas visuales livianos de los cuatro pilares sin aumentar la carga poligonal ni crear nuevos Canvas WebGL.
