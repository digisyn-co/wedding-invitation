import { OrnamentDivider } from "@/components/OrnamentDivider";
import { cn } from "@/lib/utils";

/**
 * Shared section heading: a small script eyebrow, a large display
 * title, and an ornament divider — keeps every section visually of a
 * piece with the invitation.
 */
export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {eyebrow && (
        <span className="font-script text-2xl text-soft-gold sm:text-3xl">{eyebrow}</span>
      )}
      <h2 className="mt-1 font-display text-3xl font-medium uppercase tracking-[0.18em] text-heading sm:text-4xl">
        {title}
      </h2>
      <OrnamentDivider className="mt-5" />
    </div>
  );
}
