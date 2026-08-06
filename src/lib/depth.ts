/**
 * ────────────────────────────────────────────────────────────────
 *  THE unified depth model — one eye for every 3D layer.
 *
 *  Every perspective in the piece (DOM `perspective`, GSAP
 *  `transformPerspective`, and both Three.js cameras) derives from
 *  EYE, so DOM translateZ and WebGL world-Z agree about how fast
 *  things grow as they approach the viewer. If two layers disagree
 *  about the projection, the depth illusion dies — this file is the
 *  single place that number lives.
 *
 *  Mapping: a Three.js camera whose fov = fovForViewport(px) and
 *  whose subject sits at the z chosen by distanceForFraming() has
 *  the SAME projection as a DOM layer with `perspective: EYE.perspective`
 *  rendered into `px` CSS pixels — 1 world unit ≡ 1 CSS px at z = 0.
 *
 *  Documented exception: the butterflies' 70px wing perspective is
 *  LOCAL wing articulation (a flap, not scene space) and stays.
 * ────────────────────────────────────────────────────────────────
 */

export const EYE = {
  /** px — the one perspective distance for the whole piece. */
  perspective: 1000,
  /** Shared vanishing point. The eye is a fixed camera looking at
   *  the center of the viewport — every layer keeps the CSS default
   *  origin (50% 50%); nothing may set a private perspective-origin. */
  origin: "50% 50%",
} as const;

/** Parallax depth rates — pointer and scroll parallax both draw from
 *  these, so a "far" layer always drifts slower than a "near" one by
 *  the same ratio everywhere. */
export const DEPTH_RATE = {
  FAR: 0.04, // night sky, silk, centerpiece halo
  MID: 0.1, // crest card, chapter stage
  NEAR: 0.22, // seal stage, foreground dust
} as const;

/** Pointer-parallax pixel shift for a layer at `rate` (px per full
 *  half-viewport of pointer travel). Keeps the arrival scene's card
 *  and seal on the same depth ladder as everything else. */
export function pointerShift(rate: number, axisPx: number): number {
  return rate * axisPx;
}

/** Three.js camera fov (degrees) that matches EYE.perspective for a
 *  canvas rendered at `heightPx` CSS pixels. */
export function fovForViewport(heightPx: number): number {
  return (2 * Math.atan(heightPx / 2 / EYE.perspective) * 180) / Math.PI;
}

/** Camera distance (world units) that keeps a subject of
 *  `halfHeightWorld` filling the same fraction of frame under the
 *  matched fov — use when retro-fitting an existing scene whose
 *  geometry was authored in arbitrary units. */
export function distanceForFraming(halfHeightWorld: number, heightPx: number): number {
  const halfFovRad = Math.atan(heightPx / 2 / EYE.perspective);
  return halfHeightWorld / Math.tan(halfFovRad);
}
