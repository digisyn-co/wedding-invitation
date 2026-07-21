/**
 * Single source of truth for all invitation content. Everything here
 * is placeholder per the reference image — swap these values for the
 * real details and the whole site updates.
 */
export const WEDDING = {
  couple: {
    initials: ["H", "&", "L"] as const,
    names: "Helson & Luna",
    first: "Helson",
    second: "Luna",
  },
  tagline: ["Two souls, one promise,", "a journey of love, grace,", "and endless beginnings."],
  intro:
    "Together with their families, Helson and Luna request the honour of your presence as they exchange vows and begin their forever.",
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
} as const;
