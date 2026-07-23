import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

const rnd = gsap.utils.random;

/** Champagne / moonlight / lilac palette shared with the scene. */
const PIXIE_COLORS = ["#fff7e0", "#f6ecc4", "#e9d29a", "#d9c7f0", "#ffffff", "#f2d8d7"];
const WAX_GRADIENTS = [
  "linear-gradient(135deg,#f4e6c0,#c9a35b 60%,#9a7636)",
  "linear-gradient(160deg,#e9d29a,#b8935a 55%,#8a6a2f)",
  "linear-gradient(115deg,#f6ecc4,#c9a35b 50%,#a9853f)",
];

export interface SealBurst3DOptions {
  /** Fixed, full-viewport layer with `perspective` set — everything spawns inside it. */
  layer: HTMLElement;
  /** Seal center in viewport coordinates. */
  x: number;
  y: number;
  /** The wax-seal button itself — gets the 3D press/shatter/tumble treatment. */
  seal: HTMLElement | null;
  /** Dove wrappers ([data-dove]) pre-positioned at the seal center. */
  doves: HTMLElement[];
  /** Honors prefers-reduced-motion: simple fades, no particles/flights. */
  reduced: boolean;
}

/** Creates an absolutely-positioned child centered on (x,y) inside the layer. */
function anchor(layer: HTMLElement, x: number, y: number) {
  const a = document.createElement("div");
  a.style.position = "absolute";
  a.style.left = `${x}px`;
  a.style.top = `${y}px`;
  a.style.transformStyle = "preserve-3d";
  a.style.pointerEvents = "none";
  layer.appendChild(a);
  return a;
}

function spawn(parent: HTMLElement, css: Partial<CSSStyleDeclaration>) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = "0";
  el.style.top = "0";
  el.style.willChange = "transform, opacity";
  Object.assign(el.style, css);
  parent.appendChild(el);
  return el;
}

/** Four-point sparkle star as an SVG string (rotates on Y for a 3D glint). */
function starSVG(size: number, color: string) {
  return `<svg viewBox="0 0 10 10" width="${size}" height="${size}" style="display:block;overflow:visible">
    <path d="M5 0 L6.1 3.9 L10 5 L6.1 6.1 L5 10 L3.9 6.1 L0 5 L3.9 3.9 Z" fill="${color}"/>
  </svg>`;
}

/** Soft white down-feather shed by the doves mid-flight. */
function featherSVG() {
  return `<svg viewBox="0 0 24 40" width="13" height="22" style="display:block">
    <path d="M12 0 C18 10 20 24 12 40 C4 24 6 10 12 0 Z" fill="#f7f2e4" opacity="0.92"/>
    <path d="M12 4 C12 14 12 26 12 36" stroke="#d8d0ba" stroke-width="1" fill="none"/>
    <path d="M12 12 C9 13 7 15 6 18 M12 18 C15 19 17 21 18 24" stroke="#e4dcc6" stroke-width=".7" fill="none"/>
  </svg>`;
}

export interface CameraDiveOptions {
  /** The fixed arrival overlay that the camera dives "through". */
  overlay: HTMLElement;
  /** Hero section that emerges on the far side of the dive. */
  hero: HTMLElement | null;
  /** FX layer for the light streaks (same layer as the burst). */
  layer: HTMLElement;
  /** Seal center in viewport coords — the vanishing point. */
  x: number;
  y: number;
  reduced: boolean;
}

/**
 * The zoom-through: instead of politely fading, the whole arrival
 * scene accelerates PAST the camera — scaling from the seal's exact
 * position with a blur ramp while thin gold light-streaks (warp
 * lines) tear radially outward — and the hero emerges on the far
 * side, settling from oversized/blurred to crisp. The signature move
 * of cinematic award sites: a camera dive, not a crossfade.
 */
