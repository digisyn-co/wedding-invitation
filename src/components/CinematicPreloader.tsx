"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Cinematic arrival loader in the style of lastdanceforglory.world:
 * a black void, a whispered serif caption, a huge outlined gold
 * counter easing 00 → 100, and a hairline gold rule that draws in
 * beneath it. When it reaches 100 it holds a beat, then the whole
 * veil breathes out (fade + slight scale + blur) and unmounts via
 * `onDone`. Purely presentational — no real network gating, but the
 * ~2.6s it takes covers the fonts/images first paint.
 */
export function CinematicPreloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const root = rootRef.current;
    const num = numRef.current;
    const line = lineRef.current;
    if (!root || !num || !line) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => doneRef.current() });

    if (reduced) {
      tl.to(root, { opacity: 0, duration: 0.4, delay: 0.3 });
      return () => { tl.kill(); };
    }

    tl
      // the counter: slow start, confident finish — never linear
      .to(state, {
        v: 100,
        duration: 2.3,
        ease: "power2.inOut",
        onUpdate: () => {
          num.textContent = String(Math.round(state.v)).padStart(state.v < 99.5 ? 2 : 3, "0");
        },
      }, 0.25)
      // the hairline rule draws in underneath as it counts
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 2.3, ease: "power2.inOut" }, 0.25)
      // hold the "100" for a breath…
      .to(num, { opacity: 1, duration: 0.35 }, ">")
      // …then the veil breathes out and the envelope scene is revealed
      .to(root, {
        opacity: 0,
        scale: 1.06,
        filter: "blur(6px)",
        duration: 1.1,
        ease: "power2.inOut",
      }, ">-0.05");

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 95,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        background: "#0b0a10",
        willChange: "opacity, transform",
      }}
      aria-label="Loading"
      role="status"
    >
      <div
        style={{
          fontFamily: "'Jost',sans-serif",
          fontWeight: 300,
          fontSize: 11,
          letterSpacing: ".52em",
          textTransform: "uppercase",
          color: "#8f8aa8",
        }}
      >
        A Celebration Is Loading
      </div>
      <div
        ref={numRef}
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontWeight: 300,
          fontSize: "clamp(84px,14vw,150px)",
          lineHeight: 0.9,
          color: "transparent",
          WebkitTextStroke: "1.2px #c9a35b",
          textShadow: "0 0 34px rgba(201,163,91,.25)",
        }}
      >
        00
      </div>
      <div
        ref={lineRef}
        style={{
          width: "min(38vw,260px)",
          height: 1,
          background: "linear-gradient(90deg,transparent,#c9a35b,transparent)",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}
