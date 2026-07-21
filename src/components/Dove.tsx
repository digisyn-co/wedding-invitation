import type { CSSProperties } from "react";

/**
 * An original little white dove with softly flapping wings, drawn as
 * inline SVG. Flight path is applied by the parent (via the doveFly
 * keyframe + CSS vars); this component only renders the bird and its
 * wing-flap motion. `flip` mirrors it for the second dove.
 */
export function Dove({ flip = false, flapDelay = "0s" }: { flip?: boolean; flapDelay?: string }) {
  return (
    <svg
      viewBox="0 0 64 44"
      width="64"
      height="44"
      style={{
        display: "block",
        transform: flip ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 0 10px rgba(246,236,196,.75)) drop-shadow(0 4px 10px rgba(0,0,0,.25))",
      }}
      aria-hidden="true"
    >
      {/* far wing (behind the body, slightly shaded, counter-flap) */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "80% 90%",
          animation: `flapWing .5s ease-in-out ${flapDelay} infinite reverse`,
        } as CSSProperties}
      >
        <path d="M30 20 C 14 2, 34 0, 38 18 C 34 20, 32 21, 30 20 Z" fill="#e9e2d0" />
      </g>

      {/* tail */}
      <path d="M18 26 L4 20 L10 28 L2 30 L12 33 L6 38 L20 32 Z" fill="#f4efe1" />
      {/* body */}
      <path d="M16 28 C 20 20, 36 18, 44 22 C 50 25, 48 32, 38 34 C 28 36, 18 33, 16 28 Z" fill="#fdfbf4" />
      {/* head + beak + eye */}
      <circle cx={46} cy={19} r={5.4} fill="#fdfbf4" />
      <path d="M51 18 L57 20 L51 21.6 Z" fill="#d8bd85" />
      <circle cx={47.5} cy={17.6} r={0.9} fill="#3a3550" />

      {/* near wing (in front, bright, big flap) */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "85% 92%",
          animation: `flapWing .5s ease-in-out ${flapDelay} infinite`,
        } as CSSProperties}
      >
        <path d="M32 24 C 12 6, 40 -4, 44 20 C 42 24, 36 26, 32 24 Z" fill="#ffffff" />
      </g>
    </svg>
  );
}
