import type { CSSProperties } from "react";

/**
 * Photo placeholder standing in for the original design's <image-slot>
 * elements (portraits, story chapters, memory montage). Fills its
 * sized wrapper. Drop a real photo in by passing `src`; until then it
 * shows an elegant dashed-ring empty state with the caption.
 */
export function Slot({
  src,
  caption,
  style,
}: {
  src?: string;
  caption?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, rgba(216,189,133,.10), rgba(122,115,146,.12))",
        color: "rgba(233,221,196,.75)",
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={caption || ""}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable={false}
        />
      ) : (
        <>
          <span
            style={{
              position: "absolute",
              inset: 10,
              border: "1.5px dashed rgba(216,189,133,.45)",
              borderRadius: "inherit",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
              padding: 12,
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.6 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            {caption && (
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 13,
                  letterSpacing: ".06em",
                }}
              >
                {caption}
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
