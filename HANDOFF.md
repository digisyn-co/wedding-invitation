# Helson & Luna — Wedding Invitation Website · Handoff

**Repo:** `github.com/digisyn-co/wedding-invitation` (private) · branch `main`
**Stack:** Next.js 15.5 (App Router) · React 19 · TypeScript · Tailwind CSS v4 (tokens only — the experience is inline-styled + hand-rolled CSS keyframes)
**Status:** Feature-complete single-page experience. Builds clean (`lint`, `typecheck`, `build` all pass). **Not yet deployed** — Vercel import is the next step.

---

## 1. What this is

A cinematic, luxury single-page wedding invitation. The guest clicks a wax
seal, the screen erupts in gold, and the invitation unfolds as a sequence of
full-screen scenes navigated one gesture at a time. All motion is hand-built
CSS/SVG — no animation libraries are actually exercised at runtime, no video
files, no external requests except Google's YouTube embed on the first
screen and self-hosted fonts.

### The experience, scene by scene

| # | Scene | What happens |
|---|-------|--------------|
| 0 | **Arrival** (fixed overlay) | Muted looping YouTube video behind a twilight scrim, the H&L crest, a glowing wax seal, "Click the Seal to Begin". |
| 1 | **Seal break** | Golden flash + full-viewport pixie-dust explosion (110 motes, 2 waves, veil, shockwave rings) + two realistic SVG doves ascending over a flashing memory montage; page unlocks. |
| 2 | **Hero** `#hero` | Crest, shimmering "Helson & Luna", date, live countdown, falling petals. |
| 3 | **Couple** `#couple` | "Woven together by destiny…" + the **tracking shot**: side-view Helson & Luna running hand-in-hand toward a glowing arch — run cycle, streaming veil, scrolling parallax hills, wind streaks. |
| 4 | **Our Story** `#story` | 520vh sticky cinematic scroll. Four chapters, each an **engraved-gold emblem that draws itself** (swans / letter in flight / solitaire / interlocked rings) with a light bead traveling the line. |
| 5 | **Details** `#details` | Four lux cards (date, ceremony, reception, dress code) that lift on hover. |
| 6 | **Venue** `#venue` | Diversion 21, Iloilo City + animated golden-path map + Maps link. |
| 7 | **RSVP** `#rsvp` | Name / attend / party size / note. Validation + success state. **Submit is a stub** (see §5). |
| 8 | **Closing** | Starfield, fireflies, the quote, shimmering names. |

Global layers: silk background, mouse-follow gold light, butterflies after
entry, gold scrollbar, section-arrival bloom, soft gradient "bridges"
between scenes.

### Navigation model — the glide engine

`CinematicInvitation.tsx` owns scrolling. Every wheel tick / swipe / arrow
key = **exactly one stop** (950ms ease-in-out glide). Stops = each scene top
+ the four story-chapter centers + intermediate stops inside scenes taller
than the viewport. Recomputed per gesture (resize/anchor-safe). 350ms
momentum cooldown. Fully disabled under `prefers-reduced-motion` (falls
back to native scroll). Typing in form fields is never intercepted.

---

## 2. Repo map (the files that matter)

```
src/
  app/
    layout.tsx            fonts (@fontsource, self-hosted), metadata, favicon
    globals.css           design tokens + ALL keyframes & interaction classes
    page.tsx              renders <CinematicInvitation/>
  sections/
    CinematicInvitation.tsx   ~90% of the page: every scene's markup, the
                              seal-break sequence, reveal observer, story
                              scroller, glide engine, burst layer
  components/
    RunningCouple.tsx     side-view run-cycle couple (couple scene)
    EtherealScene.tsx     the tracking-shot world (hills, moon, arch, streaks)
    StoryEmblem.tsx       self-drawing gold line-art per story chapter
    Dove.tsx              realistic layered-feather dove (seal break)
    AnimatedCharacter.tsx front-facing chibi couple (memory montage only)
    HeroCountdown.tsx     isolated 1s-tick countdown
    RsvpForm.tsx          isolated RSVP state machine
public/assets/
  logo.webp               transparent H&L crest (arrival, hero, favicon)
  silk.jpg                fixed silk backdrop
  invitation-card.jpg / invitation-crest.jpg / invitation.jpg  (from the
                          earlier design iteration; kept as spare art)
```

