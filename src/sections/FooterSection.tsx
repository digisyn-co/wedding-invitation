import { OrnamentDivider } from "@/components/OrnamentDivider";
import { WEDDING } from "@/lib/content";

export function FooterSection() {
  return (
    <footer className="relative overflow-hidden bg-twilight-975 px-6 py-20 text-center">
      <div className="mx-auto flex max-w-lg flex-col items-center">
        <p className="font-script text-5xl text-champagne-gold sm:text-6xl">
          {WEDDING.couple.first}
          <span className="mx-3 text-soft-gold">&amp;</span>
          {WEDDING.couple.second}
        </p>

        <OrnamentDivider className="mt-8 opacity-80" />

        <p className="mt-8 font-display text-sm uppercase tracking-[0.4em] text-pearl-white/70">
          {WEDDING.dateDisplay}
        </p>

        <p className="mt-6 max-w-sm font-body text-xs leading-relaxed tracking-wide text-pearl-white/40">
          A love written among the stars.
        </p>
      </div>
    </footer>
  );
}
