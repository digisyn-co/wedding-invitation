# Helson & Luna — Cinematic Wedding Invitation

A luxury, cinematic digital wedding invitation. Milestone 1 delivers the
opening experience: the ambient scene, the signature wax-seal break, and
the invitation reveal.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP ·
Motion (Framer Motion) · tsParticles · Howler.js — see the brief for the
full intended stack (Three.js/R3F, Lenis, RHF+Zod, Playwright/Vitest are
installed/ready but not yet wired into a feature).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Structure

```
src/
  app/            # App Router entry (layout, page, globals.css)
  components/     # Presentational building blocks (WaxSeal, GoldFrame,
                  # FloralWreath, ParticleField, MoonlightGlow, SoundToggle)
  sections/       # Page sections (OpeningScene, InvitationReveal)
  animations/     # Orchestration logic (sealTimeline.ts — the GSAP
                  # timeline that drives the whole break/open sequence)
  hooks/          # useReducedMotion, useSound
  lib/            # Shared utilities (cn helper)
public/
  assets/         # Static images (empty — add real photos here)
  sounds/         # Ambient score (empty — see Audio below)
```

## What's built (Milestone 1)

- Dark ambient opening scene: drifting particles, moonlight glow, envelope
  with ribbon and wax seal, "Click the Wax Seal" prompt.
- The signature interaction: compress → crack → wax shards + gold dust
  burst → seal falls away → ribbon unties → envelope opens → invitation
  rises and unfolds → florals bloom → gold foil catches the light →
  camera pushes in → monogram reveals letter by letter.
- Invitation content: "H & L" monogram, foil-gradient couple names, tagline,
  date — all placeholder copy per the reference image (Helson & Luna,
  12.17.2026), styled in a lavender/gold/blush palette pulled from it.
- Respects `prefers-reduced-motion` (skips straight to a simple-fade
  revealed state) and is responsive down to small phones.

Fonts are self-hosted via `@fontsource` (Cormorant Garamond, Parisienne,
Jost) rather than `next/font/google`, so the build has no dependency on
reaching Google's font CDN.

## Known gaps / next milestones

- **Real content**: swap the placeholder names/date/tagline in
  `src/sections/InvitationReveal.tsx`.
- **Audio**: `useSound` is wired up but ships with no track. Drop an
  ambient/orchestral loop into `public/sounds/` and pass its path into
  `useSound()` in `OpeningScene.tsx`.
- **Florals/seal emblem** are stylized SVG (paper-cut roses, engraved
  sprig) rather than photoreal — matches the "handmade" direction but can
  be swapped for illustrated/photo assets in `public/assets/` if you want
  to get closer to the reference photo.
- **Gold frame corners** are subtle at small sizes — worth a contrast pass.
- **RSVP flow, event details, gallery, countdown** — not started; the
  `sections/` and `animations/` folders are set up to take them.
- **Lenis smooth scroll** and **Three.js/R3F** are installed but unused —
  intended for a scroll-driven section once there's more than one screen.
- **Tests**: Playwright/Vitest aren't set up yet; add as features solidify
  rather than testing placeholder content.

## Git / deploy

This folder has a fresh local git repo (from `create-next-app`) with no
commits yet. Suggested first commit:

```bash
git add -A
git commit -m "feat: opening scene and signature wax-seal interaction"
```

Push to GitHub, then import into Vercel — no special build config needed
(`next build` / `next start` are the defaults).
