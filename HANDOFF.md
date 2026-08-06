# Helson & Luna — Wedding Invitation Website · Handoff

**Repo:** `github.com/digisyn-co/wedding-invitation` (private)
**Branches:** `main` = production (Vercel auto-deploys) · `feat/3d-seal-transition` = working branch, currently identical to `main`. Merge order this cycle was branch → preview → merge to `main`.
**Stack:** Next.js 15.5 (App Router) · React 19 · TypeScript · Tailwind v4 (tokens only) · **GSAP 3 + ScrollTrigger** · **Three.js** (lazy-loaded) · WebAudio (synthesized, no audio files)
**Status:** Deployed. Production = Vercel project (`wedding-invitation-kappa-inky…` domain), serving `main`. `lint` / `typecheck` / `build` all pass.

---

## 0. Latest session — real story content, unified depth, focal-point images

**Content.** Date is now **Thursday, December 17, 2026** everywhere in
code (`content.ts`, `layout.tsx` metadata, details card). Story rewritten
to the couple's real arc (University of Iloilo → eight years → Lyannah →
the family's flight), with the couple's photographs framed in the
engraved **StoryLocket** treatment. ⚠️ The crest raster (`logo.webp`)
still says *12.12.2026* — needs a re-export from the designer.

**One depth model** (`src/lib/depth.ts`). `EYE.perspective = 1000px`
feeds: the FX layer, seal/dove `transformPerspective`, flip reveals, the
story stage, pointer-parallax rates (`DEPTH_RATE`), and BOTH Three.js
cameras (`fovForViewport` + `distanceForFraming` — 1 world unit ≡ 1 CSS
px at the screen plane). Change the number there and the whole piece
agrees. The butterflies' 70px wing perspective is a documented local
exception (wing articulation, not scene space).

**4D continuity.** Story chapters travel in real Z (far → screen plane →
past the camera) instead of scrubbed blur; every scene has a paired
scrubbed ENTER and EXIT (transform/opacity only — no filter animates
anywhere continuous); **ContinuityVeil** crossfades a twilight-gold /
ivory-gold screen-blend across the three tonal cuts (hero→couple,
story→details, rsvp→closing); `enter()` is ONE master GSAP timeline (was
six setTimeouts racing two timelines); the glide engine is
velocity-aware (950→620ms with flick speed, same-direction gestures
chain near a glide's end). 4×-CPU-throttled trace on the CI rig: story
scrub avg 1.5→3.5fps, boundary worst frame 1453→756ms (relative — the
rig is software-GL; real GPUs composite transform/opacity for free).

**Focal-point photos.** Every photo slot in `content.ts` is a
`WeddingPhoto = { src, focal: {x, y} }` — focal in % of the image,
aimed between the eyes; it drives `object-position` via the one
`FocalImage` component (next/image `fill`, honest `sizes`). To drop in
a real portrait: put the file in `/public/assets`, set `src` + `focal`
in `content.ts`, done — placeholders hold exact final geometry, nothing
reflows. `priority` belongs to the arrival crest ONLY (it is the LCP).
Measured: arrival crest 664KB → 47KB at 640w through the optimizer; the
nav monogram serves at 43px instead of shipping 360KB.

**Fixed this session:** couple vow was invisible at 1280×800/1440×900
(reveal-observer rootMargin + a 24px overflow); reduced-motion story was
a blurred ruin — now a composed still (nearest chapter crisp & present);
story header/chapter-label collision on short desktops; reduced-motion
users now get scroll control at 1.4s instead of waiting out the full
4.4s spectacle.

**Deliberately left alone:** the seal-burst/dive spectacle (its one-shot
capped blur is the signature moment and adaptive already); the engraved
SVG map, RunningCouple, EtherealScene (hand-made, load nothing, read as
craft); the glide-stop model (client-approved navigation feel); the
silk.jpg CSS background (decorative, behind everything, not worth a
component); `logo-original.webp` (designer's master, don't touch).

**Verify workflow:** `scripts/shoot.mjs` (56 captures, animated +
reduced × desktop + phone), `scripts/fitcheck.mjs` (8 viewports — all
scenes fit), `scripts/fps.mjs` (4×-throttled story + boundary trace).
Gotcha #6 (stale `next-server` after rebuild → 400 chunks → hydration
never runs) bit us twice more this session. `pkill -f next-server`.

---

## 1. What this is now

A cinematic luxury single-page invitation, heavily upgraded this session
from hand-rolled CSS into a GSAP/Three.js experience inspired by
lastdanceforglory.world and medhatalkadri.com. Everything below is
scroll- or click-choreographed, honors `prefers-reduced-motion`, and has
an **adaptive low-power tier** for phones.

### The experience, in order

