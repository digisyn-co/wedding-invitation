"use client";

import { useId, useRef, useState } from "react";
import { WEDDING } from "@/lib/content";

const label = {
  fontSize: 10,
  letterSpacing: ".34em",
  textTransform: "uppercase",
  color: "#a99a80",
} as const;

/* Vertical rhythm is clamped against viewport HEIGHT so the whole
   card compresses to fit a single phone screen (in-app browsers
   included) while staying airy on desktop. */
const field = {
  marginTop: 6,
  width: "100%",
  boxSizing: "border-box",
  padding: "clamp(8px,1.4vh,14px) 4px",
  border: "none",
  borderBottom: "1px solid rgba(201,163,91,.5)",
  borderRadius: 0,
  background: "transparent",
  fontSize: "clamp(16px,2.2vh,18px)",
  fontFamily: "'Cormorant Garamond',serif",
  color: "#4a4468",
  outline: "none",
} as const;

const attendBtn = (selected: boolean) =>
  ({
    flex: 1,
    cursor: "pointer",
    padding: "clamp(10px,1.6vh,16px) 8px",
    borderRadius: 5,
    border: selected ? "1px solid rgba(169,133,63,.85)" : "1px solid rgba(201,163,91,.5)",
    background: selected ? "rgba(216,189,133,.22)" : "transparent",
    transition: "all .4s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: "clamp(15px,2vh,17px)",
    color: "#5d587a",
  }) as const;

type Status = "idle" | "sending" | "sent" | "failed";

/**
 * The RSVP concierge. Self-contained state so keystrokes never
 * re-render the scene tree. Submits to /api/rsvp (see the route for
 * the env-configured delivery providers); every state — validation,
 * sending, success, failure — is announced to screen readers via the
 * aria-live region and visually via calm, in-place transitions.
 */
