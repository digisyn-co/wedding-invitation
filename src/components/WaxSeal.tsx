"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface WaxSealHandle {
  root: HTMLButtonElement | null;
  crackPaths: SVGPathElement[];
}

/**
 * The wax seal itself — sealing wax disc with an engraved sprig emblem
 * and three hairline crack paths (hidden via stroke-dasharray until
 * the break timeline draws them in). All animation is orchestrated
 * externally by `animations/sealTimeline.ts` so this stays a dumb,
 * presentational button.
 */
export const WaxSeal = forwardRef<
  HTMLButtonElement,
  { onActivate: () => void; disabled?: boolean; className?: string }
>(function WaxSeal({ onActivate, disabled, className }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onActivate}
      disabled={disabled}
      aria-label="Break the wax seal to open your invitation"
      data-wax-seal
      className={cn(
        "group relative flex h-24 w-24 items-center justify-center rounded-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold focus-visible:ring-offset-2 focus-visible:ring-offset-twilight-975",
        "disabled:pointer-events-none",
        className,
      )}
    >
      <span
        data-seal-glow
        className="absolute inset-[-14px] rounded-full bg-champagne-gold/30 blur-xl transition-opacity duration-700 group-hover:bg-champagne-gold/45"
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 200 200"
        className="relative h-full w-full drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      >
        {/* Wax gradient uses the champagne → soft → antique gold ramp
            from the approved palette, so the seal reads as metallic
            foil rather than flat yellow. */}
        <defs>
          <radialGradient id="waxGradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e6d6a8" />
            <stop offset="45%" stopColor="#cfae70" />
            <stop offset="100%" stopColor="#b88a4a" />
          </radialGradient>
          <radialGradient id="waxSheen" cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#f9fafc" stopOpacity={0.75} />
            <stop offset="100%" stopColor="#f9fafc" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* wax disc */}
        <circle cx="100" cy="100" r="88" fill="url(#waxGradient)" />
        <circle cx="100" cy="100" r="88" fill="url(#waxSheen)" />
        <circle
          cx="100"
          cy="100"
          r="79"
          fill="none"
          stroke="#6b4f24"
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="1 5"
        />

        {/* engraved sprig emblem (initials sit above via HTML overlay) —
            depth shading uses a darkened antique-gold, same hue family */}
        <g opacity={0.85} stroke="#6b4f24" strokeWidth={1.4} fill="none" strokeLinecap="round">
          <path d="M100 60 C100 90 100 110 100 140" />
          <path d="M100 78 C88 72 78 76 72 86" />
          <path d="M100 78 C112 72 122 76 128 86" />
          <path d="M100 100 C90 96 82 100 77 108" />
          <path d="M100 100 C110 96 118 100 123 108" />
          <path d="M100 122 C92 120 86 124 82 130" />
          <path d="M100 122 C108 120 114 124 118 130" />
        </g>

        {/* crack paths — invisible until the break timeline draws them */}
        <g data-crack-group strokeLinecap="round" fill="none">
          <path
            data-crack
            d="M100 26 L92 66 L112 92 L84 118 L104 150 L94 176"
            stroke="#4a3818"
            strokeWidth={2.2}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          <path
            data-crack
            d="M26 96 L64 100 L58 118 L96 112 L110 132 L150 122"
            stroke="#4a3818"
            strokeWidth={1.8}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          <path
            data-crack
            d="M60 40 L86 70 L70 96 L100 100"
            stroke="#4a3818"
            strokeWidth={1.4}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </g>
      </svg>
    </button>
  );
});
