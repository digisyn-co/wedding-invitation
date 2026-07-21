/**
 * The couple running hand-in-hand, side view, facing right — original
 * flat-style SVG matching the site's characters. A full run cycle:
 * alternating legs (legSwing, opposite phases), pumping arm, quick
 * body bob, her veil streaming and gown flowing behind. Motion classes
 * (rc-*) live in globals.css. Fills its sized wrapper (viewBox 220x140,
 * ground line at y≈118).
 */
export function RunningCouple() {
  return (
    <svg
      viewBox="0 0 220 140"
      preserveAspectRatio="xMidYMax meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))" }}
      aria-hidden="true"
    >
      {/* ══ bride (behind, left) ══ */}
      <g className="rc-bob" style={{ animationDelay: "-.12s" }}>
        {/* veil streaming behind */}
        <path className="rc-veil" d="M84 26 C 62 30 46 44 36 64 C 50 58 68 46 86 38 Z" fill="rgba(255,251,242,.5)" />
        {/* gown flowing, train kicked back */}
        <path className="rc-gown" d="M92 58 C 103 64 106 82 112 96 C 118 110 112 118 96 118 C 74 118 52 114 44 104 C 56 98 64 84 68 72 C 74 60 85 55 92 58 Z" fill="#f6eee6" />
        <path className="rc-gown" d="M50 104 C 62 100 70 90 74 80 C 70 94 64 104 54 108 Z" fill="#f2d8d7" opacity=".8" />
        {/* front leg peeking beneath the hem */}
        <g className="rc-leg" style={{ animationDelay: "-.1s" }}>
          <path d="M98 106 L103 117" stroke="#ecc7ae" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="103" cy="118" r="4" fill="#c9a35b" />
        </g>
        {/* bodice + waist ribbon */}
        <path d="M88 50 C 97 52 101 62 98 73 C 91 77 83 74 81 66 C 81 57 84 52 88 50 Z" fill="#f2d8d7" />
        <path d="M83 70 C 89 73 95 73 99 71 L 98 76 C 93 78 87 78 82 75 Z" fill="#c9a35b" opacity=".85" />
        {/* back arm holding the dress */}
        <path d="M84 58 C 79 64 75 70 73 78" stroke="#ecc7ae" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* head: bun, floral crown, profile */}
        <circle cx="92" cy="36" r="9.5" fill="#ecc7ae" />
        <path d="M82 34 C 82 26 88 22 94 23 C 100 24 103 29 102 34 C 98 27 88 26 82 34 Z" fill="#5a4632" />
        <circle cx="83" cy="28" r="4.6" fill="#5a4632" />
        <circle cx="87" cy="24" r="1.5" fill="#f2d8d7" />
        <circle cx="92" cy="22.6" r="1.5" fill="#e9d29a" />
        <circle cx="97" cy="23.4" r="1.5" fill="#f2d8d7" />
        <circle cx="96" cy="34.6" r="1.4" fill="#3a3550" />
        <path d="M97 40 Q 99.5 41.5 101 40" stroke="#b06a6a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <circle cx="90" cy="39.5" r="1.8" fill="rgba(224,150,150,.5)" />
        {/* front arm reaching to his hand */}
        <path d="M95 56 C 103 64 111 72 118 79" stroke="#ecc7ae" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>

      {/* joined hands, with a spark above */}
      <circle cx="119" cy="80" r="3.6" fill="#ecc7ae" />
      <circle cx="119" cy="76.5" r="1.3" fill="#f6ecc4" />

      {/* ══ groom (front, right) ══ */}
      <g className="rc-bob">
        {/* back leg + swinging back arm */}
        <g className="rc-leg rc-legB">
          <path d="M140 84 L140 114" stroke="#2e2a40" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="142" cy="116" rx="5" ry="3.4" fill="#241f38" />
        </g>
        <g className="rc-arm rc-armB">
          <path d="M150 52 L158 74" stroke="#332e4a" strokeWidth="6" strokeLinecap="round" />
          <circle cx="159" cy="77" r="3.4" fill="#ecc7ae" />
        </g>
        {/* torso leaning into the run, lapel, shirt + bow tie */}
        <path d="M147 42 C 158 47 158 64 152 82 C 147 86 139 85 136 80 C 139 66 141 51 147 42 Z" fill="#3a3550" />
        <path d="M148 46 C 152 50 152 58 150 64" stroke="#4a4468" strokeWidth="1.4" fill="none" />
        <path d="M148 44 L152 52 L147 56 Z" fill="#f6eee6" />
        <path d="M147 45 L151 47 L147 49 Z" fill="#c9a35b" />
        {/* front leg */}
        <g className="rc-leg">
          <path d="M142 84 L142 114" stroke="#3a3550" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="144" cy="116" rx="5" ry="3.4" fill="#2b2640" />
        </g>
        {/* front arm back to her hand */}
        <path d="M146 52 C 138 62 128 72 121 79" stroke="#3a3550" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* head, profile */}
        <circle cx="152" cy="32" r="10" fill="#ecc7ae" />
        <path d="M141 30 C 141 20 149 15 157 18 C 163 21 165 28 163 33 C 159 24 147 23 141 30 Z" fill="#4a3826" />
        <circle cx="156.5" cy="30.5" r="1.5" fill="#3a3550" />
        <path d="M154.5 37 Q 157 38.6 159.5 37" stroke="#b06a6a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <circle cx="150" cy="36" r="1.9" fill="rgba(224,150,150,.5)" />
      </g>
    </svg>
  );
}
