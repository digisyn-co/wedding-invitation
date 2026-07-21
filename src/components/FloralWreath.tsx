"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Deep/mid/light triads built from the approved floral + neutral tokens.
const ROSE_PALETTES = {
  blush: ["#ebcfcf", "#f2d8d7", "#f6eee6"], // rose quartz -> blush rose -> soft cream rose
  ivory: ["#f2eee7", "#f7f4f1", "#f9fafc"], // ivory silk -> pearl white -> crystal highlight
  lavender: ["#c7c2dd", "#d7d5e8", "#e7e5f3"], // dusty lilac -> lavender mist -> moon lavender
} as const;

function PaperRose({
  size,
  palette,
  rotate = 0,
}: {
  size: number;
  palette: keyof typeof ROSE_PALETTES;
  rotate?: number;
}) {
  const [deep, mid, light] = ROSE_PALETTES[palette];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      {/* layered "paper-cut" petals, back to front */}
      <circle cx="50" cy="50" r="34" fill={light} opacity={0.9} />
      <path
        d="M50 16 C68 20 78 34 74 50 C78 66 68 80 50 84 C32 80 22 66 26 50 C22 34 32 20 50 16Z"
        fill={mid}
        opacity={0.85}
      />
      <path
        d="M50 28 C60 30 66 38 64 50 C66 62 60 70 50 72 C40 70 34 62 36 50 C34 38 40 30 50 28Z"
        fill={deep}
        opacity={0.9}
      />
      <circle cx="50" cy="50" r="9" fill={light} opacity={0.95} />
    </svg>
  );
}

function SprigLeaf({
  size,
  rotate = 0,
  color = "#a9b5d6",
}: {
  size: number;
  rotate?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 40 64"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <path
        d="M20 2 C30 14 32 34 20 62 C8 34 10 14 20 2Z"
        fill={color}
        opacity={0.55}
      />
      <path d="M20 6 L20 58" stroke="#f2eee7" strokeWidth={0.5} opacity={0.4} />
    </svg>
  );
}

/**
 * A crescent floral wreath, matching the arrangement beneath the
 * monogram on the reference invitation: roses left/right with sprigs
 * of baby's breath and lavender filling the gaps.
 */
export function FloralWreath({
  className,
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  const bloom = (delay: number) =>
    animate
      ? {
          initial: { scale: 0, opacity: 0, rotate: -8 },
          animate: { scale: 1, opacity: 1, rotate: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {};

  return (
    <div
      className={cn("pointer-events-none flex items-end justify-center", className)}
      aria-hidden="true"
    >
      <motion.div className="relative -mr-4 flex items-end" {...bloom(0.1)}>
        <SprigLeaf size={14} rotate={-25} color="#a9b5d6" />
        <PaperRose size={54} palette="ivory" rotate={-8} />
        <SprigLeaf size={12} rotate={20} color="#d8be86" />
      </motion.div>
      <motion.div className="relative z-10 -mb-1" {...bloom(0.25)}>
        <PaperRose size={40} palette="blush" rotate={4} />
      </motion.div>
      <motion.div className="relative mx-1 flex items-end" {...bloom(0.4)}>
        <SprigLeaf size={10} rotate={-10} color="#a9b5d6" />
      </motion.div>
      <motion.div className="relative z-10 -mb-1" {...bloom(0.5)}>
        <PaperRose size={40} palette="blush" rotate={-6} />
      </motion.div>
      <motion.div className="relative -ml-4 flex items-end" {...bloom(0.65)}>
        <SprigLeaf size={12} rotate={-18} color="#d8be86" />
        <PaperRose size={54} palette="ivory" rotate={8} />
        <SprigLeaf size={14} rotate={22} color="#a9b5d6" />
      </motion.div>
    </div>
  );
}
