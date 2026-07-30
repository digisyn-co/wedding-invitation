/**
 * ────────────────────────────────────────────────────────────────
 *  THE single source of truth for every editable wedding detail.
 *
 *  Names, dates, venues, story chapters, photography, and RSVP
 *  settings all live here — edit this file and the entire
 *  experience (hero, countdown, details, venue, RSVP, closing,
 *  metadata) updates together.
 *
 *  Entries marked [PLACEHOLDER] are awaiting confirmation from
 *  the couple; everything else is production copy.
 * ────────────────────────────────────────────────────────────────
 */

export const WEDDING = {
  couple: {
    /** Display order is groom & bride per the approved artwork. */
    names: "Helson & Luna",
    first: "Helson",
    second: "Luna",
    firstRole: "The Groom",
    secondRole: "The Bride",
    monogram: "H&L",
  },

  /** Canonical event date — used for display AND the live countdown. */
  date: {
    iso: "2026-12-12T15:30:00+08:00",
    display: "12 · 12 · 2026",
    long: "Saturday, the twelfth of December",
    year: "Two thousand twenty-six",
    shortLine: "12 December 2026 · Iloilo City",
  },

  /** One restrained romantic line under the hero names. */
  heroLine: "A love written among the stars",
  invitationLine: "Together with their families",

  ceremony: {
    time: "3:30 in the afternoon",
    note: "Vows & first light",
  },
  reception: {
    time: "Dinner & dancing",
    note: "To follow, till late",
  },
  dressCode: {
    title: "Formal · Lilac & Gold",
    note: "Dress to enchant",
  },

  venue: {
    name: "Diversion 21",
    city: "Iloilo City, Philippines",
    /** Editorial description under the venue name. */
    description:
      "Follow the golden path to an evening of candlelight and quiet wonder. Ceremony at half past three, followed by dinner beneath the stars.",
    /** [PLACEHOLDER] confirm arrival guidance with the couple. */
    arrivalNote:
      "Doors open at three o'clock — kindly arrive a little early to find your seat before the processional.",
    mapsUrl: "https://maps.google.com/?q=Diversion+21+Iloilo+City",
  },

  /** The couple section vow copy. */
  coupleQuote: "Woven together by destiny, and sealed in gold.",
  coupleVow:
    "Under a lilac sky they found one another — and in every quiet moment since, chose each other again. Now they invite you to witness the promise they were always meant to make.",

  /** Our Story — four chapters plus the two scroll set-pieces. */
  story: [
    {
      no: "Chapter One",
      title: "The First Glance",
      body: "A crowded room, a fleeting look — and somehow the noise softened to a hush. Neither knew it yet, but the story had already begun.",
    },
    {
      no: "Chapter Two",
      title: "A Thousand Letters",
      body: "Words became a bridge across the miles. Every note, every late-night call, drew two distant hearts a little closer to one home.",
    },
    {
      no: "Chapter Three",
      title: "The Question",
      body: "Beneath a sky spilling with stars, one knee, one ring, one breathless yes. Forever, it turned out, was simply a matter of asking.",
    },
    {
      no: "Chapter Four",
      title: "The Beginning",
      body: "And now, surrounded by the people they love most, they write the truest chapter of all — the one that never ends.",
    },
  ],

  /** [PLACEHOLDER] growing-up captions — confirm wording with the couple. */
  growingUp: ["A New Light", "First Steps", "Wild & Wonder", "Grown for Love"],

  /** [PLACEHOLDER] flight labels — confirm cities with the couple. */
  flight: {
    departure: "Philippines · Departure",
    arrival: "Perth · Australia · Arrival",
  },

  closingQuote: "And in the hush of the stars, forever began.",

  rsvp: {
    deadline: "Kindly reply on or before the 1st of November, 2026.",
    maxGuests: 4,
  },

  /**
   * Photography.
   *
   * The crest / monogram renders are real, approved artwork. The
   * portrait slots are ELEGANT PLACEHOLDERS until the couple's
   * photographs arrive — drop files into /public/assets with the
   * exact names below and set the path (they're picked up without
   * any layout change):
   *
   *   portraitFirst   →  /assets/portrait-helson.jpg   (3:4 portrait, ≥900×1200)
   *   portraitSecond  →  /assets/portrait-luna.jpg     (3:4 portrait, ≥900×1200)
   *   portraitCouple  →  /assets/portrait-couple.jpg   (16:11 landscape, ≥1520×1045)
   *   venuePhoto      →  /assets/venue.jpg             (16:9 landscape, ≥1600×900)
   */
  photos: {
    crest: "/assets/logo.webp",
    monogram: "/assets/HL.png",
    portraitFirst: null as string | null,
    portraitSecond: null as string | null,
    portraitCouple: null as string | null,
    venuePhoto: null as string | null,
  },
} as const;
