"use client";

import { useId } from "react";
import { FocalImage } from "@/components/FocalImage";
import type { WeddingPhoto } from "@/lib/content";

/**
 * StoryLocket — the couture "engraved locket" treatment for the
 * chapter photographs in Our Story.
 *
 * A real photograph sits inside a triple gold fillet (hairline /
 * band / hairline via layered box-shadow rings), wrapped by:
 *   · a slowly revolving beaded ring (transform-only rotation — GPU
 *     composited, negligible cost on phones)
 *   · a static engraved ornament plate: double hairline ellipses, a
 *     marquise jewel crowning the top with flanking curls, laurel
 *     sprigs meeting a diamond at the base, four-point side stars
 *   · an ethereal grade on the photograph itself (static CSS filter +
 *     gold-dusk gradient + vignette) so casual snapshots read as
 *     editorial plates inside the night-sky palette.
 *
 * Everything is SVG hairlines and gradients — no blur filters, no
 * per-frame filter animation — so the low-power tier needs no special
 * casing. Global prefers-reduced-motion CSS freezes the rotation.
 */

const GOLD_STOPS = (
  <>
    <stop offset="0%" stopColor="#f4e7c4" />
    <stop offset="45%" stopColor="#c9a35b" />
    <stop offset="75%" stopColor="#e9d29a" />
    <stop offset="100%" stopColor="#b8935a" />
  </>
);

export function StoryLocket({ photo, alt }: { photo: WeddingPhoto; alt: string }) {
  const uid = useId().replace(/[:]/g, "");
  const gb = `lkb-${uid}`;
  const go = `lko-${uid}`;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* halo — a breath of gold mist behind the locket */}
      <div aria-hidden style={{ position: "absolute", inset: "-26%", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 46%, rgba(216,189,133,.20), rgba(200,196,224,.06) 48%, transparent 70%)", pointerEvents: "none" }} />

      {/* revolving beaded ring */}
      <svg aria-hidden viewBox="0 0 230 287" style={{ position: "absolute", inset: "-7.5%", width: "115%", height: "115%", overflow: "visible", animation: "spinSlow 70s linear infinite" }}>
        <defs>
          <linearGradient id={gb} x1="0" y1="0" x2="1" y2="1">{GOLD_STOPS}</linearGradient>
        </defs>
        <ellipse cx="115" cy="143.5" rx="111" ry="139" fill="none" stroke={`url(#${gb})`} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 11" opacity=".9" />
      </svg>

      {/* engraved ornament plate */}
      <svg aria-hidden viewBox="0 0 290 362" style={{ position: "absolute", inset: "-17%", width: "134%", height: "134%", overflow: "visible", filter: "drop-shadow(0 0 6px rgba(233,210,154,.35))" }}>
        <defs>
          <linearGradient id={go} x1="0" y1="0" x2="1" y2="1">{GOLD_STOPS}</linearGradient>
        </defs>
        <ellipse cx="145" cy="181" rx="130" ry="163" fill="none" stroke={`url(#${go})`} strokeWidth="1" opacity=".85" />
        <ellipse cx="145" cy="181" rx="122" ry="153" fill="none" stroke={`url(#${go})`} strokeWidth=".6" opacity=".55" />
        {/* crown: marquise jewel + flanking curls */}
        <g stroke={`url(#${go})`} fill="none" strokeWidth="1.3" strokeLinecap="round">
          <path d="M145 12 C 150 18 150 24 145 30 C 140 24 140 18 145 12 Z" fill={`url(#${go})`} fillOpacity=".8" />
          <path d="M133 22 C 120 16 108 18 100 28" />
          <path d="M157 22 C 170 16 182 18 190 28" />
          <circle cx="96" cy="31" r="1.6" fill={`url(#${go})`} stroke="none" />
          <circle cx="194" cy="31" r="1.6" fill={`url(#${go})`} stroke="none" />
        </g>
        {/* base: laurel sprigs meeting at a diamond */}
        <g stroke={`url(#${go})`} fill="none" strokeWidth="1.2" strokeLinecap="round">
          <path d="M145 350 L149 344 L145 338 L141 344 Z" fill={`url(#${go})`} fillOpacity=".85" strokeWidth=".8" />
          <path d="M135 344 C 112 344 92 336 78 320" />
          <path d="M155 344 C 178 344 198 336 212 320" />
          <path d="M124 343 C 122 337 117 333 111 332 M111 341 C 106 336 99 333 93 333 M97 337 C 93 331 87 327 81 326" strokeWidth="1" />
          <path d="M166 343 C 168 337 173 333 179 332 M179 341 C 184 336 191 333 197 333 M193 337 C 197 331 203 327 209 326" strokeWidth="1" />
        </g>
        {/* four-point side stars */}
        <g fill={`url(#${go})`}>
          <path d="M8 171.5 L10.4 178.5 L17 181 L10.4 183.5 L8 190.5 L5.6 183.5 L-1 181 L5.6 178.5 Z" />
          <path d="M282 171.5 L284.4 178.5 L291 181 L284.4 183.5 L282 190.5 L279.6 183.5 L273 181 L279.6 178.5 Z" />
        </g>
      </svg>

      {/* the photograph, in its triple gold fillet */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 1px rgba(246,236,207,.85), 0 0 0 3.5px rgba(180,140,74,.9), 0 0 0 5px rgba(246,236,207,.28), 0 26px 60px rgba(0,0,0,.55), 0 0 56px rgba(216,189,133,.24)" }}>
        <FocalImage
          photo={photo}
          alt={alt}
          sizes="(max-width: 768px) 50vw, 206px"
          style={{ filter: "sepia(.22) saturate(.88) contrast(1.05) brightness(.98)" }}
        />
        {/* gold-dusk grade */}
        <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(168deg, rgba(246,236,207,.16) 0%, rgba(148,128,186,.10) 46%, rgba(20,16,34,.42) 100%)" }} />
        {/* vignette + engraved inner fillet */}
        <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 42%, transparent 48%, rgba(14,12,24,.52) 100%)", boxShadow: "inset 0 0 34px rgba(16,13,28,.6), inset 0 0 0 1px rgba(246,236,207,.3), inset 0 0 0 2.5px rgba(120,95,50,.35)" }} />
      </div>
    </div>
  );
}