| # | Beat | What happens | Where |
|---|------|--------------|-------|
| 0 | **Preloader** | Black veil, outlined gold serif counter 00→100, "A CELEBRATION IS LOADING", hairline rule, breathe-out reveal. | `CinematicPreloader.tsx` |
| 1 | **Arrival** | Procedural WebGL night sky (parallax twinkling stars, blue + lilac fbm nebulae, pointer parallax) — **replaced the old YouTube iframe**. Crest + wax seal haloed by a **real 3D gold ring** (PBR torus + gem, PMREM reflections, idle revolve/breathe). Pointer parallax floats crest & seal on separate depth planes. | `EtherealBackdrop.tsx`, `WeddingRing3D.tsx` |
| 2 | **Seal break** (click) | WebAudio bell-arpeggio swell → seal presses, shudders, shatters in 3D (tumbling wax shards, translateZ) → comet-trailed pixie dust + lens-glint stars in 3D depth → rising helix trail → tilted ground shockwave → three doves on GSAP motion paths (two-segment lagging wings, body bob) shedding feathers → **the ring rights itself, spins up and flies through the camera** → **camera dive**: overlay accelerates past the viewer from the seal's origin with gold warp streaks; hero settles from oversized/blurred to crisp. | `sealBurst3D.ts` (`playSealBurst3D`, `playCameraDive`), `Dove.tsx`, `WeddingRing3D.tsx`, `sealAudio.ts` |
| 3 | **Hero → sections** | As before (hero, couple, story, details, venue, RSVP, closing) plus: **GoldenCenterpiece** — the monogram crest glows fixed behind every scene, scroll-scrubbed drift/turn (the "persistent trophy" pattern); **section exit animations** (scrubbed drift-up + dim + blur as each scene leaves); reveal variety (3D flip-up detail cards, clip-path curtain wipe on the venue map). | `GoldenCenterpiece.tsx`, ScrollTrigger effects in `CinematicInvitation.tsx` |
| 4 | **Our Story** (680vh sticky scrub) | Four chapters **plus two scroll-scrubbed set-pieces in the gaps**, each with intermediate glide stops so they unfold over several gestures: **ch2→3 "growing up"** — captioned silhouettes light up along a golden path (A New Light / First Steps / Wild & Wonder / Grown for Love); **ch3→4 flight** — a **real Three.js airliner** (white PBR + gold winglets/tail/engine rims) takes off from center with "Philippines · Departure", banks out the right edge, transits unseen, re-enters left and **lands at center as Chapter 4 arrives** ("Perth · Australia · Arrival"). Chapter text dims while a set-piece holds the stage. Fully reversible on scroll-back. | `StoryFlight3D.tsx`, grow/flight drivers inside `storyScroll()` in `CinematicInvitation.tsx` |
| — | **Sound** | Bottom-left whispered SOUND toggle (animated bars). All audio is synthesized WebAudio: ambient D-chord drone pad + seal-break shimmer/bells. Default muted; autoplay-safe (armed on first gesture). | `sealAudio.ts` |

### Navigation model — the glide engine (unchanged core, new stops)

One gesture = one stop, 950ms glide. Stops = scene tops + 4 chapter
centers + **6 new set-piece stops** (pos 1.75/2.0/2.25 and 2.75/3.0/3.25)
+ intra-scene stops for tall sections. Disabled under reduced-motion.

---

## 2. Files added/changed this session

```
src/animations/sealBurst3D.ts    3D seal shatter, pixie dust (comet trails,
                                 glint stars, helix), doves, feathers,
                                 camera dive + warp streaks. Perf tier via
                                 isLowPower() (width<768 or ≤4 cores):
                                 fewer nodes, NO per-particle blur filters,
                                 no full-screen blur on the dive.
src/components/CinematicPreloader.tsx   00→100 loader
src/components/EtherealBackdrop.tsx     WebGL night-sky shader (raw WebGL,
                                        one quad, 0.4x/0.55x internal res,
                                        pauses on hidden tab, still frame
                                        under reduced-motion)
src/components/WeddingRing3D.tsx        3D gold ring (lazy three.js import,
                                        mounts under the preloader so it's
                                        warm before first click; joins the
                                        break late if clicked mid-load;
                                        try/catch WebGL; DPR 1.5 on touch;
                                        render loop stops after flight)
src/components/StoryFlight3D.tsx        3D airliner, keyframed flight plan,
                                        renders ONLY on scrub update()
                                        (imperative handle, no idle rAF)
src/components/GoldenCenterpiece.tsx    persistent crest, ScrollTrigger scrub
src/lib/sealAudio.ts                    WebAudio synth (unlock/setMuted/
                                        playSwell/ambient)
src/components/Dove.tsx                 two-segment wing articulation
                                        (flapOuter lags 15%), doveBob, flapDur prop
src/components/RsvpForm.tsx             vh-clamped rhythm → one phone screen
src/sections/CinematicInvitation.tsx    orchestrates everything (see §4 gotchas)
src/app/globals.css                     new keyframes (flapOuter, doveBob) +
                                        mobile media queries (details 2×2 grid,
                                        couple compression)
```

