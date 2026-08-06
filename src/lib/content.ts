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
    iso: "2026-12-17T15:30:00+08:00",
    display: "12 · 17 · 2026",
    long: "Thursday, the seventeenth of December",
    year: "Two thousand twenty-six",
    shortLine: "17 December 2026 · Iloilo City",
  },

  /** One restrained romantic line under the hero names. */
  heroLine: "Eight years of love, written among the stars",
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
  coupleQuote: "Two hearts that grew up together, now sealed in gold.",
  coupleVow:
    "They met as students beneath the Iloilo sky, and across eight golden years — in every quiet moment, through every season — they chose each other, again and again. Now, with little Lyannah lighting the way, they invite you to witness the promise they were always meant to make.",

  /** Our Story — four chapters plus the two scroll set-pieces. */
  story: [
    {
      no: "Chapter One",
      title: "Where the Stars First Aligned",
      body: "In the halls of the University of Iloilo, two students crossed paths — and time, for a heartbeat, stood still. Between lectures and laughter, in glances that lingered a little too long, a quiet forever softly began.",
      photo: "/assets/story-chapter-1.jpg",
    },
    {
      no: "Chapter Two",
      title: "Eight Golden Years",
      body: "Season after season, year after luminous year, they chose each other — through every triumph, every trial, every ordinary day made extraordinary. Eight years of patient, unwavering love, waiting for its perfect moment to be sealed.",
      photo: "/assets/story-chapter-2.jpg",
    },
    {
      no: "Chapter Three",
      title: "A Blessing Arrives",
      body: "Then heaven leaned a little closer, and Lyannah arrived — a tiny heartbeat that made their love complete. Two hearts became three, and every sunrise since has felt like a gift wrapped in gold.",
      photo: "/assets/story-chapter-3.jpg",
    },
    {
      no: "Chapter Four",
      title: "A New Horizon",
      body: "Now, hand in hand — the whole family together — they take flight toward a new destination, carrying their story across the sea to begin its most beautiful chapter yet: the one that never ends.",
      photo: "/assets/story-chapter-4.jpg",
    },
  ],

  /** Growing-up captions — the golden path leading into the blessing. */
  growingUp: ["A New Light", "First Steps", "Wild & Wonder", "Our Greatest Gift"],

  /** Flight labels for the chapter 3 → 4 set-piece. */
  flight: {
    departure: "Iloilo · Philippines · Departure",
    arrival: "Perth · Australia · Arrival",
  },

  closingQuote: "Eight years, one little miracle — and in the hush of the stars, forever begins.",

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
    /**
     * The memory-montage flash frames (4:5 portrait crops). Currently
     * the approved invitation artwork renders; replace with real
     * photographs of the couple as they arrive (any count works).
     */
    montage: [
      "/assets/invitation-card.jpg",
      "/assets/invitation-crest.jpg",
      "/assets/invitation.jpg",
    ] as readonly string[],
    portraitFirst: null as string | null,
    portraitSecond: null as string | null,
    portraitCouple: null as string | null,
    venuePhoto: null as string | null,
  },
} as const;
