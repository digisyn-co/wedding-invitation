"use client";

import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/content";

const TARGET = new Date(WEDDING.date.iso).getTime();

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live countdown for the hero — an engraved timepiece rather than a
 * dashboard widget: light serif numerals, hairline separators, and
 * whispered labels. Self-contained so its 1s ticks re-render only
 * this element, never the large scene tree above it.
 */
export function HeroCountdown() {
  const [cd, setCd] = useState<{ d: string; h: string; m: string; s: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const t = Math.max(0, TARGET - Date.now());
      setCd({
        d: pad(Math.floor(t / 864e5)),
        h: pad(Math.floor(t / 36e5) % 24),
        m: pad(Math.floor(t / 6e4) % 60),
        s: pad(Math.floor(t / 1e3) % 60),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const units = [
    { v: cd?.d ?? "--", k: "Days" },
    { v: cd?.h ?? "--", k: "Hours" },
    { v: cd?.m ?? "--", k: "Minutes" },
    { v: cd?.s ?? "--", k: "Seconds" },
  ];

  return (
    <div
      data-reveal
      data-reveal-delay="600"
      role="timer"
      aria-label={`Countdown to the wedding on ${WEDDING.date.long}`}
      style={{
        opacity: 0,
        transform: "translateY(38px)",
        display: "flex",
        alignItems: "stretch",
        marginTop: "clamp(30px,5vh,52px)",
      }}
    >
      {units.map((c, i) => (
        <div key={c.k} style={{ display: "flex", alignItems: "center" }}>
          {i > 0 && (
            <span
              aria-hidden
              style={{
                width: 1,
                alignSelf: "center",
                height: "clamp(30px,4.6vw,44px)",
                background: "linear-gradient(180deg,transparent,rgba(201,163,91,.55),transparent)",
              }}
            />
          )}
          <div style={{ minWidth: "clamp(62px,16vw,104px)", textAlign: "center", padding: "0 clamp(4px,1vw,10px)" }}>
            <div
              suppressHydrationWarning
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                fontSize: "clamp(34px,5vw,54px)",
                lineHeight: 1,
                letterSpacing: ".04em",
                color: "#4a4468",
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              {c.v}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 9.5,
                letterSpacing: ".38em",
                textTransform: "uppercase",
                color: "#9591ac",
              }}
            >
              {c.k}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
