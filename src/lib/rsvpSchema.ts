import { z } from "zod";

/**
 * RSVP validation. `guests` comes off a <select> as a string and is
 * transformed to a number, so z.input (form values) and z.output
 * (submitted values) differ — the form is typed with both.
 */
export const rsvpSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name."),
    email: z.string().trim().email("Please enter a valid email address."),
    attending: z.enum(["yes", "no"], {
      message: "Please let us know if you can join.",
    }),
    guests: z
      .string()
      .min(1, "Please select the number of guests.")
      .transform((value) => Number.parseInt(value, 10))
      .pipe(z.number().int().min(1).max(6)),
    meal: z.enum(["standard", "vegetarian", "vegan", "none"]).optional(),
    message: z.string().trim().max(500, "Please keep it under 500 characters.").optional(),
  })
  .refine((data) => data.attending === "no" || data.meal !== undefined, {
    path: ["meal"],
    message: "Please choose a meal preference.",
  });

export type RsvpInput = z.input<typeof rsvpSchema>;
export type RsvpValues = z.output<typeof rsvpSchema>;
