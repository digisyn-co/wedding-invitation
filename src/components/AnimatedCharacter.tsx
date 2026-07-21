import type { CSSProperties } from "react";

/**
 * Original illustrated wedding characters — a groom and a bride — drawn
 * as inline SVG with gentle idle motion (floating, blinking, sparkles).
 * Fully self-contained: no external assets, works offline and on
 * deploy. Fills its (elliptical) container via preserveAspectRatio
 * slice. All figures are original artwork, not derived from any
 * existing character.
 */

const SKIN = "#ecc7ae";
const EYE = "#3a3550";
const CHEEK = "rgba(224,150,150,.55)";

function Eyes({ delay }: { delay: string }) {
  return (
    <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: `blink 4.4s ease-in-out ${delay} infinite` } as CSSProperties}>
      <ellipse cx={44} cy={38} rx={1.9} ry={2.7} fill={EYE} />
      <ellipse cx={56} cy={38} rx={1.9} ry={2.7} fill={EYE} />
      <circle cx={44.7} cy={37} r={0.7} fill="#fff" />
      <circle cx={56.7} cy={37} r={0.7} fill="#fff" />
    </g>
  );
}

function Face({ blinkDelay }: { blinkDelay: string }) {
  return (
    <>
      <path d="M40 33 Q44 31 47.5 33" stroke="#7a5a3a" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M52.5 33 Q56 31 60 33" stroke="#7a5a3a" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.7} />
      <Eyes delay={blinkDelay} />
      <circle cx={39} cy={44} r={2.6} fill={CHEEK} />
      <circle cx={61} cy={44} r={2.6} fill={CHEEK} />
      <path d="M45 46 Q50 50.5 55 46" stroke="#b06a6a" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </>
  );
}

/** A single figure drawn in a 100×125 local coordinate box. */
function Figure({ variant, blinkDelay }: { variant: "groom" | "bride"; blinkDelay: string }) {
  if (variant === "groom") {
    return (
      <g>
        {/* jacket */}
        <path d="M27 66 Q50 57 73 66 L80 125 L20 125 Z" fill="#3a3550" />
        <path d="M27 66 Q50 57 73 66 L69 78 Q50 70 31 78 Z" fill="#2e2a40" />
        {/* shirt */}
        <path d="M44 60 L50 74 L56 60 Z" fill="#f6eee6" />
        {/* neck */}
        <rect x={46} y={50} width={8} height={9} rx={3} fill={SKIN} />
        {/* head */}
        <circle cx={50} cy={40} r={15} fill={SKIN} />
        {/* hair */}
        <path d="M35 40 Q34 22 50 22 Q66 22 65 40 Q62 31 50 30 Q38 31 35 40 Z" fill="#4a3826" />
        <Face blinkDelay={blinkDelay} />
        {/* bow tie */}
        <g transform="translate(50 60)">
          <path d="M-6 -3 L0 0 L-6 3 Z" fill="#c9a35b" />
          <path d="M6 -3 L0 0 L6 3 Z" fill="#c9a35b" />
          <circle cx={0} cy={0} r={1.6} fill="#9a7636" />
        </g>
      </g>
    );
  }
  // bride
  return (
    <g>
      {/* veil */}
      <path d="M50 24 Q22 34 20 96 Q35 86 50 88 Q65 86 80 96 Q78 34 50 24 Z" fill="rgba(255,255,255,.42)" />
      {/* hair back */}
      <path d="M33 40 Q30 24 50 24 Q70 24 67 40 L67 58 Q50 52 33 58 Z" fill="#5a4632" />
      {/* gown */}
      <path d="M30 64 Q50 57 70 64 L84 125 L16 125 Z" fill="#f6eee6" />
      <path d="M30 64 Q50 57 70 64 L66 74 Q50 68 34 74 Z" fill="#f2d8d7" opacity={0.8} />
      <path d="M20 125 Q50 112 80 125 Z" fill="#eadfce" opacity={0.6} />
      {/* waist ribbon */}
      <path d="M36 82 Q50 86 64 82 L63 87 Q50 91 37 87 Z" fill="#c9a35b" opacity={0.85} />
      {/* neckline */}
      <path d="M43 60 Q50 66 57 60 L57 63 Q50 69 43 63 Z" fill={SKIN} />
      {/* neck */}
      <rect x={46} y={50} width={8} height={9} rx={3} fill={SKIN} />
      {/* head */}
      <circle cx={50} cy={40} r={15} fill={SKIN} />
      {/* hair front */}
      <path d="M35 40 Q33 23 50 23 Q67 23 65 40 Q61 32 55 31 Q54 36 50 36 Q46 36 45 31 Q39 32 35 40 Z" fill="#5a4632" />
      <Face blinkDelay={blinkDelay} />
      {/* floral crown */}
      <g>
        <circle cx={40} cy={28} r={1.8} fill="#f2d8d7" />
        <circle cx={46} cy={25} r={1.8} fill="#e9d29a" />
        <circle cx={54} cy={25} r={1.8} fill="#f2d8d7" />
        <circle cx={60} cy={28} r={1.8} fill="#e9d29a" />
        <circle cx={50} cy={24} r={1.6} fill="#f6eee6" />
      </g>
      {/* bouquet */}
      <g transform="translate(50 104)">
        <circle cx={-3} cy={0} r={3} fill="#f2d8d7" />
        <circle cx={3} cy={0} r={3} fill="#ebcfcf" />
        <circle cx={0} cy={-3} r={2.6} fill="#f6eee6" />
        <circle cx={0} cy={2} r={2.6} fill="#e9d29a" />
        <path d="M0 3 L0 12" stroke="#8a9a6a" strokeWidth={1.4} strokeLinecap="round" />
      </g>
    </g>
  );
}

