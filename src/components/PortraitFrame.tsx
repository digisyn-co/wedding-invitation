import type { CSSProperties } from "react";

/**
 * An editorial 3:4 portrait plate. When `src` is provided (a real
 * photograph in /public/assets — see WEDDING.photos in lib/content),
 * it renders the image full-bleed inside the hairline mat. Until
 * then it renders a couture placeholder: engraved initial on ivory,
 * fine double rule, botanical flourish — designed so the layout is
 * final and the photograph simply drops in.
 */
export function PortraitFrame({
  src,
  initial,
  name,
  role,
  tilt = "0deg",
  style,
}: {
  src: string | null;
  initial: string;
  name: string;
  role: string;
  tilt?: string;
  style?: CSSProperties;
}) {
  return (
    <figure style={{ margin: 0, width: "100%", transform: `rotate(${tilt})`, ...style }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          overflow: "hidden",
          background: src
            ? "#1d1a2c"
            : "linear-gradient(168deg,#fbf8f2 0%,#f1ebdf 60%,#eae2d2 100%)",
          boxShadow:
            "0 0 0 1px rgba(216,189,133,.55), 0 0 0 7px rgba(255,255,255,.05), 0 30px 70px rgba(0,0,0,.45)",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Portrait of ${name}, ${role.toLowerCase()}`}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div aria-label={`Portrait of ${name} to come`} role="img" style={{ position: "absolute", inset: 0 }}>
            {/* hairline double mat */}
            <span aria-hidden style={{ position: "absolute", inset: 10, border: "1px solid rgba(169,133,63,.5)" }} />
            <span aria-hidden style={{ position: "absolute", inset: 14, border: "1px solid rgba(169,133,63,.22)" }} />
            {/* engraved initial */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Pinyon Script',cursive",
                fontSize: "clamp(72px,9vw,120px)",
                color: "rgba(169,133,63,.34)",
                textShadow: "0 1px 0 rgba(255,255,255,.6)",
              }}
            >
              {initial}
            </span>
            {/* botanical flourish */}
            <svg
              aria-hidden
              viewBox="0 0 120 34"
              style={{ position: "absolute", left: "50%", bottom: 26, width: 96, transform: "translateX(-50%)", opacity: 0.55 }}
            >
              <g fill="none" stroke="#a9853f" strokeWidth="0.9" strokeLinecap="round">
                <path d="M8 17 C 40 10 80 24 112 17" />
                <path d="M34 15 q3 -7 9 -8 M52 13 q2 -6 8 -7 M72 15 q3 6 9 7 M88 17 q2 5 8 6" />
                <circle cx="60" cy="14" r="1.6" fill="#a9853f" stroke="none" />
              </g>
            </svg>
          </div>
        )}
      </div>
      <figcaption
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <span style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(26px,2.6vw,34px)", lineHeight: 1, color: "#e9d29a" }}>{name}</span>
        <span style={{ fontSize: 9.5, letterSpacing: ".44em", textTransform: "uppercase", color: "#b7aecf" }}>{role}</span>
      </figcaption>
    </figure>
  );
}
