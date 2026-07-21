/**
 * Single source of truth for all invitation content. Placeholder per
 * the reference artwork — swap these values for the real details.
 *
 * `artwork.card` / `artwork.crest`: once the real invitation renders
 * are dropped into /public/assets, set these to their paths (e.g.
 * "/assets/invitation-card.jpg"). While null, the site falls back to
 * the hand-built CSS/SVG card.
 */
export const WEDDING = {
  couple: {
    initials: ["L", "&", "H"] as const,
    names: "Luna & Helson",
    first: "Luna",
    second: "Helson",
  },
  // The celestial vow poem from the reference card.
  poem: [
    "Together with their beloved families",
    "request the honor of your presence",
    "as they unite beneath the celestial heavens",
    "to celebrate a love written among the stars.",
  ],
  intro:
    "Together with their beloved families, Luna and Helson request the honor of your presence as they unite beneath the celestial heavens — to celebrate a love written among the stars.",
  // ISO date — used for both display and the live countdown.
  dateISO: "2026-12-17T16:00:00",
  dateDisplay: "12 . 17 . 2026",
  dateLong: "Thursday, the seventeenth of December, two thousand twenty-six",
  events: [
    {
      title: "The Ceremony",
      time: "4:00 in the afternoon",
      venue: "Chapel of the Moonlit Garden",
      address: "128 Rosewood Lane, Lakeshore",
    },
    {
      title: "The Reception",
      time: "6:00 in the evening",
      venue: "The Grand Lavender Hall",
      address: "128 Rosewood Lane, Lakeshore",
    },
  ],
  artwork: {
    /** Full portrait invitation render (deckled paper, florals, crest). */
    card: "/assets/invitation-card.jpg" as string | null,
    /** Crest/monogram render, square. */
    crest: "/assets/invitation-crest.jpg" as string | null,
  },
} as const;
