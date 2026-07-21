import { cn } from "@/lib/utils";

/**
 * Engraved-corner ornamental frame, echoing the foil flourishes on the
 * reference invitation. Purely decorative — sits absolutely over its
 * parent, which should be `relative`.
 */
export function GoldFrame({
  className,
  tone = "gold",
}: {
  className?: string;
  /** "gold" uses the champagne→antique foil ramp; "lavender" is a
   *  quieter variant built from the approved neutral/lavender tones,
   *  for use over busier gold content elsewhere on the card. */
  tone?: "gold" | "lavender";
}) {
  const stroke = tone === "gold" ? "url(#goldFrameGradient)" : "url(#lavenderFrameGradient)";

  const Corner = ({ rotate }: { rotate: number }) => (
    <svg
      viewBox="0 0 120 120"
      className="absolute h-16 w-16 sm:h-20 sm:w-20"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldFrameGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6d6a8" />
          <stop offset="50%" stopColor="#cfae70" />
          <stop offset="100%" stopColor="#b88a4a" />
        </linearGradient>
        <linearGradient id="lavenderFrameGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7f4f1" />
          <stop offset="100%" stopColor="#c7c2dd" />
        </linearGradient>
      </defs>
      <path
        d="M8 8 H62 M8 8 V62"
        stroke={stroke}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
        opacity={0.85}
      />
      <path
        d="M8 8 C 30 8, 8 30, 8 8"
        stroke={stroke}
        strokeWidth={1.4}
        fill="none"
        opacity={0.8}
      />
      <path
        d="M18 6 C 46 8, 48 34, 18 32 C 0 29, 6 6 18 6 Z"
        fill={stroke}
        opacity={0.3}
      />
      <circle cx={8} cy={8} r={3} fill={stroke} />
      <path
        d="M14 22 q6 -10 16 -10 q-8 6 -6 16 q-10 -2 -10 -6Z"
        fill={stroke}
        opacity={0.95}
      />
      <path
        d="M22 14 q10 -6 16 4 q-10 -2 -14 4 q-4 -4 -2 -8Z"
        fill={stroke}
        opacity={0.75}
      />
    </svg>
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
        <Corner rotate={0} />
      </div>
      <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
        <Corner rotate={90} />
      </div>
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
        <Corner rotate={180} />
      </div>
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
        <Corner rotate={270} />
      </div>
    </div>
  );
}
