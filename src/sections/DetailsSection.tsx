import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { GoldFrame } from "@/components/GoldFrame";
import { PaperTexture } from "@/components/PaperTexture";
import { WEDDING } from "@/lib/content";

function EventCard({
  title,
  time,
  venue,
  address,
  delay,
}: {
  title: string;
  time: string;
  venue: string;
  address: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="w-full max-w-sm">
      <article className="relative overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-pearl-white px-8 py-10 text-center shadow-[0_18px_50px_rgba(83,72,120,0.12)]">
        <PaperTexture variant="grain" opacity={0.14} />
        <GoldFrame />
        <h3 className="font-display text-2xl font-medium uppercase tracking-[0.2em] text-heading">
          {title}
        </h3>
        <div className="mx-auto mt-4 h-px w-12 bg-champagne-gold/50" />
        <p className="mt-5 font-display text-lg text-body-text">{venue}</p>
        <p className="mt-1 font-body text-sm text-muted-text">{address}</p>
        <p className="mt-4 font-script text-2xl text-soft-gold">{time}</p>
      </article>
    </Reveal>
  );
}

/**
 * Ceremony & reception details, presented as two framed cards on a
 * warm pearl surface.
 */
export function DetailsSection() {
  return (
    <section className="relative overflow-hidden bg-ivory-silk px-6 py-24 sm:py-28">
      <PaperTexture variant="fiber" opacity={0.4} />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center">
        <SectionHeading eyebrow="join us" title="The Celebration" />

        <div className="mt-14 flex w-full flex-col items-center justify-center gap-8 sm:flex-row sm:items-stretch">
          {WEDDING.events.map((event, i) => (
            <EventCard key={event.title} {...event} delay={0.12 * i} />
          ))}
        </div>
      </div>
    </section>
  );
}
