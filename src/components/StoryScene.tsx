import type { CSSProperties } from "react";
import { Figure } from "@/components/AnimatedCharacter";

/**
 * A little animated vignette for each "Our Story" chapter — the
 * characters act out the moment. All original SVG + CSS motion, no
 * external assets. Fills its (4:5) container.
 *
 *  0 The First Glance  — they stroll toward one another, hearts rising
 *  1 A Thousand Letters — love letters flit across the miles
 *  2 The Question       — the groom kneels, ring aglow, stars above
 *  3 The Beginning      — the couple sway together beneath falling petals
 */

const anim = (a: string): CSSProperties => ({ transformBox: "fill-box", transformOrigin: "center bottom", animation: a });

// A posed, animated figure: outer <g> positions (SVG transform), inner
// <g> carries the CSS motion so the two never fight.
function Posed({
  variant,
  x,
  y,
  s,
  motion,
  tilt = 0,
  blink,
}: {
  variant: "groom" | "bride";
  x: number;
  y: number;
  s: number;
  motion: string;
  tilt?: number;
  blink: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      <g style={anim(motion)}>
        <Figure variant={variant} blinkDelay={blink} />
      </g>
    </g>
  );
}

function Heart({ x, y, delay, color = "#e88a9a" }: { x: number; y: number; delay: string; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} style={{ transformBox: "fill-box", transformOrigin: "center", animation: `heartRise 3s ease-out ${delay} infinite` } as CSSProperties}>
      <path d="M0 2.5 C -2.4 -1.4 -6 0.6 0 5.5 C 6 0.6 2.4 -1.4 0 2.5 Z" fill={color} />
    </g>
  );
}

function Twinkle({ x, y, r, delay }: { x: number; y: number; r: number; delay: string }) {
  return <circle cx={x} cy={y} r={r} fill="#f6efd8" style={{ transformBox: "fill-box", transformOrigin: "center", animation: `twinkle ${3 + r}s ease-in-out ${delay} infinite` } as CSSProperties} />;
}

function SceneShell({ children, tint = "#241f3c" }: { children: React.ReactNode; tint?: string }) {
  return (
    <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
      <defs>
        <radialGradient id={`sky-${tint.slice(1)}`} cx="50%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#3a3357" />
          <stop offset="55%" stopColor={tint} />
          <stop offset="100%" stopColor="#14121f" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={100} height={125} fill={`url(#sky-${tint.slice(1)})`} />
      {/* horizon glow */}
      <ellipse cx={50} cy={116} rx={54} ry={12} fill="rgba(216,189,133,.18)" style={{ filter: "blur(3px)" }} />
      {children}
    </svg>
  );
}