export function playCameraDive({ overlay, hero, layer, x, y, reduced }: CameraDiveOptions) {
  const tl = gsap.timeline();

  if (reduced) {
    tl.to(overlay, { opacity: 0, duration: 0.8, ease: "power1.inOut" });
    if (hero) tl.fromTo(hero, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.4);
    tl.set(overlay, { pointerEvents: "none" }, 0);
    return tl;
  }

  // Light streaks: thin gold lines tearing outward from the seal —
  // the "warp" that sells the acceleration.
  const root = anchor(layer, x, y);
  tl.eventCallback("onComplete", () => root.remove());
  tl.eventCallback("onInterrupt", () => root.remove());
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * 360 + rnd(-8, 8);
    const streak = spawn(root, {
      width: `${rnd(120, 340)}px`,
      height: `${rnd(1, 2.5)}px`,
      background:
        "linear-gradient(90deg, transparent, rgba(246,236,196,.95) 30%, rgba(233,210,154,.6) 70%, transparent)",
      transformOrigin: "0% 50%",
      borderRadius: "2px",
      boxShadow: "0 0 8px rgba(233,210,154,.8)",
    });
    const t0 = 0.06 + rnd(0, 0.22);
    tl.set(streak, { rotation: angle, scaleX: 0, opacity: 0, x: rnd(20, 60) * Math.cos((angle * Math.PI) / 180), y: rnd(20, 60) * Math.sin((angle * Math.PI) / 180) }, t0)
      .to(streak, { scaleX: rnd(2.4, 4.2), opacity: 1, duration: 0.34, ease: "power4.in" }, t0)
      .to(streak, { scaleX: rnd(5, 7.5), opacity: 0, duration: 0.3, ease: "power2.out" }, t0 + 0.34);
  }

  // The dive itself: origin pinned to the seal so we fall INTO it.
  // Deliberately budget-conscious: the overlay hosts a full-viewport
  // iframe, so the scale is capped and opacity dies early — the
  // acceleration is sold by the streaks + blur ramp, not raw scale
  // (scale 8 + blur 16 rasterizes a monster layer and starves the
  // rAF ticker on weaker GPUs).
  const ox = (x / window.innerWidth) * 100;
  const oy = (y / window.innerHeight) * 100;
  tl.set(overlay, { transformOrigin: `${ox}% ${oy}%`, willChange: "transform, opacity" }, 0)
    .to(overlay, { scale: 1.9, filter: "blur(2px)", duration: 0.5, ease: "power2.in" }, 0.05)
    .to(overlay, {
      scale: 4.2,
      opacity: 0,
      filter: "blur(6px)",
      duration: 0.85,
      ease: "power3.in",
    }, 0.55)
    .set(overlay, { pointerEvents: "none" }, 0.55);

  // Emerging on the far side: the hero settles from oversized + soft
  // to crisp — we arrive somewhere, we don't just land on a page.
  if (hero) {
    tl.fromTo(
      hero,
      { scale: 1.14, opacity: 0.3, filter: "blur(8px)", transformOrigin: "50% 42%" },
      // clearProps must stay scoped: "all" would wipe the section's
      // React-inlined layout styles (flex, background, padding).
      { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.3, ease: "expo.out", clearProps: "transform,filter,opacity" },
      1.0,
    );
  }

  return tl;
}

/**
 * The signature seal-break moment, rebuilt in true 3D:
 *
 *  1. the wax seal is pressed in, shudders, then SHATTERS — the disc
 *     tumbles toward the viewer (rotateX/rotateY + translateZ) while
 *     18 wax shards spin off with gravity arcs at different depths;
 *  2. a ground-plane shockwave ring (tilted ~72°) races outward under
 *     a burst of pixie dust — ~110 motes and 4-point glint stars that
 *     explode outward in 3D (random z from -420 to 520), flicker like
 *     real fairy dust, then float up and swirl as they die;
 *  3. a rising helix of dust — the Tinker-Bell trail — spirals up out
 *     of the broken seal;
 *  4. three doves launch on curved motion paths (banking into their
 *     turns, rolling subtly on Y, scaling up as they fly "past" the
 *     camera) while loose down-feathers flutter to the ground.
 *
 * Everything self-removes; the returned timeline can be killed to
 * clean up early (kill removes the spawn anchors via onInterrupt).
 */
