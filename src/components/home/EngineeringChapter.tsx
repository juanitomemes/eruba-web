import { DRILLING_CONTENT } from "@/lib/drillingContent";

/**
 * Chapter 04: Ingeniería aplicada (Immersive HTML overlay)
 *
 * Semantic layout:
 * - Desktop: Left-aligned narrative leaving right side clear for 3D stage and future technical callouts.
 * - Compact / Mobile Portrait: Positioned in lower content area, keeping upper visual area for 3D bit/rock.
 * - Typography: h2 matching corporate palette (white, red-600, neutral-300).
 */
export default function EngineeringChapter() {
  const { engineering } = DRILLING_CONTENT;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
      <div className="max-w-lg">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 md:text-sm">
          {engineering.eyebrow}
        </p>
        <div className="mb-6 h-[2px] w-12 bg-red-600" />
        <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
          {engineering.headline}
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-300 md:text-lg">
          {engineering.body}
        </p>
      </div>
    </div>
  );
}
