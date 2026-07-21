"use client";

import { forwardRef } from "react";
import { GoldFrame } from "@/components/GoldFrame";
import { FloralWreath } from "@/components/FloralWreath";
import { PaperTexture } from "@/components/PaperTexture";
import { WEDDING } from "@/lib/content";

export interface InvitationRevealHandle {
  monogramChars: HTMLElement[];
}

/**
 * The invitation card that rises out of the envelope once the seal
 * breaks. Presentational only; the parent (`OpeningScene`) owns the
 * reveal timing via refs.
 *
 * Two render paths:
 *  1. Real artwork — when `WEDDING.artwork.card` is set, the photoreal
 *     render fills the card face (florals, crest, paper, foil all
 *     baked in). A moving light streak (`foilRef`) sweeps the gold; a
 *     soft glow (`monogramWrapRef`) blooms over the crest. Live text
 *     is kept visually-hidden for screen readers/SEO.
 *  2. Fallback — the hand-built card (paper grain + deckled edge +
 *     SVG florals), used until the artwork asset is provided.
 */
export const InvitationReveal = forwardRef<
  HTMLDivElement,
  {
    monogramWrapRef: React.RefObject<HTMLDivElement | null>;
    foilRef: React.RefObject<HTMLDivElement | null>;
    bloomed: boolean;
  }
>(function InvitationReveal({ monogramWrapRef, foilRef, bloomed }, cardRef) {
  const { couple, poem, dateDisplay, artwork } = WEDDING;

  if (artwork.card) {
    return (
      <div
        ref={cardRef}
        data-invitation-card
        className="absolute inset-0 overflow-hidden rounded-[3px] opacity-0 shadow-[0_28px_70px_rgba(0,0,0,0.6)]"
      >
        {/* The render already carries its own deckled paper border, so
            it fills the frame edge-to-edge (no extra mask/crop). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artwork.card}
          alt={`Wedding invitation of ${couple.names}, ${dateDisplay}`}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* moving foil light-streak over the render */}
        <div
          ref={foilRef}
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.35)_48%,rgba(249,250,252,0.55)_50%,transparent_62%)] bg-[length:250%_100%] mix-blend-soft-light"
        />

        {/* soft crest glow bloom */}
        <div
          ref={monogramWrapRef}
          className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
        >
          <span className="block h-24 w-24 rounded-full bg-champagne-gold/25 opacity-0 blur-2xl" />
        </div>

        {/* screen-reader / SEO text (visually hidden) */}
        <span className="sr-only">
          {couple.names}. {poem.join(" ")} {dateDisplay}.
        </span>
      </div>
    );
  }

  // ---- Fallback: hand-built card ----
  return (
    <div
      ref={cardRef}
      data-invitation-card
      className="absolute inset-[3%] flex flex-col items-center justify-between overflow-hidden rounded-[2px] px-6 py-8 text-center opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:px-8 sm:py-10"
      style={{
        // deckled soft edge
        WebkitMaskImage: "radial-gradient(125% 135% at 50% 50%, #000 93%, transparent 100%)",
        maskImage: "radial-gradient(125% 135% at 50% 50%, #000 93%, transparent 100%)",
        // crystal-highlight glints over the approved lavender gradient
        backgroundImage: `radial-gradient(circle at 15% 10%, rgba(255,255,255,0.45), transparent 40%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.2), transparent 45%), linear-gradient(180deg, var(--color-moon-lavender) 0%, var(--color-lavender-mist) 55%, var(--color-dusty-lilac) 100%)`,
      }}
    >
      <PaperTexture variant="grain" opacity={0.22} />
      <GoldFrame />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-3">
        <div
          ref={monogramWrapRef}
          className="flex items-end gap-2 font-script text-6xl leading-none text-champagne-gold sm:text-7xl"
        >
          {couple.initials.map((char, i) => (
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
          {couple.names.toUpperCase()}
        </div>

        <p className="mt-2 max-w-[260px] font-body text-[11px] uppercase tracking-[0.22em] text-muted-text sm:text-xs">
          {poem.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <p className="mt-3 font-display text-sm tracking-[0.4em] text-champagne-gold">
          {dateDisplay}
        </p>
      </div>

      <FloralWreath className="relative h-16 w-full sm:h-20" animate={bloomed} />
    </div>
  );
});
