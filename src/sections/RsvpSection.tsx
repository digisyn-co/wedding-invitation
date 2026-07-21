"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import { rsvpSchema, type RsvpInput, type RsvpValues } from "@/lib/rsvpSchema";
import { WEDDING } from "@/lib/content";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-sm border border-[color:var(--border-soft)] bg-pearl-white px-4 py-3 font-body text-sm text-body-text outline-none transition-colors placeholder:text-muted-text/70 focus:border-champagne-gold focus:ring-1 focus:ring-champagne-gold";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 font-body text-xs text-antique-gold">
      {message}
    </p>
  );
}

/**
 * The RSVP flow. React Hook Form + Zod, fully accessible (labelled
 * fields, inline errors near each field, aria wiring). Submits to a
 * stubbed async handler — wire it to an API route / form service when
 * ready. Confirmed guests see an elegant thank-you state.
 */
export function RsvpSection() {
  const [submitted, setSubmitted] = useState<RsvpValues | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RsvpInput, unknown, RsvpValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: "", email: "", guests: "1", message: "" },
    mode: "onTouched",
  });

  const attending = watch("attending");

  const onSubmit = async (values: RsvpValues) => {
    // Stub: no backend yet. Simulate a network round-trip so the
    // pending state is real. Replace with a POST to your endpoint.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitted(values);
  };

  return (
    <section id="rsvp" className="relative overflow-hidden bg-lavender-mist px-6 py-24 sm:py-28">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center">
        <SectionHeading eyebrow="with love" title="RSVP" />

        <Reveal delay={0.1} className="mt-4 w-full">
          <p className="text-center font-body text-sm text-muted-text">
            Kindly respond by the first of November, 2026.
          </p>
        </Reveal>

        <div className="mt-10 w-full">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-sm border border-[color:var(--border-soft)] bg-pearl-white px-8 py-12 text-center shadow-[0_18px_50px_rgba(83,72,120,0.12)]"
              >
                <p className="font-script text-4xl text-soft-gold">
                  {submitted.attending === "yes" ? "We can't wait" : "You'll be missed"}
                </p>
                <OrnamentDivider className="mx-auto mt-6" />
                <p className="mt-6 font-display text-lg text-body-text">
                  Thank you, {submitted.name.split(" ")[0]}.{" "}
                  {submitted.attending === "yes"
                    ? `We've saved ${submitted.guests} ${
                        submitted.guests === 1 ? "seat" : "seats"
                      } for you.`
                    : "Thank you for letting us know — you'll be in our hearts that day."}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <label htmlFor="rsvp-name" className="mb-1.5 block font-body text-xs uppercase tracking-[0.2em] text-body-text">
                    Full Name
                  </label>
                  <input
                    id="rsvp-name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    className={fieldBase}
                    {...register("name")}
                  />
                  <FieldError message={errors.name?.message} />
                </div>

                <div>
                  <label htmlFor="rsvp-email" className="mb-1.5 block font-body text-xs uppercase tracking-[0.2em] text-body-text">
                    Email
                  </label>
                  <input
                    id="rsvp-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className={fieldBase}
                    {...register("email")}
                  />
                  <FieldError message={errors.email?.message} />
                </div>

                <fieldset>
                  <legend className="mb-2 font-body text-xs uppercase tracking-[0.2em] text-body-text">
                    Will you be joining us?
                  </legend>
                  <div className="flex gap-3">
                    {(
                      [
                        { value: "yes", label: "Joyfully accepts" },
                        { value: "no", label: "Regretfully declines" },
                      ] as const
                    ).map((option) => (
                      <label
                        key={option.value}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-[color:var(--border-soft)] bg-pearl-white px-4 py-3 font-body text-sm text-body-text transition-colors has-[:checked]:border-champagne-gold has-[:checked]:bg-[color:var(--color-moon-lavender)] has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-champagne-gold"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          className="accent-[color:var(--color-soft-gold)]"
                          {...register("attending")}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  <FieldError message={errors.attending?.message} />
                </fieldset>

                <AnimatePresence initial={false}>
                  {attending === "yes" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col gap-5 overflow-hidden"
                    >
                      <div>
                        <label htmlFor="rsvp-guests" className="mb-1.5 block font-body text-xs uppercase tracking-[0.2em] text-body-text">
                          Number of Guests
                        </label>
                        <select id="rsvp-guests" className={cn(fieldBase, "appearance-none")} {...register("guests")}>
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={String(n)}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <FieldError message={errors.guests?.message} />
                      </div>

                      <div>
                        <label htmlFor="rsvp-meal" className="mb-1.5 block font-body text-xs uppercase tracking-[0.2em] text-body-text">
                          Meal Preference
                        </label>
                        <select
                          id="rsvp-meal"
                          defaultValue=""
                          aria-invalid={!!errors.meal}
                          className={cn(fieldBase, "appearance-none")}
                          {...register("meal")}
                        >
                          <option value="" disabled>
                            Please select…
                          </option>
                          <option value="standard">Standard</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="none">No meal</option>
                        </select>
                        <FieldError message={errors.meal?.message} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label htmlFor="rsvp-message" className="mb-1.5 block font-body text-xs uppercase tracking-[0.2em] text-body-text">
                    A Note for the Couple <span className="text-muted-text">(optional)</span>
                  </label>
                  <textarea
                    id="rsvp-message"
                    rows={3}
                    aria-invalid={!!errors.message}
                    className={cn(fieldBase, "resize-none")}
                    {...register("message")}
                  />
                  <FieldError message={errors.message?.message} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex items-center justify-center rounded-sm bg-gradient-to-r from-soft-gold to-antique-gold px-8 py-3.5 font-body text-sm uppercase tracking-[0.25em] text-pearl-white shadow-[0_10px_30px_rgba(184,138,74,0.35)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Sending…" : "Send RSVP"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center font-script text-2xl text-soft-gold">{WEDDING.couple.names}</p>
      </div>
    </section>
  );
}
