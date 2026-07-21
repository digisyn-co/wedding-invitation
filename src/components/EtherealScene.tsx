import type { CSSProperties } from "react";
import { AnimatedCharacter } from "@/components/AnimatedCharacter";

/**
 * A self-contained, majestic moving illustration: a moonlit celestial
 * sky with drifting aurora, twinkling stars, shooting stars, rising
 * gold petals, parallax hills, a glowing portal arch, and the couple
 * beneath it. Pure CSS/SVG motion — no external assets, no JS. Fills
 * its (relatively-positioned) parent.
 */

// Deterministic star field (fixed so SSR and client markup match).
const STARS: { top: number; left: number; s: number; d: number; delay: number }[] = [
  { top: 8, left: 6, s: 2, d: 3.2, delay: 0 }, { top: 14, left: 22, s: 1.4, d: 4.1, delay: 1.1 },
  { top: 6, left: 40, s: 1.8, d: 3.6, delay: 0.6 }, { top: 11, left: 58, s: 1.3, d: 4.4, delay: 2.0 },
  { top: 5, left: 74, s: 2.2, d: 3.0, delay: 0.3 }, { top: 16, left: 88, s: 1.5, d: 4.8, delay: 1.6 },
  { top: 22, left: 12, s: 1.6, d: 3.9, delay: 2.4 }, { top: 26, left: 33, s: 1.2, d: 4.2, delay: 0.9 },
  { top: 20, left: 50, s: 1.9, d: 3.4, delay: 1.8 }, { top: 28, left: 67, s: 1.4, d: 4.6, delay: 0.4 },
  { top: 24, left: 82, s: 1.7, d: 3.7, delay: 2.2 }, { top: 34, left: 4, s: 1.3, d: 4.0, delay: 1.3 },
  { top: 38, left: 27, s: 2.0, d: 3.3, delay: 0.7 }, { top: 36, left: 45, s: 1.2, d: 4.5, delay: 2.6 },
  { top: 42, left: 63, s: 1.6, d: 3.8, delay: 1.0 }, { top: 33, left: 79, s: 1.4, d: 4.3, delay: 0.2 },
  { top: 40, left: 92, s: 1.8, d: 3.5, delay: 1.9 }, { top: 48, left: 16, s: 1.3, d: 4.7, delay: 2.1 },
  { top: 52, left: 36, s: 1.5, d: 3.1, delay: 0.5 }, { top: 46, left: 55, s: 1.7, d: 4.1, delay: 1.5 },
  { top: 54, left: 72, s: 1.2, d: 3.9, delay: 2.3 }, { top: 50, left: 86, s: 1.9, d: 3.6, delay: 0.8 },
  { top: 12, left: 15, s: 1.1, d: 4.9, delay: 1.2 }, { top: 30, left: 58, s: 1.1, d: 5.0, delay: 2.5 },
  { top: 44, left: 8, s: 1.2, d: 4.4, delay: 0.1 }, { top: 18, left: 70, s: 1.3, d: 3.2, delay: 1.7 },
];

const PETALS = [
  { left: 12, delay: "0s", dur: "9s", rx: "26px", rr: "220deg", c: "#f2d8d7", size: 7 },
  { left: 26, delay: "2.4s", dur: "11s", rx: "-20px", rr: "-180deg", c: "#e9d29a", size: 5 },
  { left: 40, delay: "1.1s", dur: "10s", rx: "30px", rr: "240deg", c: "#f6eee6", size: 6 },
  { left: 55, delay: "3.2s", dur: "12s", rx: "-28px", rr: "-200deg", c: "#ebcfcf", size: 7 },
  { left: 68, delay: "0.8s", dur: "9.5s", rx: "18px", rr: "160deg", c: "#e9d29a", size: 5 },
  { left: 82, delay: "2.0s", dur: "11.5s", rx: "-24px", rr: "-220deg", c: "#f2d8d7", size: 6 },
  { left: 48, delay: "4.4s", dur: "10.5s", rx: "22px", rr: "260deg", c: "#f6eccf", size: 4 },
  { left: 34, delay: "5.0s", dur: "12.5s", rx: "-16px", rr: "-160deg", c: "#f6eee6", size: 5 },
];

const layer = (z: number): CSSProperties => ({ position: "absolute", inset: 0, zIndex: z });

