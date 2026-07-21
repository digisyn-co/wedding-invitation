import { cn } from "@/lib/utils";

/**
 * Fine handmade-paper grain rendered from SVG fractal noise — no image
 * asset, GPU-cheap, and the single biggest lever against a "flat /
 * digital" look. Overlaid at low opacity on surfaces; `mix-blend`
 * lets the grain sit in the paper rather than on top of it.
 *
 * `variant`:
 *  - "fiber"  → soft cloudy fibre (large surfaces, section backgrounds)
 *  - "grain"  → tight speckle (cards, the invitation face)
 */
export function PaperTexture({
  className,
  opacity = 0.5,
  variant = "fiber",
}: {
  className?: string;
  opacity?: number;
  variant?: "fiber" | "grain";
}) {
  const id = `paper-${variant}`;
  const baseFrequency = variant === "grain" ? "0.9" : "0.012 0.16";
  const octaves = variant === "grain" ? 2 : 3;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 mix-blend-multiply", className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={octaves}
            seed={7}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </div>
  );
}