Legacy note (still true): OpeningScene/WaxSeal/sealTimeline/SmoothScroll/
Reveal/etc. from the earlier iteration are unused-but-compiling; safe to
delete in a cleanup commit. `AGENTS.md`/`CLAUDE.md` are stale scaffolder
artifacts.

---

## 3. Mobile rules (client-requested, verified in Messenger's webview)

The client reviews in **Messenger's in-app browser (~720–780px viewport)**
— shorter than a normal phone browser. These scenes are contractually
"one screen" there:

- **RSVP** — all vertical rhythm clamps against `vh` (`RsvpForm.tsx`).
- **Details** — 2×2 card grid + compact type via `@media (max-width:640px)`
  overrides in `globals.css` (`!important` beats the inline desktop styles).
- **Couple** — compressed header/portrait(330px)/names/vow text, same
  mechanism.

Test at **400×720** before shipping mobile changes. Butterflies are
`mix-blend-mode: screen` so they melt over light cards instead of covering
text. Headings on light scenes use `goldTextDark` (deep gold + white
edge-light) — the airy gold gradient washes out on cream.

---

## 4. Gotchas (each of these bit us this session)

1. **GSAP `clearProps: "all"` erases React inline styles.** The sections
   carry their entire layout inline. Always scope:
   `clearProps: "transform,filter,opacity"`.
2. **CSS `style.transform` on an SVG node overrides (erases) its
   `transform` attribute.** Drive SVG positioning via
   `setAttribute("transform", …)` (see grow stages / flight labels).
3. **Full-screen blur + big scale = starved rAF on weak GPUs.** The dive
   is capped (scale ≤4.2 desktop / ≤3 mobile-no-blur), and there's a
   hard state cleanup at `enter()`'s 4400ms timeout as a safety net.
4. **Race: lazy three.js vs fast click.** Ring/flight components mount
   early and catch up via a `breakingRef` if the event beat the load.
5. **Vercel prod ≠ previews.** The production domain serves `main` only.
   If a `main` push doesn't trigger a build, push an empty commit
   (`git commit --allow-empty`) — that re-fires the webhook. Messenger's
   webview caches hard: refresh button or `?v=N` to bust.
6. **Stale local server** after rebuilds serves old chunk manifests
   (400s on `_next/static` → hydration never runs). `pkill -f next-server`
   before re-testing.
7. The glide engine makes chapter-to-chapter one gesture — any scrubbed
   set-piece needs **its own intermediate stops** in `computeStops()` or
   it plays in <1s.

---

## 5. Dev & verify workflow

```bash
npm install
npm run dev
npm run lint && npm run typecheck && npm run build   # must pass before push
```

Headless verification (Playwright + preinstalled Chromium) was used for
every change: desktop 1280×800, phone 400×720 (`isMobile`), click the
seal via `button:has-text("H")`, screenshot each beat, assert no
`pageerror`. Scroll to story positions via
`story.offsetTop + frac * (offsetHeight - innerHeight)`.

Convention: Conventional-ish commits with a why-paragraph, push branch,
merge → `main` for production.

---

## 6. Open items (priority order)

1. **SECURITY — revoke the GitHub PAT.** A fine-grained token was pasted
   in chat this session and used for all pushes (it's in the chat/session
   transcript). Revoke at github.com/settings/tokens and mint fresh
   per-session tokens.
2. **RSVP backend** — still a stub; replies go nowhere. One function in
   `RsvpForm.tsx` (Resend API route or Formspree).
3. **Real-device pass** — the burst/dive/ring were tuned via the adaptive
   tier but only verified in emulation + client's iPhone reports. A
   10-minute pass on a mid-range Android would confirm the low-power
   budget (counts live in `sealBurst3D.ts`).
4. **Flight/growing-up copy** — captions ("Wild & Wonder", labels
   "Philippines · Departure") are placeholder-poetic; confirm with the
   couple.
5. ~~Cleanup commit~~ — DONE: legacy deps (tsparticles, lenis, motion,
   howler, react-hook-form, zod) are no longer in `package.json`.
6. **Optional polish** — real couple photos in the memory montage;
   contrail particles on the airliner; loading="lazy" audit for images.

---

## 7. Design language

Midnight violet (#14121e–#26243b) × champagne gold (#c9a35b / #e9d29a /
#f4e7c4), ivory, blush, and now **ethereal deep blue + lilac** (the night
sky and nebulae). Type: Pinyon Script / Cormorant Garamond / Jost caps.
Motion voice: slow luxury easings, gold light as the recurring motif —
restraint everywhere except the two deliberate spectacle moments: the
seal break, and the story's flight.
