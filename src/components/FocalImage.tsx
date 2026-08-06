import Image from "next/image";
import type { CSSProperties } from "react";
import type { WeddingPhoto } from "@/lib/content";

/**
 * The one way a photograph renders in this piece: next/image `fill`
 * inside an aspect-locked frame, with the photo's focal point (from
 * content.ts) driving object-position — faces stay framed at every
 * viewport and crop. `sizes` must describe the frame's real rendered
 * width so the optimizer serves the right file; `priority` is
 * reserved for the arrival crest (the LCP) alone.
 */
export function FocalImage({
  photo,
  alt,
  sizes,
  priority = false,
  style,
}: {
  photo: WeddingPhoto;
  alt: string;
  sizes: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  return (
    <Image
      src={photo.src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      draggable={false}
      style={{
        objectFit: "cover",
        objectPosition: `${photo.focal.x}% ${photo.focal.y}%`,
        ...style,
      }}
    />
  );
}