export function StoryScene({ chapter }: { chapter: number }) {
  if (chapter === 0) {
    // The First Glance — stroll toward each other, hearts between
    return (
      <SceneShell>
        <Twinkle x={20} y={22} r={1.1} delay="0s" />
        <Twinkle x={78} y={18} r={1.3} delay="1.2s" />
        <Twinkle x={62} y={30} r={0.9} delay="2s" />
        <g style={{ transformBox: "fill-box", transformOrigin: "center bottom", animation: "strollIn 4s ease-in-out infinite" } as CSSProperties}>
          <Posed variant="groom" x={14} y={54} s={0.46} motion="walk 1.6s ease-in-out infinite" blink="0.2s" />
        </g>
        <g style={{ ["--sx" as string]: "14px", transformBox: "fill-box", transformOrigin: "center bottom", animation: "strollIn 4s ease-in-out .2s infinite" } as CSSProperties}>
          <Posed variant="bride" x={40} y={54} s={0.46} motion="walk 1.6s ease-in-out .3s infinite" blink="1s" />
        </g>
        <Heart x={50} y={64} delay="0.4s" />
        <Heart x={46} y={70} delay="1.6s" color="#f2d8d7" />
      </SceneShell>
    );
  }

  if (chapter === 1) {
    // A Thousand Letters — envelopes flit across the gap
    const Envelope = ({ delay, lx, ly, lr, x, y }: { delay: string; lx: string; ly: string; lr: string; x: number; y: number }) => (
      <g transform={`translate(${x} ${y})`} style={{ transformBox: "fill-box", transformOrigin: "center", ["--lx" as string]: lx, ["--ly" as string]: ly, ["--lr" as string]: lr, animation: `letterFly 4.5s ease-in-out ${delay} infinite` } as CSSProperties}>
        <rect x={-5} y={-3.4} width={10} height={7} rx={1} fill="#f6eee6" stroke="#c9a35b" strokeWidth={0.4} />
        <path d="M-5 -3 L0 1 L5 -3" fill="none" stroke="#c9a35b" strokeWidth={0.4} />
      </g>
    );
    return (
      <SceneShell tint="#1f2440">
        <Twinkle x={50} y={16} r={1.1} delay="0.5s" />
        <Twinkle x={30} y={24} r={0.9} delay="1.5s" />
        <Twinkle x={70} y={26} r={1} delay="0.2s" />
        <Posed variant="groom" x={4} y={56} s={0.42} motion="floatySlow 6s ease-in-out infinite" blink="0.3s" />
        <Posed variant="bride" x={54} y={56} s={0.42} motion="floatySlow 7s ease-in-out .5s infinite" blink="1.2s" />
        {/* letters crossing */}
        <Envelope delay="0s" lx="46px" ly="-4px" lr="14deg" x={28} y={58} />
        <Envelope delay="2.2s" lx="-46px" ly="-4px" lr="-14deg" x={72} y={64} />
        <Heart x={50} y={54} delay="1s" color="#f2d8d7" />
      </SceneShell>
    );
  }

  if (chapter === 2) {
    // The Question — the groom kneels, ring aglow, stars above
    return (
      <SceneShell tint="#221b3a">
        <Twinkle x={26} y={16} r={1.2} delay="0s" />
        <Twinkle x={50} y={12} r={1.4} delay="0.8s" />
        <Twinkle x={74} y={18} r={1.1} delay="1.6s" />
        <Twinkle x={40} y={24} r={0.9} delay="2.2s" />
        <Twinkle x={64} y={26} r={1} delay="1.1s" />
        {/* bride, joyful little bob */}
        <Posed variant="bride" x={50} y={52} s={0.48} motion="walk 1.4s ease-in-out infinite" blink="0.6s" />
        {/* groom, kneeling: lower, smaller, tilted toward her */}
        <Posed variant="groom" x={12} y={78} s={0.34} motion="floatySlow 6s ease-in-out infinite" tilt={10} blink="0.2s" />
        {/* the ring, glowing between them */}
        <g transform="translate(40 86)" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "ringPulse 1.8s ease-in-out infinite" } as CSSProperties}>
          <circle cx={0} cy={1.5} r={2.4} fill="none" stroke="#e9d29a" strokeWidth={1.1} />
          <path d="M0 -1 L1.4 -3 L-1.4 -3 Z" fill="#f9fafc" />
          <circle cx={0} cy={-3.4} r={1.1} fill="#f9fafc" />
        </g>
        <Heart x={54} y={58} delay="0.5s" />
        <Heart x={60} y={64} delay="1.8s" color="#f2d8d7" />
      </SceneShell>
    );
  }

  // The Beginning — the couple sway together beneath falling petals
  const PETALS = [
    { x: 20, delay: "0s", dur: "5s", fx: "8px", fr: "220deg", c: "#f2d8d7" },
    { x: 34, delay: "1.4s", dur: "6s", fx: "-6px", fr: "-180deg", c: "#e9d29a" },
    { x: 50, delay: "0.6s", dur: "5.4s", fx: "10px", fr: "240deg", c: "#f6eee6" },
    { x: 66, delay: "2s", dur: "6.4s", fx: "-8px", fr: "-200deg", c: "#ebcfcf" },
    { x: 80, delay: "1s", dur: "5.8s", fx: "6px", fr: "160deg", c: "#e9d29a" },
  ];
  return (
    <SceneShell tint="#2a2440">
      <Twinkle x={24} y={18} r={1.1} delay="0.4s" />
      <Twinkle x={72} y={16} r={1.2} delay="1.3s" />
      {/* couple close together, swaying as one */}
      <Posed variant="groom" x={30} y={54} s={0.46} motion="sway 4s ease-in-out infinite" blink="0.3s" />
      <Posed variant="bride" x={46} y={54} s={0.46} motion="sway 4s ease-in-out infinite" blink="1.1s" />
      <Heart x={50} y={50} delay="0.8s" />
      {/* falling petals */}
      {PETALS.map((p, i) => (
        <g key={i} transform={`translate(${p.x} 8)`} style={{ transformBox: "fill-box", transformOrigin: "center", ["--fx" as string]: p.fx, ["--fr" as string]: p.fr, animation: `fall ${p.dur} linear ${p.delay} infinite` } as CSSProperties}>
          <path d="M0 0 C 2.4 -1.4 3.4 1.4 0 3.4 C -3.4 1.4 -2.4 -1.4 0 0 Z" fill={p.c} />
        </g>
      ))}
    </SceneShell>
  );
}
