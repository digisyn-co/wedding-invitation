"use client";

import { useId, type CSSProperties } from "react";

/**
 * A realistic white dove in graceful flight — original layered SVG:
 * slim teardrop body, fanned tail, raised wings with spread primary
 * feathers, feather-shaft detailing, and a soft iridescent neck sheen.
 * Wings flap via CSS (positioning stays on the parent). `flip`
 * mirrors it for the second dove. Gradient ids are namespaced with
 * useId so multiple doves can coexist.
 */
export function Dove({
  flip = false,
  flapDelay = "0s",
  flapDur = ".5s",
}: {
  flip?: boolean;
  flapDelay?: string;
  /** Wing-beat period — faster (e.g. ".36s") reads as an urgent takeoff. */
  flapDur?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const g = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${g(name)})`;

  return (
    <svg
      viewBox="0 0 140 100"
      width="84"
      height="60"
      style={{
        display: "block",
        transform: flip ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 0 12px rgba(246,236,196,.6)) drop-shadow(0 4px 10px rgba(0,0,0,.25))",
      }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={g("bodyG")} cx="55%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f3eee1" />
          <stop offset="100%" stopColor="#d0c9b4" />
        </radialGradient>
        <radialGradient id={g("headG")} cx="40%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6dfcd" />
        </radialGradient>
        <linearGradient id={g("wingNG")} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f2ecdf" />
          <stop offset="100%" stopColor="#d5cdb8" />
        </linearGradient>
        <linearGradient id={g("wingFG")} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#e5decb" />
          <stop offset="100%" stopColor="#b8b099" />
        </linearGradient>
        <linearGradient id={g("tailG")} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#f5f0e3" />
          <stop offset="100%" stopColor="#c4bda7" />
        </linearGradient>
        <linearGradient id={g("sheenG")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cdbfe0" stopOpacity=".5" />
          <stop offset="55%" stopColor="#e9d8b0" stopOpacity=".4" />
          <stop offset="100%" stopColor="#cdbfe0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* far wing — behind the body, counter-flapping */}
      <g opacity=".92" transform="translate(-3 2)">
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "95% 95%",
            animation: `flapWing ${flapDur} ease-in-out ${flapDelay} infinite reverse`,
          } as CSSProperties}
        >
          <path d="M80 46 C 74 34 64 20 50 10 C 53 18 54 22 51 24 C 58 24 62 28 59 32 C 65 31 69 34 66 38 C 71 38 75 42 72 44 C 75 45 78 46 80 46 Z" fill={url("wingFG")} />
          <path d="M56 16 C 46 9 36 5 26 4 C 36 11 46 16 57 21 Z" fill={url("wingFG")} />
          <path d="M59 23 C 48 18 38 16 28 17 C 38 22 49 25 60 27 Z" fill={url("wingFG")} opacity=".9" />
          <path d="M77 43 C 68 34 58 24 50 15" stroke="rgba(140,130,105,.45)" strokeWidth=".7" fill="none" />
        </g>
      </g>

      {/* fanned tail */}
      <path d="M34 56 C 22 46 12 40 4 38 C 12 47 22 54 34 60 Z" fill={url("tailG")} />
      <path d="M33 58 C 20 52 8 50 0 51 C 10 58 22 61 33 62 Z" fill={url("tailG")} />
      <path d="M33 60 C 20 60 8 63 2 68 C 12 69 24 66 34 63 Z" fill={url("tailG")} />
      <path d="M34 62 C 24 66 14 72 10 78 C 20 74 30 68 36 64 Z" fill={url("tailG")} />
      <path d="M34 57 L6 40 M33 60 L2 52 M33 61 L4 66 M35 63 L12 76" stroke="rgba(150,140,115,.3)" strokeWidth=".5" />

      {/* body — slim teardrop flowing into the neck */}
      <path d="M34 52 C 50 46 68 44 82 44 C 90 43 98 38 103 36 C 108 40 110 45 106 50 C 100 57 84 61 66 61 C 52 61 40 57 34 52 Z" fill={url("bodyG")} />
      <path d="M56 59 C 70 62 88 59 100 52 C 92 59 76 62 62 61 Z" fill="rgba(165,155,130,.38)" />

      {/* head + iridescent neck sheen */}
      <circle cx="105" cy="40" r="7" fill={url("headG")} />
      <ellipse cx="94" cy="46" rx="6.5" ry="4" fill={url("sheenG")} />

      {/* beak */}
      <path d="M111.5 38.4 L120 40.4 L111.5 42.2 C 111 40.9 111 39.6 111.5 38.4 Z" fill="#b98f4e" />
      <path d="M111.5 40.8 L118 40.8 L111.5 42.2 Z" fill="#8f6c38" />
      <ellipse cx="112.2" cy="38.7" rx="1.1" ry=".7" fill="#e8ddc2" />

      {/* eye with ring + catchlight */}
      <circle cx="107" cy="38.2" r="1.9" fill="#2a241d" />
      <circle cx="107.7" cy="37.5" r=".55" fill="#fff" />
      <circle cx="107" cy="38.2" r="2.4" fill="none" stroke="rgba(216,201,168,.65)" strokeWidth=".45" />

      {/* near wing — grand, raised, spread primaries, flapping */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "97% 96%",
          animation: `flapWing ${flapDur} ease-in-out ${flapDelay} infinite`,
        } as CSSProperties}
      >
        <path d="M52 22 C 40 12 28 5 14 2 C 26 10 38 18 53 27 Z" fill={url("wingNG")} />
        <path d="M55 28 C 42 21 30 17 17 16 C 29 23 43 28 57 32 Z" fill={url("wingNG")} />
        <path d="M58 33 C 46 29 34 28 24 30 C 35 34 48 36 60 37 Z" fill={url("wingNG")} opacity=".95" />
        <path d="M80 50 C 72 38 62 22 50 12 C 53 20 54 24 51 26 C 58 26 62 30 59 34 C 65 33 69 36 66 40 C 72 41 76 44 73 47 C 76 48 78 49 80 50 Z" fill={url("wingNG")} />
        <path d="M73 45 C 62 34 52 22 44 12" stroke="rgba(160,150,125,.5)" strokeWidth=".8" fill="none" />
        <path d="M67 41 C 56 33 45 26 34 21" stroke="rgba(160,150,125,.4)" strokeWidth=".6" fill="none" />
        <path d="M62 37 C 52 33 42 31 32 31" stroke="rgba(160,150,125,.3)" strokeWidth=".5" fill="none" />
        <path d="M80 50 C 72 43 66 36 62 28 C 68 32 74 40 82 48 Z" fill="#ffffff" opacity=".9" />
      </g>
    </svg>
  );
}