export function EtherealScene() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(180deg,#14121f 0%,#1e1a33 38%,#332c4f 68%,#4a4468 100%)" }}>
      {/* soft sky glow toward the horizon */}
      <div style={{ ...layer(1), background: "radial-gradient(120% 80% at 50% 96%, rgba(199,194,221,.35), transparent 60%)", pointerEvents: "none" }} />

      {/* aurora ribbons */}
      <div style={{ position: "absolute", top: "14%", left: "-20%", width: "140%", height: "42%", zIndex: 2, filter: "blur(26px)", background: "linear-gradient(90deg,transparent,rgba(216,189,133,.28),rgba(169,181,214,.24),transparent)", animation: "aurora 16s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "26%", left: "-20%", width: "140%", height: "38%", zIndex: 2, filter: "blur(30px)", background: "linear-gradient(90deg,transparent,rgba(169,181,214,.22),rgba(216,189,133,.2),transparent)", animation: "aurora 22s ease-in-out infinite reverse" }} />

      {/* moon + halo */}
      <div style={{ position: "absolute", top: "12%", left: "64%", width: "clamp(54px,9%,96px)", aspectRatio: "1", borderRadius: "50%", zIndex: 3, background: "radial-gradient(circle at 38% 36%, #fdfbf0, #efe4c2 55%, #cbb98a)", animation: "moonPulse 8s ease-in-out infinite" }} />
      {/* moon light beam */}
      <div style={{ position: "absolute", top: "16%", left: "62%", width: "26%", height: "80%", zIndex: 2, transform: "rotate(8deg)", transformOrigin: "top center", background: "linear-gradient(180deg, rgba(246,238,214,.18), transparent 70%)", filter: "blur(8px)", animation: "beam 9s ease-in-out infinite", pointerEvents: "none" }} />

      {/* stars */}
      <div style={{ ...layer(3), pointerEvents: "none" }}>
        {STARS.map((s, i) => (
          <span key={i} style={{ position: "absolute", top: `${s.top}%`, left: `${s.left}%`, width: s.s, height: s.s, borderRadius: "50%", background: "#f6efd8", boxShadow: "0 0 4px rgba(246,239,216,.8)", animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite` }} />
        ))}
      </div>

      {/* shooting stars */}
      <span style={{ position: "absolute", top: "10%", left: "10%", zIndex: 3, width: 2, height: 64, borderRadius: 2, background: "linear-gradient(180deg,rgba(255,255,255,.9),transparent)", transform: "rotate(24deg)", animation: "shootStar 9s ease-in-out 3s infinite", pointerEvents: "none" }} />
      <span style={{ position: "absolute", top: "6%", left: "44%", zIndex: 3, width: 2, height: 52, borderRadius: 2, background: "linear-gradient(180deg,rgba(255,255,255,.85),transparent)", transform: "rotate(24deg)", animation: "shootStar 11s ease-in-out 8.5s infinite", pointerEvents: "none" }} />

      {/* drifting mist near the horizon */}
      <div style={{ position: "absolute", bottom: "18%", left: "-10%", width: "60%", height: "22%", zIndex: 4, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,194,221,.28), transparent 70%)", filter: "blur(20px)", animation: "driftX 26s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "12%", left: "40%", width: "55%", height: "20%", zIndex: 4, borderRadius: "50%", background: "radial-gradient(circle, rgba(216,189,133,.2), transparent 70%)", filter: "blur(22px)", animation: "driftX 32s ease-in-out infinite reverse" }} />

      {/* parallax hills */}
      <svg viewBox="0 0 400 130" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", zIndex: 5 }}>
        <path d="M0 70 Q100 40 200 66 T400 60 L400 130 L0 130 Z" fill="#2f2a48" opacity={0.85} />
        <path d="M0 92 Q120 66 240 90 T400 86 L400 130 L0 130 Z" fill="#211d36" />
      </svg>

      {/* glowing portal arch behind the couple */}
      <div style={{ position: "absolute", bottom: "16%", left: "50%", width: "34%", aspectRatio: "3/4", zIndex: 5, transform: "translateX(-50%)", borderRadius: "50% 50% 46% 46%", border: "1.5px solid rgba(216,189,133,.55)", boxShadow: "0 0 40px rgba(216,189,133,.35), inset 0 0 40px rgba(216,189,133,.18)", animation: "archGlow 7s ease-in-out infinite" }} />
      {/* warm ground glow */}
      <div style={{ position: "absolute", bottom: "10%", left: "50%", width: "44%", height: "14%", zIndex: 5, transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(233,210,154,.4), transparent 70%)", filter: "blur(10px)" }} />

      {/* the couple — positioning on the outer div, float on the inner
          one so the animation's transform can't cancel the centering. */}
      <div style={{ position: "absolute", bottom: "9%", left: "50%", transform: "translateX(-50%)", width: "clamp(150px,50%,260px)", aspectRatio: "4/5", zIndex: 6 }}>
        <div style={{ position: "absolute", inset: 0, animation: "floatySlow 12s ease-in-out infinite" }}>
          <AnimatedCharacter variant="couple" background={false} />
        </div>
      </div>

      {/* rising gold petals */}
      <div style={{ ...layer(7), pointerEvents: "none" }}>
        {PETALS.map((p, i) => (
          <span
            key={i}
            style={{ position: "absolute", bottom: "6%", left: `${p.left}%`, width: p.size, height: p.size * 0.7, borderRadius: "60% 60% 60% 0", background: p.c, opacity: 0, ["--rx" as string]: p.rx, ["--rr" as string]: p.rr, animation: `petalRise ${p.dur} linear ${p.delay} infinite` } as CSSProperties}
          />
        ))}
      </div>

      {/* foreground sparkles */}
      {[{ t: 30, l: 20 }, { t: 44, l: 78 }, { t: 60, l: 34 }, { t: 54, l: 62 }].map((s, i) => (
        <span key={i} style={{ position: "absolute", top: `${s.t}%`, left: `${s.l}%`, width: 5, height: 5, zIndex: 7, borderRadius: "50%", background: "radial-gradient(circle,#f6eccf,rgba(216,189,133,0))", boxShadow: "0 0 8px 2px rgba(216,189,133,.6)", animation: `sparkle ${3 + i * 0.6}s ease-in-out ${i * 0.8}s infinite`, pointerEvents: "none" }} />
      ))}
    </div>
  );
}
