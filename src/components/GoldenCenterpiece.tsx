"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The persistent glowing centerpiece — the site's equivalent of the
 * golden trophy on lastdanceforglory.world. The couple's monogram
 * crest lives fixed behind every section (screen-blended, faint, in
 * its own halo of light) and is scrubbed by scroll: as you travel
 * through the chapters it drifts, breathes, and slowly turns, so the
 * whole page feels like one continuous camera move around it.
 *
 * Sits at zIndex -1: above the fixed silk backdrop, beneath the
 * content — it glows through each scene's translucent gradients.
 */
export function GoldenCenterpiece({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const crestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const crest = crestRef.current;
    if (!active || !root || !crest) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Arrive: a slow bloom into presence once the envelope has opened.
    const inTween = gsap.fromTo(
      root,
      { opacity: 0 },
      { opacity: 1, duration: reduced ? 0.6 : 2.4, ease: "power1.inOut" },
    );

    if (reduced) return () => { inTween.kill(); };

    // Idle breath, independent of scroll — it should never feel static.
    const breathe = gsap.to(crest, {
      scale: 1.045,
      duration: 5.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    // The scroll-scrubbed camera move: drift down-and-turn across the
    // full document, like orbiting the trophy as chapters pass.
    const scrub = gsap.fromTo(
      root,
      { yPercent: -5, rotation: -4, scale: 1.12 },
      {
        yPercent: 7,
        rotation: 9,
        scale: 0.92,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 1.2 },
      },
    );

    return () => {
      inTween.kill();
      breathe.kill();
      scrub.scrollTrigger?.kill();
      scrub.kill();
    };
  }, [active]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: 0,
        willChange: "transform, opacity",
      }}
    >
      {/* halo of light the crest floats in */}
      <div
        style={{
          position: "absolute",
          width: "min(72vw,700px)",
          height: "min(72vw,700px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(216,189,133,.22), rgba(201,163,91,.08) 45%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      <div ref={crestRef} style={{ position: "relative", willChange: "transform" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/HL.png"
          alt=""
          style={{
            display: "block",
            width: "min(46vw,420px)",
            height: "auto",
            opacity: 0.16,
            mixBlendMode: "screen",
            filter:
              "drop-shadow(0 0 26px rgba(216,189,133,.55)) drop-shadow(0 0 70px rgba(201,163,91,.3)) sepia(.4) saturate(1.4) brightness(1.5)",
          }}
        />
      </div>
    </div>
  );
}