function Sparkles() {
  const pts = [
    { x: 20, y: 30, d: "0s" },
    { x: 82, y: 42, d: "1.1s" },
    { x: 74, y: 20, d: "2.2s" },
    { x: 26, y: 64, d: "1.6s" },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={1.6}
          fill="#f6eccf"
          style={{ transformBox: "fill-box", transformOrigin: "center", animation: `sparkle 3.4s ease-in-out ${p.d} infinite` } as CSSProperties}
        />
      ))}
    </>
  );
}

export function AnimatedCharacter({
  variant,
  style,
}: {
  variant: "groom" | "bride" | "couple";
  style?: CSSProperties;
}) {
  const gid = `charbg-${variant}`;
  return (
    <svg
      viewBox="0 0 100 125"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#e7e5f3" />
          <stop offset="60%" stopColor="#d7d5e8" />
          <stop offset="100%" stopColor="#c7c2dd" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={100} height={125} fill={`url(#${gid})`} />
      <Sparkles />

      {variant === "couple" ? (
        // Two figures side by side. Positioning lives on the OUTER <g>
        // (SVG transform attribute); the float animation lives on an
        // INNER <g> (CSS transform) so the two don't collide — a CSS
        // transform overrides the SVG transform attribute on the same
        // element, which would otherwise stack both figures at center.
        <>
          <g transform="translate(0 30) scale(.5)">
            <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "floatySlow 11s ease-in-out infinite" } as CSSProperties}>
              <Figure variant="groom" blinkDelay="0.2s" />
            </g>
          </g>
          <g transform="translate(50 30) scale(.5)">
            <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "floatySlow 13s ease-in-out infinite" } as CSSProperties}>
              <Figure variant="bride" blinkDelay="1.4s" />
            </g>
          </g>
        </>
      ) : (
        <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "floatySlow 12s ease-in-out infinite" } as CSSProperties}>
          <Figure variant={variant} blinkDelay={variant === "groom" ? "0.3s" : "1.2s"} />
        </g>
      )}
    </svg>
  );
}
