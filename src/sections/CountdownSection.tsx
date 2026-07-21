"use client";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { useCountdown } from "@/hooks/useCountdown";
import { WEDDING } from "@/lib/content";

function Unit({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--glass-surface)] backdrop-blur-sm sm:h-24 sm:w-24">
        <span
          className="font-display text-3xl font-medium tabular-nums text-heading sm:text-4xl"
          suppressHydrationWarning
        >
          {value === null ? "--" : String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-3 font-body text-[10px] uppercase tracking-[0.3em] text-muted-text sm:text-xs">
        {label}
      </span>
    </div>
  );
}

/**
 * Live countdown to the wedding date. Numbers tick client-side; a
 * glassy card set keeps it within the crystal/glass tokens.
 */
export function CountdownSection() {
  const time = useCountdown(WEDDING.dateISO);

  return (
    <section className="relative overflow-hidden bg-moon-lavender px-6 py-24 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <SectionHeading eyebrow="counting the days" title="Until We Say I Do" />

        <Reveal delay={0.15} className="mt-12">
          <div className="flex items-start gap-4 sm:gap-8">
            <Unit value={time?.days ?? null} label="Days" />
            <Unit value={time?.hours ?? null} label="Hours" />
            <Unit value={time?.minutes ?? null} label="Minutes" />
            <Unit value={time?.seconds ?? null} label="Seconds" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
