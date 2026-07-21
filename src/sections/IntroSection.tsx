import { Reveal } from "@/components/Reveal";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import { WEDDING } from "@/lib/content";

/**
 * The narrative opening of the scrollable experience — a soft, quiet
 * invitation message that greets the guest once the seal has broken.
 */
export function IntroSection() {
  return (
    <section className="relative overflow-hidden bg-lavender-mist px-6 py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal>
          <span className="font-script text-3xl text-soft-gold sm:text-4xl">You are invited</span>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 font-display text-2xl font-light leading-relaxed text-body-text sm:text-3xl">
            {WEDDING.intro}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <OrnamentDivider className="mt-10" />
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mt-8 font-display text-sm uppercase tracking-[0.3em] text-muted-text">
            {WEDDING.dateLong}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
