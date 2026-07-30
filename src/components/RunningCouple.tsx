/**
 * The couple, hand-in-hand, walking into the light — drawn as elegant
 * backlit SILHOUETTES (no faces, no cartoon proportions): deep
 * ink-violet figures rimmed with a whisper of gold, her veil and gown
 * streaming behind. Reuses the established motion rig (rc-* classes in
 * globals.css): body bob, veil stream, gown flow, his striding legs.
 * Fills its sized wrapper (viewBox 220x140, ground line at y≈118).
 */

const INK = "#1c1930";
const RIM = "rgba(233,210,154,.5)";

export function RunningCouple() {
  return (
    <svg
      viewBox="0 0 220 140"
      preserveAspectRatio="xMidYMax meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 10px 18px rgba(0,0,0,.4))" }}
      aria-hidden="true"
    >
      {/* ══ bride (left) ══ */}
      <g className="rc-bob" style={{ animationDelay: "-.12s" }}>
        {/* veil streaming behind, translucent */}
        <path
          className="rc-veil"
          d="M88 24 C 66 26 46 40 32 62 C 50 54 68 44 88 36 Z"
          fill="rgba(246,238,224,.28)"
        />
        {/* the gown: one continuous line from bodice to a long train */}
        <path
          className="rc-gown"
          d="M90 46
             C 96 52 98 60 97 68
             C 103 82 108 98 112 112
             C 113 116 111 118 106 118
             C 84 118 58 116 42 108
             C 58 100 70 88 76 74
             C 80 62 84 52 90 46 Z"
          fill={INK}
        />
        {/* gold rim-light along the train's sweep */}
        <path
          className="rc-gown"
          d="M42 108 C 58 100 70 88 76 74"
          fill="none"
          stroke={RIM}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* torso + raised chin: slender, upright */}
        <path
          d="M86 44 C 84 36 86 30 90 27 C 95 24 100 27 101 32 C 102 37 100 41 96 44 C 100 52 99 60 96 66 C 90 68 85 64 84 56 C 84 51 85 47 86 44 Z"
          fill={INK}
        />
        {/* low chignon + a breath of gold at the crown */}
        <circle cx="87" cy="29" r="4.6" fill={INK} />
        <path d="M84 24 C 88 20 96 20 99 26" fill="none" stroke={RIM} strokeWidth="1" strokeLinecap="round" />
        {/* front arm reaching to his hand */}
        <path d="M94 52 C 102 62 110 71 117 78" stroke={INK} strokeWidth="4.6" strokeLinecap="round" fill="none" />
      </g>

      {/* joined hands — a single point of gold light */}
      <circle cx="119" cy="80" r="3.2" fill={INK} />
      <circle cx="119" cy="79" r="5.6" fill="none" stroke={RIM} strokeWidth="0.8" opacity="0.8" />
      <circle cx="119" cy="76" r="1.2" fill="#f6ecc4" />

      {/* ══ groom (right) ══ */}
      <g className="rc-bob">
        {/* back leg */}
        <g className="rc-leg rc-legB">
          <path d="M141 82 L139 114" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <path d="M139 114 L146 116" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* back arm swinging */}
        <g className="rc-arm rc-armB">
          <path d="M150 50 L159 72" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* torso in tails, leaning into the stride */}
        <path
          d="M144 40
             C 154 43 158 52 156 64
             C 155 72 152 80 148 86
             C 160 96 164 106 165 114
             L 160 114
             C 156 106 150 98 144 92
             C 140 86 137 76 137 66
             C 137 55 139 45 144 40 Z"
          fill={INK}
        />
        {/* collar rim-light */}
        <path d="M146 42 C 152 45 155 52 154 60" fill="none" stroke={RIM} strokeWidth="1" strokeLinecap="round" />
        {/* head, slight bow toward her */}
        <path d="M143 34 C 141 26 146 20 153 21 C 159 22 162 28 160 34 C 158 39 152 41 148 39 C 145 38 143 36 143 34 Z" fill={INK} />
        {/* front leg striding */}
        <g className="rc-leg">
          <path d="M144 84 L146 114" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <path d="M146 114 L153 116" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* front arm back to her hand */}
        <path d="M146 50 C 138 61 128 72 121 79" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
