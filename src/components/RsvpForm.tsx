"use client";

import { useState } from "react";

const goldText = {
  background: "linear-gradient(120deg,#e9d29a,#c9a35b,#f4e7c4)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

const label = {
  fontSize: 10,
  letterSpacing: ".34em",
  textTransform: "uppercase",
  color: "#a99a80",
} as const;

const field = {
  marginTop: 8,
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 4px",
  border: "none",
  borderBottom: "1px solid rgba(201,163,91,.5)",
  background: "transparent",
  fontSize: 18,
  fontFamily: "'Cormorant Garamond',serif",
  color: "#4a4468",
  outline: "none",
} as const;

/**
 * The RSVP card. Self-contained state so keystrokes/selection don't
 * re-render the scene tree. Mirrors the original design's form,
 * validation, and success state 1:1. Submit is a stub (no backend).
 */
export function RsvpForm() {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("1");
  const [attend, setAttend] = useState<"" | "joy" | "regret">("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; attend?: string }>({});

  const submit = () => {
    const e: { name?: string; attend?: string } = {};
    if (!name.trim()) e.name = "Please share your name";
    if (!attend) e.attend = "Please let us know if you can join";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitted(true);
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
        padding: "clamp(38px,5vw,64px)",
        borderRadius: 8,
        background: "linear-gradient(180deg,#fbf9f4,#f3eee7)",
        boxShadow:
          "0 40px 90px rgba(90,84,130,.22),inset 0 0 0 1px rgba(216,189,133,.4),inset 0 0 0 8px rgba(255,255,255,.55)",
      }}
    >
      {!submitted ? (
        <>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".56em",
                textTransform: "uppercase",
                color: "#9b8a72",
                marginBottom: 12,
              }}
            >
              Répondez s&apos;il vous plaît
            </div>
            <h2
              style={{
                margin: "0 0 8px",
                fontFamily: "'Pinyon Script',cursive",
                fontSize: "clamp(34px,8vw,76px)",
                ...goldText,
              }}
            >
              Will you join us?
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: 18,
                color: "#7a7392",
                margin: "0 0 34px",
              }}
            >
              Kindly reply on or before the 1st of November, 2026.
            </p>
          </div>

          <label style={{ display: "block", textAlign: "left", marginBottom: 20 }}>
            <span style={label}>Your Name</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Full name"
              style={field}
            />
            {errors.name && (
              <span style={{ display: "block", marginTop: 6, fontSize: 12, color: "#b06a6a" }}>
                {errors.name}
              </span>
            )}
          </label>

          <div style={{ textAlign: "left", marginBottom: 22 }}>
            <span style={label}>Will you attend?</span>
            <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
              <button
                onClick={() => {
                  setAttend("joy");
                  setErrors((p) => ({ ...p, attend: undefined }));
                }}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  padding: 16,
                  borderRadius: 5,
                  border: "1px solid rgba(201,163,91,.5)",
                  background: attend === "joy" ? "rgba(216,189,133,.22)" : "transparent",
                  transition: "all .4s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 17,
                  color: "#5d587a",
                }}
              >
                {attend === "joy" && <span style={{ color: "#c9a35b" }}>✦</span>}Joyfully accepts
              </button>
              <button
                onClick={() => {
                  setAttend("regret");
                  setErrors((p) => ({ ...p, attend: undefined }));
                }}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  padding: 16,
                  borderRadius: 5,
                  border: "1px solid rgba(201,163,91,.5)",
                  background: attend === "regret" ? "rgba(216,189,133,.22)" : "transparent",
                  transition: "all .4s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 17,
                  color: "#5d587a",
                }}
              >
                {attend === "regret" && <span style={{ color: "#c9a35b" }}>✦</span>}Regretfully
                declines
              </button>
            </div>
            {errors.attend && (
              <span style={{ display: "block", marginTop: 8, fontSize: 12, color: "#b06a6a" }}>
                {errors.attend}
              </span>
            )}
          </div>

          <label style={{ display: "block", textAlign: "left", marginBottom: 16 }}>
            <span style={label}>Number in your party</span>
            <select value={guests} onChange={(e) => setGuests(e.target.value)} style={{ ...field, padding: "12px 4px", fontSize: 17 }}>
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="3">3 guests</option>
              <option value="4">4 guests</option>
            </select>
          </label>

          <label style={{ display: "block", textAlign: "left", marginBottom: 30 }}>
            <span style={label}>A note to the couple</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Optional well-wishes…"
              style={{ ...field, padding: "12px 4px", fontSize: 17, resize: "none" }}
            />
          </label>

          <button
            onClick={submit}
            style={{
              width: "100%",
              cursor: "pointer",
              padding: 18,
              border: "none",
              borderRadius: 100,
              background: "linear-gradient(120deg,#e9d29a,#c9a35b 55%,#e9d29a)",
              backgroundSize: "200% 100%",
              color: "#5b431c",
              fontSize: 12,
              letterSpacing: ".36em",
              textTransform: "uppercase",
              fontWeight: 500,
              boxShadow: "0 14px 34px rgba(201,163,91,.4)",
              animation: "shimmer 5s linear infinite",
            }}
          >
            Send our reply
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div
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
              fontFamily: "'Pinyon Script',cursive",
              fontSize: "clamp(44px,7vw,68px)",
              ...goldText,
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
