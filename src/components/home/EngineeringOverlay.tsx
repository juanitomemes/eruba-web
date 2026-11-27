"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import {
  ENGINEERING_ANNOTATIONS,
  type AnnotationId,
  type ProjectedAnnotationsMap,
  getAnnotationOpacity,
} from "@/lib/engineeringAnnotations";

export interface EngineeringOverlayHandle {
  update: (
    engineeringProgress: number,
    projectedCoords: ProjectedAnnotationsMap
  ) => void;
}

interface EngineeringOverlayProps {
  isCompact?: boolean;
}

/**
 * Technical annotations overlay for Chapter 04 (Ingeniería aplicada).
 *
 * Combines:
 * - Decorative SVG connector lines and discrete anchor points (aria-hidden="true").
 * - Semantic HTML callouts with titles (h3) and descriptions (p).
 * - Direct imperative DOM updates via ref to avoid React state churn per scroll frame.
 * - Responsive layout: Full technical callouts with connector lines on desktop;
 *   compact structured list on mobile portrait/landscape to prevent visual noise.
 */
const EngineeringOverlay = forwardRef<
  EngineeringOverlayHandle,
  EngineeringOverlayProps
>(function EngineeringOverlay({ isCompact = false }, ref) {
  // Desktop DOM refs for imperative updates
  const desktopCardRefs = useRef<Record<AnnotationId, HTMLDivElement | null>>({
    planning: null,
    analysis: null,
    control: null,
    supervision: null,
  });

  const svgLineRefs = useRef<Record<AnnotationId, SVGPathElement | null>>({
    planning: null,
    analysis: null,
    control: null,
    supervision: null,
  });

  const svgDotRefs = useRef<Record<AnnotationId, SVGCircleElement | null>>({
    planning: null,
    analysis: null,
    control: null,
    supervision: null,
  });

  const svgRingRefs = useRef<Record<AnnotationId, SVGCircleElement | null>>({
    planning: null,
    analysis: null,
    control: null,
    supervision: null,
  });

  // Mobile / Compact DOM refs for progressive reveal
  const compactCardRefs = useRef<Record<AnnotationId, HTMLDivElement | null>>({
    planning: null,
    analysis: null,
    control: null,
    supervision: null,
  });

  useImperativeHandle(
    ref,
    () => ({
      update(
        engineeringProgress: number,
        projectedCoords: ProjectedAnnotationsMap
      ) {
        for (const annotation of ENGINEERING_ANNOTATIONS) {
          const id = annotation.id;
          const opacity = getAnnotationOpacity(id, engineeringProgress);
          const coords = projectedCoords[id];

          // 1. Update desktop elements
          const desktopCard = desktopCardRefs.current[id];
          const lineEl = svgLineRefs.current[id];
          const dotEl = svgDotRefs.current[id];
          const ringEl = svgRingRefs.current[id];

          if (coords && coords.visible && opacity > 0.005) {
            const placement = annotation.desktopPlacement;
            const targetX = coords.x + placement.xOffset;
            const targetY = coords.y + placement.yOffset;

            if (desktopCard) {
              desktopCard.style.opacity = opacity.toFixed(3);
              desktopCard.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
              desktopCard.style.visibility = "visible";
              desktopCard.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
            }

            // Stepped connector path from anchor to card
            // For left-aligned callouts, line touches the right edge of the card
            // For right-aligned callouts, line touches the left edge
            const cardWidth = 220;
            const cardAttachX =
              placement.align === "right" ? targetX + cardWidth : targetX;
            const cardAttachY = targetY + 28;

            const midX = (coords.x + cardAttachX) / 2;
            const pathData = `M ${coords.x} ${coords.y} L ${midX} ${coords.y} L ${midX} ${cardAttachY} L ${cardAttachX} ${cardAttachY}`;

            if (lineEl) {
              lineEl.setAttribute("d", pathData);
              lineEl.style.opacity = (opacity * 0.75).toFixed(3);
            }
            if (dotEl) {
              dotEl.setAttribute("cx", coords.x.toString());
              dotEl.setAttribute("cy", coords.y.toString());
              dotEl.style.opacity = opacity.toFixed(3);
            }
            if (ringEl) {
              ringEl.setAttribute("cx", coords.x.toString());
              ringEl.setAttribute("cy", coords.y.toString());
              ringEl.style.opacity = (opacity * 0.5).toFixed(3);
            }
          } else {
            if (desktopCard) {
              desktopCard.style.opacity = "0";
              desktopCard.style.visibility = "hidden";
              desktopCard.style.pointerEvents = "none";
            }
            if (lineEl) lineEl.style.opacity = "0";
            if (dotEl) dotEl.style.opacity = "0";
            if (ringEl) ringEl.style.opacity = "0";
          }

          // 2. Update compact/mobile cards
          const compactCard = compactCardRefs.current[id];
          if (compactCard) {
            if (opacity > 0.005) {
              compactCard.style.opacity = opacity.toFixed(3);
              compactCard.style.transform = `translateY(${((1 - opacity) * 12).toFixed(1)}px)`;
              compactCard.style.visibility = "visible";
            } else {
              compactCard.style.opacity = "0";
              compactCard.style.visibility = "hidden";
            }
          }
        }
      },
    }),
    []
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-label="Anotaciones técnicas de ingeniería aplicada"
    >
      {/* Decorative SVG for desktop connector lines and anchor markers */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        aria-hidden="true"
      >
        <defs>
          <radialGradient
            id="anchor-glow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>

        {ENGINEERING_ANNOTATIONS.map((item) => (
          <g key={`svg-${item.id}`}>
            {/* Pulsing ring indicator */}
            <circle
              ref={(el) => {
                svgRingRefs.current[item.id] = el;
              }}
              r="9"
              fill="url(#anchor-glow)"
              stroke="#dc2626"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0"
            />
            {/* Solid anchor core dot */}
            <circle
              ref={(el) => {
                svgDotRefs.current[item.id] = el;
              }}
              r="3.5"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="1"
              opacity="0"
            />
            {/* Stepped connector line */}
            <path
              ref={(el) => {
                svgLineRefs.current[item.id] = el;
              }}
              fill="none"
              stroke="rgba(255, 255, 255, 0.42)"
              strokeWidth="1.2"
              strokeDasharray="3,3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0"
            />
          </g>
        ))}
      </svg>

      {/* Desktop Callout Cards (positioned absolutely in screen pixels) */}
      <div className="hidden lg:block">
        {ENGINEERING_ANNOTATIONS.map((item) => (
          <div
            key={`desktop-${item.id}`}
            ref={(el) => {
              desktopCardRefs.current[item.id] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity: 0,
              visibility: "hidden",
            }}
            className="w-[230px] rounded border border-neutral-800/90 bg-neutral-950/85 p-3.5 shadow-2xl backdrop-blur-md transition-shadow hover:border-neutral-700"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-red-500">
                {item.number}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                Pilar técnico
              </span>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-white">
              {item.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-300">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Compact / Mobile Responsive Callouts (Clean technical grid below text in content column) */}
      <div className="pointer-events-none absolute inset-0 flex items-end pb-8 sm:pb-12 lg:hidden">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="pointer-events-auto ml-auto grid max-w-lg grid-cols-2 gap-2.5 sm:gap-3">
            {ENGINEERING_ANNOTATIONS.map((item) => (
              <div
                key={`compact-${item.id}`}
                ref={(el) => {
                  compactCardRefs.current[item.id] = el;
                }}
                style={{
                  opacity: 0,
                  visibility: "hidden",
                }}
                className="rounded border border-neutral-800/90 bg-neutral-950/90 p-2.5 shadow-lg backdrop-blur-md sm:p-3"
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  <span className="font-mono text-[10px] font-bold text-red-500">
                    {item.number}
                  </span>
                  <h3 className="truncate text-xs font-bold text-white sm:text-sm">
                    {item.title}
                  </h3>
                </div>
                <p className="line-clamp-2 text-[11px] leading-tight text-neutral-400 sm:text-xs">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default EngineeringOverlay;
