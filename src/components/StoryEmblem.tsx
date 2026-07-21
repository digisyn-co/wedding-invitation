"use client";

import { useId, type CSSProperties } from "react";

/**
 * "Engraved gold" story emblems — the luxury-stationery treatment.
 * Each chapter is a fine-line gold illustration that DRAWS ITSELF as
 * the chapter arrives (stroke-dash reveal, staggered via --dd), then a
 * bead of light travels the line forever (.spark-line). Activation is
 * driven by the story scroller toggling .ch-active on the chapter.
 *
 *   0 The First Glance   — two swans meet, a star between them
 *   1 A Thousand Letters — an envelope opens, its letter takes flight
 *   2 The Question       — a solitaire ring beneath falling starlight
 *   3 The Beginning      — two rings interlocked over an endless line
 */

const GOLD_W = 1.8;

function dd(s: number): CSSProperties {
  return { ["--dd" as string]: `${s}s` } as CSSProperties;
}

export function StoryEmblem({ chapter }: { chapter: number }) {
  const uid = useId().replace(/[:]/g, "");
  const gold = `gold-${uid}`;
  const bg = `embg-${uid}`;
  const stroke = `url(#${gold})`;

  const draw = (d: string, delay: number, w = GOLD_W) => (
    <path d={d} pathLength={1} className="draw" fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={dd(delay)} />
  );
  const spark = (d: string, delay = 0) => (
    <path d={d} pathLength={1} className="spark-line" fill="none" stroke="#fdfaf0" strokeWidth={GOLD_W + 0.4} strokeLinecap="round" style={dd(delay)} />
  );

  return (
    <svg
      viewBox="0 0 200 250"
      preserveAspectRatio="xMidYMid slice"
      className="story-emblem"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 0 7px rgba(233,210,154,.45))" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4e7c4" />
          <stop offset="45%" stopColor="#c9a35b" />
          <stop offset="75%" stopColor="#e9d29a" />
          <stop offset="100%" stopColor="#b8935a" />
        </linearGradient>
        <radialGradient id={bg} cx="50%" cy="36%" r="85%">
          <stop offset="0%" stopColor="#241f3c" />
          <stop offset="70%" stopColor="#181430" />
          <stop offset="100%" stopColor="#100e1d" />
        </radialGradient>
      </defs>

      <rect width={200} height={250} fill={`url(#${bg})`} />
      {/* inner engraved oval frame */}
      {draw("M100 22 C 152 22 178 62 178 125 C 178 188 152 228 100 228 C 48 228 22 188 22 125 C 22 62 48 22 100 22 Z", 0, 0.9)}

      {chapter === 0 && (
        <g>
          {/* left swan — one continuous elegant line */}
          {draw("M42 168 C 46 148 60 142 66 126 C 71 112 66 100 56 98 C 49 97 45 102 47 107 C 48 110 52 111 54 108", 0.35)}
          {draw("M54 108 L44 106", 1.15, 1.4)}
          {/* right swan */}
          {draw("M158 168 C 154 148 140 142 134 126 C 129 112 134 100 144 98 C 151 97 155 102 153 107 C 152 110 148 111 146 108", 0.55)}
          {draw("M146 108 L156 106", 1.35, 1.4)}
          {/* wing sweeps */}
          {draw("M46 158 C 58 150 66 138 68 124", 1.2, 1)}
          {draw("M154 158 C 142 150 134 138 132 124", 1.4, 1)}
          {/* water */}
          {draw("M34 176 C 60 168 140 168 166 176", 1.6, 1)}
          {draw("M56 186 C 76 181 124 181 144 186", 1.85, 0.8)}
          {/* the star between them */}
          <g className="em-fade">
            <path d="M100 96 L102.6 105 L112 108 L102.6 111 L100 120 L97.4 111 L88 108 L97.4 105 Z" fill={stroke} style={{ transformBox: "fill-box", transformOrigin: "center", animation: "sparkle 3.2s ease-in-out 2.4s infinite" } as CSSProperties} />
          </g>
          {spark("M42 168 C 46 148 60 142 66 126 C 71 112 66 100 56 98 C 49 97 45 102 47 107 C 48 110 52 111 54 108", 0.1)}
          {spark("M158 168 C 154 148 140 142 134 126 C 129 112 134 100 144 98 C 151 97 155 102 153 107 C 152 110 148 111 146 108", 1.1)}
        </g>
      )}

      {chapter === 1 && (
        <g>
          {/* envelope */}
          {draw("M52 138 L148 138 L148 196 L52 196 Z", 0.35)}
          {draw("M52 138 L100 168 L148 138", 0.9)}
          {/* letter rising */}
          {draw("M70 128 L130 128 L130 84 L70 84 Z", 1.3)}
          {draw("M80 98 L120 98", 1.75, 1)}
          {draw("M80 108 L112 108", 1.9, 1)}
          {/* flight path, up and away */}
          {draw("M132 82 C 148 66 156 54 152 38", 2.1, 1)}
          {/* the letter's heart, taking wing */}
          <g className="em-fade">
            <path d="M152 38 C 149 32 142 34 146 41 C 149 45 152 46 152 46 C 152 46 155 45 158 41 C 162 34 155 32 152 38 Z" fill={stroke} style={{ transformBox: "fill-box", transformOrigin: "center", animation: "floaty 3.4s ease-in-out 2.6s infinite" } as CSSProperties} />
          </g>
          {spark("M52 138 L100 168 L148 138", 0.4)}
          {spark("M132 82 C 148 66 156 54 152 38", 1.6)}
        </g>
      )}

      {chapter === 2 && (
        <g>
          {/* band */}
          {draw("M100 200 C 128 200 146 182 146 158 C 146 134 128 118 100 118 C 72 118 54 134 54 158 C 54 182 72 200 100 200 Z", 0.35)}
          {/* prongs */}
          {draw("M88 122 L84 108 M112 122 L116 108", 1.4, 1.2)}
          {/* the solitaire — faceted */}
          {draw("M100 58 L124 84 L100 112 L76 84 Z", 1.1)}
          {draw("M76 84 L124 84 M100 58 L90 84 L100 112 M100 58 L110 84 L100 112", 1.6, 0.9)}
          {/* starlight falling on the stone */}
          {draw("M100 30 L100 44", 2.1, 1)}
          {draw("M70 48 L79 58 M130 48 L121 58", 2.25, 1)}
          {/* orbiting mote of light */}
          <g className="em-fade" style={{ transformBox: "view-box", transformOrigin: "100px 148px", animation: "spinSlow 9s linear 2.6s infinite" } as CSSProperties}>
            <circle cx={100} cy={92} r={2.6} fill="#fdfaf0" style={{ filter: "drop-shadow(0 0 6px rgba(253,250,240,.9))" }} />
          </g>
          {spark("M100 200 C 128 200 146 182 146 158 C 146 134 128 118 100 118 C 72 118 54 134 54 158 C 54 182 72 200 100 200 Z", 0.5)}
          {spark("M100 58 L124 84 L100 112 L76 84 Z", 1.5)}
        </g>
      )}

      {chapter === 3 && (
        <g>
          {/* two interlocked bands */}
          {draw("M84 112 C 106 112 122 128 122 148 C 122 168 106 184 84 184 C 62 184 46 168 46 148 C 46 128 62 112 84 112 Z", 0.35)}
          {draw("M116 112 C 138 112 154 128 154 148 C 154 168 138 184 116 184 C 94 184 78 168 78 148 C 78 128 94 112 116 112 Z", 0.75)}
          {/* the endless line beneath */}
          {draw("M52 214 C 52 202 72 202 100 214 C 128 226 148 226 148 214 C 148 202 128 202 100 214 C 72 226 52 226 52 214", 1.5, 1.2)}
          {/* crowning stars */}
          <g className="em-fade">
            <path d="M100 62 L102.2 70 L110 72 L102.2 74 L100 82 L97.8 74 L90 72 L97.8 70 Z" fill={stroke} style={{ transformBox: "fill-box", transformOrigin: "center", animation: "sparkle 3s ease-in-out 2.5s infinite" } as CSSProperties} />
            <circle cx={70} cy={84} r={1.6} fill="#f6efd8" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "twinkle 3.6s ease-in-out 2.8s infinite" } as CSSProperties} />
            <circle cx={132} cy={82} r={1.4} fill="#f6efd8" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "twinkle 4.2s ease-in-out 3.1s infinite" } as CSSProperties} />
          </g>
          {spark("M84 112 C 106 112 122 128 122 148 C 122 168 106 184 84 184 C 62 184 46 168 46 148 C 46 128 62 112 84 112 Z", 0.4)}
          {spark("M116 112 C 138 112 154 128 154 148 C 154 168 138 184 116 184 C 94 184 78 168 78 148 C 78 128 94 112 116 112 Z", 1.2)}
          {spark("M52 214 C 52 202 72 202 100 214 C 128 226 148 226 148 214 C 148 202 128 202 100 214 C 72 226 52 226 52 214", 2)}
        </g>
      )}
    </svg>
  );
}