export function RsvpForm() {
  const uid = useId();
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("1");
  const [attend, setAttend] = useState<"" | "joy" | "regret">("");
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<{ name?: string; attend?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (status === "sending") return;
    const e: { name?: string; attend?: string } = {};
    if (!name.trim()) e.name = "Please share your name";
    if (!attend) e.attend = "Please let us know if you can join";
    if (Object.keys(e).length) {
      setErrors(e);
      if (e.name) nameRef.current?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, attend, guests: Number(guests), dietary, message }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) throw new Error("delivery failed");
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  const successMsg =
    attend === "regret"
      ? "We will miss you dearly, but we hold you close in thought on our special day."
      : "Your reply has been received. We cannot wait to celebrate this day beside you.";

  return (
    <div
      data-reveal
      style={{
        opacity: 0,
        transform: "translateY(38px)",
        position: "relative",
        maxWidth: 600,
        margin: "0 auto",
        padding: "clamp(18px,3vh,52px) clamp(20px,5vw,64px)",
        borderRadius: 8,
        background: "linear-gradient(180deg,#fbf9f4,#f3eee7)",
        boxShadow:
          "0 40px 90px rgba(90,84,130,.22),inset 0 0 0 1px rgba(216,189,133,.4),inset 0 0 0 8px rgba(255,255,255,.55)",
      }}
    >
      {/* every state change is spoken, not just shown */}
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {status === "sending" && "Sending your reply…"}
        {status === "sent" && `Thank you. ${successMsg}`}
        {status === "failed" && "Your reply could not be sent. Please try again."}
      </div>

      {status !== "sent" ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: ".46em",
                textTransform: "uppercase",
                color: "#9b8a72",
                marginBottom: "clamp(6px,1vh,12px)",
              }}
            >
              Répondez s&apos;il vous plaît
            </div>
            <h2
              style={{
                margin: "0 0 6px",
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "clamp(28px,4.6vh,54px)",
                letterSpacing: ".02em",
                color: "#3d3860",
                lineHeight: 1.05,
              }}
            >
              Will you join us?
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "clamp(15px,2.1vh,18px)",
                color: "#7a7392",
                margin: "0 0 clamp(12px,2.4vh,32px)",
              }}
            >
              {WEDDING.rsvp.deadline}
            </p>
          </div>

          <div style={{ textAlign: "left", marginBottom: "clamp(10px,1.8vh,20px)" }}>
            <label htmlFor={`${uid}-name`} style={label}>
              Your Name
            </label>
            <input
              id={`${uid}-name`}
              ref={nameRef}
              value={name}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${uid}-name-err` : undefined}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Full name"
              style={{ ...field, display: "block" }}
            />
            {errors.name && (
              <span id={`${uid}-name-err`} role="alert" style={{ display: "block", marginTop: 6, fontSize: 12, color: "#a35454" }}>
                {errors.name}
              </span>
            )}
          </div>

          <div style={{ textAlign: "left", marginBottom: "clamp(10px,2vh,22px)" }}>
            <span style={label} id={`${uid}-attend-label`}>
              Will you attend?
            </span>
            <div role="radiogroup" aria-labelledby={`${uid}-attend-label`} style={{ display: "flex", gap: 12, marginTop: "clamp(6px,1.2vh,12px)" }}>
              <button
                type="button"
                role="radio"
                aria-checked={attend === "joy"}
                className="lux-btn"
                onClick={() => {
                  setAttend("joy");
                  setErrors((p) => ({ ...p, attend: undefined }));
                }}
                style={attendBtn(attend === "joy")}
              >
                {attend === "joy" && <span aria-hidden style={{ color: "#c9a35b" }}>✦</span>}Joyfully accepts
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={attend === "regret"}
                className="lux-btn"
                onClick={() => {
                  setAttend("regret");
                  setErrors((p) => ({ ...p, attend: undefined }));
                }}
                style={attendBtn(attend === "regret")}
              >
                {attend === "regret" && <span aria-hidden style={{ color: "#c9a35b" }}>✦</span>}Regretfully declines
              </button>
            </div>
            {errors.attend && (
              <span role="alert" style={{ display: "block", marginTop: 8, fontSize: 12, color: "#a35454" }}>
                {errors.attend}
              </span>
            )}
          </div>

          <div className="rsvp-two-col" style={{ display: "flex", gap: "clamp(14px,3vw,28px)" }}>
            <div style={{ flex: "0 0 40%", textAlign: "left", marginBottom: "clamp(8px,1.6vh,16px)" }}>
              <label htmlFor={`${uid}-guests`} style={label}>
                In your party
              </label>
              <select
                id={`${uid}-guests`}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                style={{ ...field, display: "block", padding: "clamp(7px,1.2vh,12px) 4px", fontSize: "clamp(15px,2vh,17px)" }}
              >
                {Array.from({ length: WEDDING.rsvp.maxGuests }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1} {i === 0 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, textAlign: "left", marginBottom: "clamp(8px,1.6vh,16px)" }}>
              <label htmlFor={`${uid}-dietary`} style={label}>
                Dietary notes
              </label>
              <input
                id={`${uid}-dietary`}
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Allergies, preferences…"
                style={{ ...field, display: "block", padding: "clamp(7px,1.2vh,12px) 4px", fontSize: "clamp(15px,2vh,17px)" }}
              />
            </div>
          </div>

          <div style={{ textAlign: "left", marginBottom: "clamp(12px,2.2vh,28px)" }}>
            <label htmlFor={`${uid}-message`} style={label}>
              A note to the couple
            </label>
            <textarea
              id={`${uid}-message`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={1}
              placeholder="Optional well-wishes…"
              style={{ ...field, display: "block", padding: "clamp(7px,1.2vh,12px) 4px", fontSize: "clamp(15px,2vh,17px)", resize: "none" }}
            />
          </div>

          {status === "failed" && (
            <p role="alert" style={{ margin: "0 0 clamp(10px,1.6vh,16px)", fontSize: 13, textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "#a35454" }}>
              Your reply could not be sent just now — please try once more, or reach the couple directly.
            </p>
          )}

          <button
            type="submit"
            className="lux-btn"
            disabled={status === "sending"}
            style={{
              width: "100%",
              cursor: status === "sending" ? "wait" : "pointer",
              padding: "clamp(12px,1.9vh,18px)",
              border: "none",
              borderRadius: 100,
              background: "linear-gradient(120deg,#e9d29a,#c9a35b 55%,#e9d29a)",
              backgroundSize: "200% 100%",
              color: "#5b431c",
              fontSize: 12,
              letterSpacing: ".36em",
              textTransform: "uppercase",
              fontWeight: 500,
              opacity: status === "sending" ? 0.7 : 1,
              boxShadow: "0 14px 34px rgba(201,163,91,.4)",
              animation: "shimmer 5s linear infinite",
            }}
          >
            {status === "sending" ? "Sending…" : "Send our reply"}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div
            aria-hidden
            style={{
              width: 82,
              height: 82,
              margin: "0 auto 26px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 38% 32%,#f4e6c0,#c9a35b 60%,#9a7636)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 40,
              color: "#6b4f22",
              boxShadow: "0 0 40px rgba(216,189,133,.5)",
            }}
          >
            ✦
          </div>
          <h2
            style={{
              margin: "0 0 10px",
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(36px,6vw,56px)",
              color: "#3d3860",
            }}
          >
            Thank you
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: 20,
              color: "#5d587a",
              maxWidth: "38ch",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {successMsg}
          </p>
        </div>
      )}
    </div>
  );
}
