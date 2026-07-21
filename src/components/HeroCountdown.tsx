"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2026-12-12T15:30:00+08:00").getTime();

/**
 * Live countdown for the hero. Self-contained so its 1s ticks re-render
 * only this element, never the large scene tree above it.
 */
export function HeroCountdown() {
  const [cd, setCd] = useState<{ d: string | number; h: string | number; m: string | number; s: string | number }>({
    d: "--",
    h: "--",
    m: "--",
    s: "--",
  });

  useEffect(() => {
    const tick = () => {
      const t = TARGET - Date.now();
      if (t <= 0) {
        setCd({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setCd({
        d: Math.floor(t / 864e5),
        h: Math.floor(t / 36e5) % 24,
        m: Math.floor(t / 6e4) % 60,
        s: Math.floor(t / 1e3) % 60,
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const units = [
    { v: cd.d, k: "Days" },
    { v: cd.h, k: "Hours" },
    { v: cd.m, k: "Minutes" },
    { v: cd.s, k: "Seconds" },
  ];

  return (
    <div
      data-reveal
      data-reveal-delay="600"
      style={{
        opacity: 0,
        transform: "translateY(38px)",
        display: "flex",
        gap: "clamp(14px,3vw,40px)",
        marginTop: 52,
      }}
    >
      {units.map((c) => (
        <div key={c.k} style={{ minWidth: 70, textAlign: "center" }}>
          <div
            suppressHydrationWarning
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 500,
              fontSize: "clamp(34px,5vw,52px)",
              lineHeight: 1,
              color: "#4a4468",
            }}
          >
            {c.v}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              letterSpacing: ".34em",
              textTransform: "uppercase",
              color: "#9591ac",
            }}
          >
            {c.k}
          </div>
        </div>
      ))}
    </div>
  );
}
