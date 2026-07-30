# Helson & Luna — Cinematic Wedding Invitation

A couture, cinematic single-page wedding invitation: procedural WebGL
night sky, a 3D gold ring, the signature wax-seal break, a scroll-driven
love story (with a real 3D airliner crossing from the Philippines to
Perth), an engraved invitation suite, and a concierge RSVP.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v4
(tokens) · GSAP 3 + ScrollTrigger · Three.js (lazy-loaded) · WebAudio
(synthesized — no audio files).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

## Editing the wedding content

**Everything editable lives in `src/lib/content.ts`** — names, dates,
ceremony/reception times, dress code, venue + arrival guidance, story
chapters, flight labels, RSVP deadline, and photo paths. Edit that one
file; the hero, countdown, details, venue, RSVP, closing scene, and
page metadata all update together. Entries marked `[PLACEHOLDER]` are
awaiting confirmation from the couple.

## Adding the couple's photographs

Drop files into `public/assets/` and point the paths in
`WEDDING.photos` (in `src/lib/content.ts`) at them. The layouts are
final — photographs drop into place without any redesign:

| Slot             | Suggested file                 | Aspect | Minimum size |
| ---------------- | ------------------------------ | ------ | ------------ |
| `portraitFirst`  | `/assets/portrait-helson.jpg`  | 3:4    | 900×1200     |
| `portraitSecond` | `/assets/portrait-luna.jpg`    | 3:4    | 900×1200     |
| `portraitCouple` | `/assets/portrait-couple.jpg`  | 16:11  | 1520×1045    |
| `venuePhoto`     | `/assets/venue.jpg`            | 16:9   | 1600×900     |
| `montage[]`      | any 4:5 portrait crops         | 4:5    | 800×1000     |

Until real portraits arrive, the portrait plates render an engraved
ivory placeholder (initial + botanical flourish) and the montage uses
the approved invitation artwork.

## RSVP delivery (environment variables)

Replies POST to `/api/rsvp`, which delivers via whichever provider is
configured — see `.env.example`. **No secrets ever live in the client
bundle or this repository.**

- `RSVP_WEBHOOK_URL` — any JSON webhook (Formspree, Zapier, Make,
  Google Apps Script, …), or
- `RESEND_API_KEY` + `RSVP_EMAIL_TO` (+ optional `RSVP_EMAIL_FROM`) —
  emails each reply via Resend.

With neither set (local preview) replies are accepted and logged
server-side so the experience stays demonstrable. Configure the
variables in Vercel → Project → Settings → Environment Variables.

## Structure

```
src/
  app/            # layout (fonts/metadata), page, globals.css, api/rsvp
  lib/            # content.ts (ALL editable content), sealAudio.ts
  sections/       # CinematicInvitation.tsx — the orchestrator
  components/     # Preloader, backdrop, 3D ring, 3D flight, portrait
                  # plates, countdown, RSVP form, doves, emblems…
  animations/     # sealBurst3D.ts — the signature break + camera dive
scripts/
  shoot.mjs       # Playwright visual-QA harness (desktop/phone,
                  # animated + reduced-motion passes)
```

## QA harness

```bash
npm run dev &
node scripts/shoot.mjs            # all passes → /tmp/shots
MODE=reduced node scripts/shoot.mjs   # crisp reduced-motion layouts only
```

Clicks the seal, walks every scene at desktop + phone sizes, captures
each beat, and asserts no page errors.

## Notes for maintainers

- The client reviews in Messenger's in-app webview (~720px tall):
  RSVP, Details, Couple, and Hero are all composed to fit ONE screen
  at 400×720. Test there before shipping mobile changes.
- `prefers-reduced-motion` gets a designed still experience (ambient
  ephemera removed, reveals instant, glide engine off) — not a broken
  animation set.
- Gotchas that have bitten before: scope GSAP `clearProps` (never
  "all" — sections carry inline layout); drive SVG positioning via the
  `transform` attribute, not CSS; mask-revealed elements must keep a
  clip sliver ≥4% or IntersectionObserver never fires for them.