export function playSealBurst3D({ layer, x, y, seal, doves, reduced }: SealBurst3DOptions) {
  const vh = window.innerHeight;
  const anchors: HTMLElement[] = [];
  const tl = gsap.timeline({
    onComplete: () => anchors.forEach((a) => a.remove()),
    onInterrupt: () => anchors.forEach((a) => a.remove()),
  });

  // ── Reduced motion: a quiet, dignified fade — nothing flies. ──────
  if (reduced) {
    if (seal) tl.to(seal, { opacity: 0, scale: 1.06, duration: 0.8, ease: "power1.out" }, 0);
    tl.to(doves, { opacity: 0, duration: 0.01 }, 0);
    return tl;
  }

  // ══ 1. THE SEAL: press → shudder → 3D tumble toward the camera ══
  if (seal) {
    tl.to(seal, { scale: 0.92, duration: 0.14, ease: "power2.in", transformPerspective: 900 }, 0)
      .to(seal, { rotation: 2.5, duration: 0.05, yoyo: true, repeat: 5, ease: "none" }, 0.14)
      .to(
        seal,
        {
          rotationX: -74,
          rotationY: 26,
          rotation: 38,
          z: 430,
          scale: 1.55,
          opacity: 0,
          filter: "blur(7px)",
          duration: 0.95,
          ease: "power3.in",
          transformPerspective: 900,
        },
        0.42,
      );
  }

  const root = anchor(layer, x, y);
  anchors.push(root);

  // ══ 2a. Ground-plane shockwave — a ring lying "on the floor" ══
  const ground = spawn(root, {
    width: "60px",
    height: "60px",
    marginLeft: "-30px",
    marginTop: "-30px",
    borderRadius: "50%",
    border: "2px solid rgba(246,236,196,.9)",
    boxShadow: "0 0 34px rgba(233,210,154,.65), inset 0 0 26px rgba(233,210,154,.5)",
  });
  tl.fromTo(
    ground,
    { rotationX: 72, scale: 0.1, opacity: 0.95, transformPerspective: 800 },
    { scale: 14, opacity: 0, duration: 1.9, ease: "expo.out" },
    0.5,
  );
  // …and a vertical halo ring for the light itself.
  const halo = spawn(root, {
    width: "170px",
    height: "170px",
    marginLeft: "-85px",
    marginTop: "-85px",
    borderRadius: "50%",
    border: "1.5px solid rgba(246,236,196,.85)",
    boxShadow: "0 0 24px rgba(233,210,154,.7)",
  });
  tl.fromTo(halo, { scale: 0.12, opacity: 0.9 }, { scale: 5.5, opacity: 0, duration: 1.6, ease: "power3.out" }, 0.52);

  // ══ 2b. WAX SHARDS — the seal breaks into real 3D pieces ══
  for (let i = 0; i < 18; i += 1) {
    const size = rnd(9, 26);
    const shard = spawn(root, {
      width: `${size}px`,
      height: `${size * rnd(0.7, 1.1)}px`,
      background: WAX_GRADIENTS[i % WAX_GRADIENTS.length],
      clipPath:
        i % 2
          ? "polygon(50% 0%, 100% 62%, 22% 100%)"
          : "polygon(0% 18%, 78% 0%, 100% 74%, 30% 100%)",
      boxShadow: "0 4px 10px rgba(0,0,0,.35)",
    });
    const a = rnd(0, Math.PI * 2);
    const dist = rnd(70, 240);
    const upKick = rnd(30, 120);
    tl.set(shard, { xPercent: -50, yPercent: -50, z: rnd(-60, 60), opacity: 1 }, 0.5)
      // launch: out + up on a fast ease…
      .to(
        shard,
        {
          x: Math.cos(a) * dist * 0.6,
          y: Math.sin(a) * dist * 0.35 - upKick,
          z: rnd(-160, 260),
          rotationX: rnd(-360, 360),
          rotationY: rnd(-360, 360),
          rotation: rnd(-220, 220),
          duration: 0.42,
          ease: "power2.out",
        },
        0.5,
      )
      // …then gravity takes it, tumbling as it falls out of frame.
      .to(
        shard,
        {
          x: Math.cos(a) * dist,
          y: Math.sin(a) * dist * 0.35 + rnd(160, 340),
          rotationX: `+=${rnd(120, 420)}`,
          rotationY: `+=${rnd(-260, 260)}`,
          opacity: 0,
          duration: rnd(0.7, 1.05),
          ease: "power2.in",
        },
        0.92,
      );
  }

  // ══ 2c. PIXIE DUST — 3D explosion with flicker + floaty death ══
  const R = Math.hypot(window.innerWidth, vh) / 2 + 80;
  for (let i = 0; i < 110; i += 1) {
    const far = i >= 46; // wave 2: rides the shockwave, slower, farther
    const color = PIXIE_COLORS[i % PIXIE_COLORS.length];
    const isStar = i % 4 === 0;
    const size = rnd(2.5, far ? 6 : 8);
    const depth = rnd(-420, 520);
    const depthBlur = Math.min(4, Math.abs(depth) / 160);

    const p = spawn(root, isStar ? {} : {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${size + 4}px ${color}`,
    });
    if (isStar) {
      p.innerHTML = starSVG(size * 2.4, color);
      p.style.filter = `drop-shadow(0 0 5px ${color}) blur(${depthBlur * 0.6}px)`;
    } else if (depthBlur > 0.8) {
      p.style.filter = `blur(${depthBlur}px)`; // depth of field
    }

    const a = rnd(0, Math.PI * 2);
    const d = far ? rnd(R * 0.4, R * 1.05) : rnd(60, R * 0.45);
    const tx = Math.cos(a) * d;
    const ty = Math.sin(a) * d - (far ? 90 : 40); // biased upward
    const t0 = 0.5 + (far ? rnd(0.25, 0.8) : rnd(0, 0.2));
    const burstDur = far ? rnd(1.6, 2.6) : rnd(0.8, 1.4);

    tl.set(p, { xPercent: -50, yPercent: -50, opacity: 0, scale: rnd(0.6, 1.3) }, t0)
      .to(p, { opacity: 1, duration: 0.08, ease: "none" }, t0)
      // explosive 3D radial burst…
      .to(p, { x: tx, y: ty, z: depth, rotationY: isStar ? rnd(280, 720) : 0, duration: burstDur, ease: "expo.out" }, t0)
      // …flickering like living fairy dust the whole way…
      .to(p, { opacity: rnd(0.25, 0.6), duration: rnd(0.08, 0.16), repeat: Math.floor(rnd(4, 9)), yoyo: true, ease: "sine.inOut" }, t0 + 0.15)
      // …then it goes weightless: drifts up, sways, and winks out.
      .to(
        p,
        {
          x: tx + rnd(-46, 46),
          y: ty - rnd(50, 130),
          scale: 0,
          opacity: 0,
          duration: rnd(0.7, 1.2),
          ease: "sine.in",
        },
        t0 + burstDur * 0.82,
      );
  }

  // ══ 3. THE RISING HELIX — a spiral of dust climbing out of the seal ══
  for (let i = 0; i < 34; i += 1) {
    const color = PIXIE_COLORS[(i + 2) % PIXIE_COLORS.length];
    const size = rnd(2, 4.5);
    const p = spawn(root, {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${size + 5}px ${color}`,
    });
    const a0 = rnd(0, Math.PI * 2);
    const turns = rnd(2.6, 3.6);
    const rise = rnd(vh * 0.34, vh * 0.52);
    const pts: { x: number; y: number }[] = [];
    for (let k = 0; k <= 9; k += 1) {
      const t = k / 9;
      const ang = a0 + t * turns * Math.PI * 2;
      const rad = 14 + t * rnd(120, 170);
      pts.push({ x: Math.cos(ang) * rad, y: -t * rise + Math.sin(ang) * rad * 0.3 });
    }
    const t0 = 0.62 + i * 0.028;
    tl.set(p, { xPercent: -50, yPercent: -50, opacity: 0 }, t0)
      .to(p, { opacity: 1, duration: 0.12 }, t0)
      .to(p, { motionPath: { path: pts, curviness: 1.3 }, z: rnd(-120, 160), duration: rnd(1.7, 2.4), ease: "power1.out" }, t0)
      .to(p, { opacity: 0, scale: 0.1, duration: 0.5, ease: "sine.in" }, t0 + rnd(1.5, 2.0));
  }

  // ══ 4. THE DOVES — curved flight paths with banking + camera flyby ══
  const exitY = -(y + 180); // guaranteed off the top of the viewport
  const flights: {
    path: { x: number; y: number }[];
    bank: number[];
    scaleTo: number;
    z: number;
    blur: number;
    dur: number;
    at: number;
  }[] = [
    {
      // near-left: sweeps left then banks hard up past the camera
      path: [{ x: 0, y: 0 }, { x: -70, y: -26 }, { x: -170, y: -120 }, { x: -240, y: exitY * 0.55 }, { x: -290, y: exitY }],
      bank: [-4, -14, -24, -16], scaleTo: 1.3, z: 240, blur: 0, dur: 3.6, at: 0.72,
    },
    {
      // near-right: mirrored, a touch slower — they fly as a pair
      path: [{ x: 0, y: 0 }, { x: 76, y: -30 }, { x: 180, y: -130 }, { x: 250, y: exitY * 0.58 }, { x: 300, y: exitY }],
      bank: [4, 15, 26, 17], scaleTo: 1.26, z: 210, blur: 0, dur: 3.85, at: 0.88,
    },
    {
      // far-center: smaller, softly blurred — depth of field sells the 3D
      path: [{ x: 0, y: 0 }, { x: 30, y: -90 }, { x: -34, y: -240 }, { x: 44, y: exitY * 0.7 }, { x: 10, y: exitY }],
      bank: [2, -8, 8, -5], scaleTo: 0.72, z: -260, blur: 1.4, dur: 4.3, at: 1.05,
    },
  ];

  doves.slice(0, flights.length).forEach((dove, i) => {
    const f = flights[i];
    if (f.blur) dove.style.filter = `blur(${f.blur}px)`;
    tl.set(dove, { xPercent: -50, yPercent: -50, scale: 0.42, opacity: 0, transformPerspective: 900 }, f.at)
      .to(dove, { opacity: 1, duration: 0.35, ease: "power1.out" }, f.at)
      // the flight itself — one smooth curve, banking through each leg
      .to(dove, { motionPath: { path: f.path, curviness: 1.4 }, duration: f.dur, ease: "power1.inOut" }, f.at)
      .to(dove, { rotation: f.bank[0], duration: f.dur * 0.22, ease: "sine.inOut" }, f.at)
      .to(dove, { rotation: f.bank[1], duration: f.dur * 0.26, ease: "sine.inOut" }, f.at + f.dur * 0.22)
      .to(dove, { rotation: f.bank[2], duration: f.dur * 0.3, ease: "sine.inOut" }, f.at + f.dur * 0.48)
      .to(dove, { rotation: f.bank[3], duration: f.dur * 0.22, ease: "sine.inOut" }, f.at + f.dur * 0.78)
      // body roll: subtle Y oscillation — wings catching the light
      .to(dove, { rotationY: i === 2 ? -10 : 12, duration: f.dur / 4, repeat: 3, yoyo: true, ease: "sine.inOut" }, f.at)
      // growing toward (or shrinking away from) the camera
      .to(dove, { scale: f.scaleTo, z: f.z, duration: f.dur, ease: "power1.in" }, f.at)
      .to(dove, { opacity: 0, duration: 0.5, ease: "power1.in" }, f.at + f.dur - 0.5);
  });

  // ══ 4b. Down-feathers shed mid-flight, fluttering to earth ══
  for (let i = 0; i < 6; i += 1) {
    const f = spawn(root, { opacity: "0" });
    f.innerHTML = featherSVG();
    const startX = rnd(-140, 140);
    const startY = rnd(-260, -120);
    const t0 = rnd(1.7, 2.6);
    const fall = rnd(220, 360);
    const sway = rnd(28, 52);
    tl.set(f, { xPercent: -50, yPercent: -50, x: startX, y: startY, rotation: rnd(-40, 40) }, t0)
      .to(f, { opacity: 0.9, duration: 0.25 }, t0)
      .to(
        f,
        {
          keyframes: [
            { x: startX + sway, y: startY + fall * 0.33, rotation: "+=55", duration: 1 },
            { x: startX - sway, y: startY + fall * 0.66, rotation: "-=70", duration: 1.1 },
            { x: startX + sway * 0.6, y: startY + fall, rotation: "+=45", duration: 1.2 },
          ],
          ease: "sine.inOut",
        },
        t0,
      )
      .to(f, { opacity: 0, duration: 0.7 }, t0 + 2.6);
  }

  return tl;
}
