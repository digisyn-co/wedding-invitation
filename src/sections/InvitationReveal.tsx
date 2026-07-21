"use client";

import { forwardRef } from "react";
import { GoldFrame } from "@/components/GoldFrame";
import { FloralWreath } from "@/components/FloralWreath";

export interface InvitationRevealHandle {
  monogramChars: HTMLElement[];
}

const COUPLE = {
  initials: ["H", "&", "L"],
  names: "Helson & Luna",
  tagline: ["Two souls, one promise,", "a journey of love, grace,", "and endless beginnings."],
  date: "12 . 17 . 2026",
};

/**
 * The content of the invitation card itself — everything that rises
 * out of the envelope once the seal breaks. Presentational only; the
 * parent (`OpeningScene`) owns the reveal timing via refs.
 */
export const InvitationReveal = forwardRef<
  HTMLDivElement,
  {
    monogramWrapRef: React.RefObject<HTMLDivElement | null>;
    foilRef: React.RefObject<HTMLDivElement | null>;
    bloomed: boolean;
  }
>(function InvitationReveal({ monogramWrapRef, foilRef, bloomed }, cardRef) {
  return (
    <div
      ref={cardRef}
      data-invitation-card
      className="absolute inset-[3%] flex flex-col items-center justify-between overflow-hidden rounded-[2px] px-6 py-8 text-center opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:px-8 sm:py-10"
      style={{
        // A single layered background: crystal-highlight glints over the
        // approved lavender gradient. Combined here (rather than split
        // across a Tailwind gradient class + inline style) because an
        // inline `background-image` always wins over classes and would
        // otherwise silently replace the lavender gradient with nothing.
        backgroundImage: `radial-gradient(circle at 15% 10%, rgba(255,255,255,0.45), transparent 40%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.2), transparent 45%), linear-gradient(180deg, var(--color-moon-lavender) 0%, var(--color-lavender-mist) 55%, var(--color-dusty-lilac) 100%)`,
      }}
    >
      <GoldFrame />

      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div
          ref={monogramWrapRef}
          className="flex items-end gap-2 font-script text-6xl leading-none text-champagne-gold sm:text-7xl"
        >
          {COUPLE.initials.map((char, i) => (
            <span key={`${char}-${i}`} className="inline-block opacity-0">
              {char}
            </span>
          ))}
        </div>

        {/* Foil sheen sweep uses the antique -> champagne-glow -> soft
            gold ramp, so it reads as metallic foil rather than flat
            yellow when the highlight passes across it. */}
        <div
          ref={foilRef}
          className="mt-3 bg-[linear-gradient(110deg,#b88a4a_20%,#e6d6a8_45%,#cfae70_55%,#b88a4a_80%)] bg-[length:250%_100%] bg-clip-text font-display text-3xl font-medium tracking-[0.15em] text-transparent sm:text-4xl"
        >
          {COUPLE.names.toUpperCase()}
        </div>

        <p className="mt-2 max-w-[240px] font-body text-[11px] uppercase tracking-[0.25em] text-muted-text sm:text-xs">
          {COUPLE.tagline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <p className="mt-3 font-display text-sm tracking-[0.4em] text-champagne-gold">
          {COUPLE.date}
        </p>
      </div>

      <FloralWreath className="h-16 w-full sm:h-20" animate={bloomed} />
    </div>
  );
});
