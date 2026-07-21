import { cn } from "@/lib/utils";

/**
 * The little gold flourish — two tapering rules meeting a center
 * diamond/star — used to separate sections, echoing the dividers on
 * the reference invitation. Champagne-gold foil, decorative only.
 */
export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3 text-champagne-gold", className)}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-champagne-gold/70 sm:w-24" />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0">
        <path
          d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
          fill="currentColor"
          opacity={0.9}
        />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-champagne-gold/70 sm:w-24" />
    </div>
  );
}