**Legacy note:** `src/components/` and `src/sections/` also contain files
from the earlier "lavender milestone" build (SmoothScroll, Reveal,
PaperTexture, GoldFrame, FloralWreath, WaxSeal, sealTimeline, the old
section files, `lib/content.ts`, `lib/rsvpSchema.ts`, hooks). They are
**unused by the current page** but still compile; safe to delete in a
cleanup commit. Same for the installed-but-unused deps (gsap, motion,
lenis, tsparticles, howler, react-hook-form, zod — only the fonts,
clsx/tailwind-merge remain in use).

`AGENTS.md` / `CLAUDE.md` in the root are stale scaffolder artifacts
(they reference docs that don't exist); ignore or delete.

---

## 3. Editing content (the 5-minute changes)

- **Names / monogram text:** search `CinematicInvitation.tsx` for
  `Helson` — hero `<h1>`, nav brand, seal "H&L", closing. The crest image
  itself is baked art (`logo.webp`) — regenerate to change.
- **Date:** `DETAILS` array + hero date row + closing line in
  `CinematicInvitation.tsx`; countdown target in `HeroCountdown.tsx`
  (`2026-12-12T15:30:00+08:00`).
- **Story text:** `STORY` array. Chapter *art* lives in `StoryEmblem.tsx`.
- **Venue:** the `#venue` section (name, city, blurb, Maps URL).
- **Landing video:** the YouTube iframe `src` in the arrival scene — swap
  both the embed id and the `playlist=` id (that's what makes it loop).
- **RSVP deadline / options:** `RsvpForm.tsx`.
- **Palette / motion:** every keyframe and interaction class is in
  `globals.css`, commented by system.

---

## 4. Dev workflow

```bash
npm install
npm run dev          # local dev
npm run lint && npm run typecheck && npm run build   # must all pass before push
```

Conventional Commits, small focused commits, push to `main` after every
change (project convention). Screenshots were verified with Playwright
(Chromium preinstalled in the build sandbox) — mobile checked at 390px
(no horizontal overflow anywhere).

---

## 5. Open items (in priority order)

1. **SECURITY — revoke the GitHub PAT.** A classic token
   (`wedding-invitation-push`) was pasted in chat during development and
   used for pushes. It is still active. Revoke at
   github.com/settings/tokens; mint fresh short-lived tokens per push
   session, or wire proper deploy auth.
2. **Deploy to Vercel.** Import the repo at vercel.com/new — zero config
   needed (`next build` defaults). Nothing motion-critical can be judged
   from screenshots; the glide, shimmer, and burst need a real device.
   The YouTube backdrop only plays on a real network (the dev sandbox
   couldn't reach YouTube; the twilight scrim is the graceful fallback).
3. **RSVP backend.** `RsvpForm.submit()` is a stub — replies go nowhere.
   Quickest paths: a Next API route emailing via Resend, or Formspree.
   The form state is already isolated, so it's a one-function change.
4. **Feel-test trackpad momentum.** The glide engine's 350ms cooldown
   handles synthetic input perfectly; strong real-world trackpad flicks
   may need that number tuned (single constant in the glide engine).
5. **Optional polish backlog:** real couple photos in the memory montage,
   an ambient audio track on seal-click (autoplay rules require the
   gesture anyway), articulated knees on the run cycle, cleanup commit
   for the legacy files/deps in §2, `npm audit` pass (2 moderate
   advisories in dev deps).

---

## 6. Design language (for whoever continues)

Midnight violet (#14121e–#26243b) against champagne gold
(#c9a35b / #e9d29a / #f4e7c4), ivory (#f6eee6) and blush (#f2d8d7).
Type: Pinyon Script (grand script), Cormorant Garamond (serif),
Jost (letterspaced caps). Fonts self-hosted via @fontsource — no Google
CDN at runtime. The motion voice: slow luxury easings
(`cubic-bezier(.19,1,.22,1)` family), gold light as the recurring motif
(shimmer, beads, blooms, dust), restraint over spectacle everywhere
except the seal break — the one deliberate fireworks moment.
```
