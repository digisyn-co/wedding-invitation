"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The continuity veil — the light that carries the eye across every
 * tonal cut. Two fixed, screen-blended washes (a twilight-gold for
 * the dark scenes, an ivory-gold for the cream scenes) whose
 * opacities crossfade, scrubbed, across each scene boundary. The
 * boundaries this exists for: hero→couple (light→dark),
 * story→details (dark→cream) and rsvp→closing (cream→night) — the
 * three handoffs the audit called cuts.
 *
 * Opacity-only animation on two composited layers: no paint, no
 * layout. Low-power devices get the single twilight layer (gold
 * reads on both palettes); reduced motion gets a static mid-blend.
 */

/** Which wash each scene wants — tuned faint; the veil is felt, not seen. */
const SCENE_LIGHT: { sel: string; tw: number; iv: number }[] = [
  { sel: "#hero", tw: 0.1, iv: 0.26 },
  { sel: "#couple", tw: 0.42, iv: 0 },
  { sel: "#story", tw: 0.42, iv: 0 },
  { sel: "#details", tw: 0, iv: 0.3 },
  { sel: "#venue", tw: 0, iv: 0.3 },
  { sel: "#rsvp", tw: 0, iv: 0.3 },
  { sel: "#closing", tw: 0.46, iv: 0 },
];

function isLowPower() {
  return typeof window !== "undefined" && (window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4);
}

export function ContinuityVeil({ active }: { active: boolean }) {
  const twRef = useRef<HTMLDivElement>(null);
  const ivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tw = twRef.current;
    const iv = ivRef.current;
    if (!active || !tw || !iv) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Designed still: one quiet mid-blend, no scroll coupling.
      gsap.set(tw, { opacity: 0.18 });
      gsap.set(iv, { opacity: 0.12 });
      return;
    }

    const low = isLowPower();
    const tweens: gsap.core.Tween[] = [];
    gsap.set(tw, { opacity: SCENE_LIGHT[0].tw });
    gsap.set(iv, { opacity: low ? 0 : SCENE_LIGHT[0].iv });

    // One scrubbed crossfade per boundary: as the next scene's top
    // travels 90% → 10% of the viewport, the veil hands the light over.
    for (let i = 1; i < SCENE_LIGHT.length; i += 1) {
      const s = SCENE_LIGHT[i];
      if (!document.querySelector(s.sel)) continue;
      tweens.push(
        gsap.to(tw, {
          opacity: s.tw,
          ease: "none",
          scrollTrigger: { trigger: s.sel, start: "top 90%", end: "top 10%", scrub: 0.6 },
        }),
      );
      if (!low)
        tweens.push(
          gsap.to(iv, {
            opacity: s.iv,
            ease: "none",
            scrollTrigger: { trigger: s.sel, start: "top 90%", end: "top 10%", scrub: 0.6 },
          }),
        );
    }

    return () => {
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, [active]);

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 53, pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        ref={twRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          willChange: "opacity",
          background:
            "radial-gradient(110% 80% at 50% 30%, rgba(216,189,133,.16), rgba(120,104,150,.05) 55%, transparent 78%)",
        }}
      />
      <div
        ref={ivRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          willChange: "opacity",
          background:
            "radial-gradient(110% 80% at 50% 26%, rgba(255,251,240,.14), rgba(246,236,207,.05) 55%, transparent 78%)",
        }}
      />
    </div>
  );
}
