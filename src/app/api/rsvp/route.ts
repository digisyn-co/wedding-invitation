import { NextResponse } from "next/server";

/**
 * RSVP submission endpoint.
 *
 * Replies are delivered through ONE of two providers, both configured
 * exclusively via environment variables (never in the client bundle,
 * never in the repository — see .env.example):
 *
 *   1. RSVP_WEBHOOK_URL — any JSON webhook (Formspree endpoint,
 *      Zapier/Make hook, Google Apps Script, your own service).
 *   2. RESEND_API_KEY + RSVP_EMAIL_TO (+ optional RSVP_EMAIL_FROM) —
 *      emails each reply via the Resend REST API.
 *
 * With neither configured (local preview), the reply is accepted and
 * logged server-side so the experience remains fully demonstrable.
 */

interface RsvpPayload {
  name: string;
  attend: "joy" | "regret";
  guests: number;
  dietary: string;
  message: string;
}

function parsePayload(body: unknown): RsvpPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 160) : "";
  const attend = b.attend === "joy" || b.attend === "regret" ? b.attend : null;
  const guests = Number(b.guests);
  const dietary = typeof b.dietary === "string" ? b.dietary.trim().slice(0, 300) : "";
  const message = typeof b.message === "string" ? b.message.trim().slice(0, 1000) : "";
  if (!name || !attend || !Number.isInteger(guests) || guests < 1 || guests > 12) return null;
  return { name, attend, guests, dietary, message };
}

export async function POST(req: Request) {
  let payload: RsvpPayload | null = null;
  try {
    payload = parsePayload(await req.json());
  } catch {
    payload = null;
  }
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid reply." }, { status: 400 });
  }

  const record = {
    ...payload,
    attending: payload.attend === "joy",
    receivedAt: new Date().toISOString(),
    source: "wedding-invitation",
  };

  try {
    const webhook = process.env.RSVP_WEBHOOK_URL;
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      return NextResponse.json({ ok: true });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.RSVP_EMAIL_TO;
    if (resendKey && emailTo) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: process.env.RSVP_EMAIL_FROM ?? "RSVP <onboarding@resend.dev>",
          to: [emailTo],
          subject: `RSVP — ${record.name} ${record.attending ? "joyfully accepts" : "regretfully declines"}`,
          text: [
            `Name: ${record.name}`,
            `Attending: ${record.attending ? "Yes" : "No"}`,
            `Guests: ${record.guests}`,
            `Dietary notes: ${record.dietary || "—"}`,
            `Message: ${record.message || "—"}`,
            `Received: ${record.receivedAt}`,
          ].join("\n"),
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return NextResponse.json({ ok: true });
    }

    // No provider configured — accept and log (local preview mode).
    console.warn("[rsvp] No RSVP_WEBHOOK_URL or RESEND_API_KEY configured; reply logged only:", record);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[rsvp] Delivery failed:", err);
    return NextResponse.json(
      { ok: false, error: "We could not record your reply just now." },
      { status: 502 },
    );
  }
}
