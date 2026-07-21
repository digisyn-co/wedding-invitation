"use client";

import { cn } from "@/lib/utils";

export function SoundToggle({
  muted,
  onToggle,
  className,
}: {
  muted: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute ambient score" : "Mute ambient score"}
      aria-pressed={!muted}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-champagne-gold/30 bg-twilight-900/40 text-champagne-gold backdrop-blur-sm transition-colors hover:border-champagne-gold/60 hover:text-soft-gold",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M4 9v6h4l5 4V5L8 9H4Z" strokeLinejoin="round" />
        {!muted && <path d="M17 8a5 5 0 0 1 0 8" strokeLinecap="round" />}
        {muted && <path d="M18 8l4 8M22 8l-4 8" strokeLinecap="round" />}
      </svg>
    </button>
  );
}
