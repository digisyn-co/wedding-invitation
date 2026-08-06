"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { playSealBurst3D, playCameraDive } from "@/animations/sealBurst3D";

gsap.registerPlugin(ScrollTrigger);
import { CinematicPreloader } from "@/components/CinematicPreloader";
import { GoldenCenterpiece } from "@/components/GoldenCenterpiece";
import { EtherealBackdrop } from "@/components/EtherealBackdrop";
import { StoryFlight3D, type StoryFlightHandle } from "@/components/StoryFlight3D";
import { WeddingRing3D } from "@/components/WeddingRing3D";
import { unlock, setMuted, playSwell } from "@/lib/sealAudio";
import { WEDDING } from "@/lib/content";
import { EtherealScene } from "@/components/EtherealScene";
import { StoryEmblem } from "@/components/StoryEmblem";
import { HeroCountdown } from "@/components/HeroCountdown";
import { RsvpForm } from "@/components/RsvpForm";
import { PortraitFrame } from "@/components/PortraitFrame";
import { Dove } from "@/components/Dove";

/* Ported 1:1 from the approved "Helson & Luna" cinematic design.
   Static markup + inline styles reproduce it pixel-for-pixel; the
   original DCLogic runtime is reimplemented with React refs/effects. */

const goldText: CSSProperties = {
  background: "linear-gradient(120deg,#e9d29a 0%,#c9a35b 42%,#f4e7c4 62%,#c9a35b 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
};


interface Dust { top: string; left: string; size: string; o: string; dy: string; dx: string; dur: string; delay: string }
interface Spark { top: string; left: string; size: string; dur: string; delay: string }
interface Star { top: string; left: string; size: string; dur: string; delay: string }
interface Fly { top: string; left: string; fx: string; fy: string; dur: string; delay: string }
interface Bfly { top: string; left: string; fx: string; fy: string; fr: string; scale: string; dur: string; delay: string; flap: string }
interface Particles { dust: Dust[]; sparkles: Spark[]; stars: Star[]; fireflies: Fly[]; butterflies: Bfly[] }
interface SealBurst { x: number; y: number; r: number }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const STORY = WEDDING.story.map((c, i) => ({ i, slot: `story-${i + 1}`, ...c, photo: c.photo as string | undefined }));

/* The invitation suite — rendered as engraved editorial columns, not
   dashboard cards. Icons are fine hairline SVG engravings (see
   DetailIcon) rather than glyph characters. */
const DETAILS = [
  { icon: "date", label: "The Date", title: "December 17", sub: "Thursday, 2026", delay: 120 },
  { icon: "ceremony", label: "Ceremony", title: WEDDING.ceremony.time, sub: WEDDING.ceremony.note, delay: 220 },
  { icon: "reception", label: "Reception", title: WEDDING.reception.time, sub: WEDDING.reception.note, delay: 320 },
  { icon: "attire", label: "Dress Code", title: WEDDING.dressCode.title, sub: WEDDING.dressCode.note, delay: 420 },
] as const;

/* Engraved-style hairline icons for the invitation suite — drawn, not
   typed, so they render identically on every platform. */
function DetailIcon({ kind }: { kind: "date" | "ceremony" | "reception" | "attire" }) {
  const common = { fill: "none", stroke: "#a9853f", strokeWidth: 1.1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 44 44" width="34" height="34" aria-hidden="true" style={{ display: "block", margin: "0 auto" }}>
      {kind === "date" && (
        <g {...common}>
          <rect x="8" y="11" width="28" height="25" rx="2" />
          <path d="M8 18 H36 M15 7 v7 M29 7 v7" />
          <path d="M22 24 l2.2 4.4 4.8.6-3.5 3.3.9 4.7-4.4-2.4-4.4 2.4.9-4.7-3.5-3.3 4.8-.6Z" strokeWidth={0.9} />
        </g>
      )}
      {kind === "ceremony" && (
        <g {...common}>
          <path d="M22 6 C 15 13 13 19 13 25 a9 9 0 0 0 18 0 C 31 19 29 13 22 6 Z" />
          <path d="M22 38 v-8 M17 38 h10" />
        </g>
      )}
      {kind === "reception" && (
        <g {...common}>
          <path d="M14 7 c0 7 3 10 8 10 s8 -3 8 -10" />
          <path d="M14 7 h16 M22 17 v14 M16 36 c2 -3 10 -3 12 0" />
        </g>
      )}
      {kind === "attire" && (
        <g {...common}>
          <path d="M22 10 a3 3 0 1 0 -.01 0 Z" />
          <path d="M22 13 c-6 4 -8 9 -8 14 l4 9 h8 l4 -9 c0 -5 -2 -10 -8 -14 Z" />
          <path d="M17 20 c3 2 7 2 10 0" strokeWidth={0.9} />
        </g>
      )}
    </svg>
  );
}

/* Memory-montage frames: the flash of "photographs" during the seal
   transition. Sourced from WEDDING.photos.montage (real artwork now,
   real photos later) — rotation/delay choreography stays here. */
const MEMORY_POSES = ["-6deg", "5deg", "-3deg", "7deg", "-5deg"] as const;
const MEMORIES = WEDDING.photos.montage.map((src, i) => ({
  slot: `memory-${i + 1}`,
  src,
  r: MEMORY_POSES[i % MEMORY_POSES.length],
  delay: `${(i * 0.34).toFixed(2)}s`,
}));

// Petals drifting through the hero — deterministic (SSR-safe).
const HERO_PETALS = [
  { left: "8%", c: "#f2d8d7", s: 11, dur: "13s", delay: "0s", px: "60px", pr: "320deg" },
  { left: "22%", c: "#e9d29a", s: 8, dur: "16s", delay: "4s", px: "-40px", pr: "-280deg" },
  { left: "38%", c: "#f6eee6", s: 10, dur: "14s", delay: "8s", px: "50px", pr: "300deg" },
  { left: "55%", c: "#ebcfcf", s: 9, dur: "17s", delay: "2s", px: "-56px", pr: "-340deg" },
  { left: "70%", c: "#f2d8d7", s: 12, dur: "12s", delay: "6s", px: "44px", pr: "260deg" },
  { left: "84%", c: "#e9d29a", s: 8, dur: "15s", delay: "10s", px: "-38px", pr: "-300deg" },
  { left: "93%", c: "#f6eee6", s: 10, dur: "18s", delay: "1s", px: "36px", pr: "280deg" },
];

export function CinematicInvitation() {
  const [fx, setFx] = useState<Particles | null>(null);
  const [burst, setBurst] = useState<SealBurst | null>(null);
  const [booted, setBooted] = useState(false);
  const [sceneEntered, setSceneEntered] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [ringBreak, setRingBreak] = useState(false);
  // Ambient backdrop: a lightweight WebGL night sky (all devices) —
  // unmounted shortly after the seal breaks to hand its frames to
  // the burst and dive.
  const [showBackdrop, setShowBackdrop] = useState(true);

  const lightRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const butterRef = useRef<HTMLDivElement>(null);
  const montageRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const fxLayerRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const growFxRef = useRef<HTMLDivElement>(null);
  const flightFxRef = useRef<HTMLDivElement>(null);
  const storyFlightRef = useRef<StoryFlightHandle>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const opening = useRef(false);
  const entered = useRef(false);

  // Random particle fields — generated on the client only (avoids SSR
  // hydration mismatch; the opaque arrival overlay hides the first paint).
  useEffect(() => {
    setFx({
      dust: Array.from({ length: 24 }, () => ({
        top: rnd(60, 100).toFixed(0) + "%", left: rnd(0, 100).toFixed(0) + "%",
        size: rnd(2, 5).toFixed(1) + "px", o: rnd(0.3, 0.9).toFixed(2),
        dy: "-" + rnd(160, 420).toFixed(0) + "px", dx: rnd(-40, 40).toFixed(0) + "px",
        dur: rnd(9, 19).toFixed(1) + "s", delay: rnd(0, 8).toFixed(1) + "s",
      })),
      sparkles: Array.from({ length: 14 }, () => ({
        top: rnd(0, 90).toFixed(0) + "%", left: rnd(0, 100).toFixed(0) + "%",
        size: rnd(4, 10).toFixed(1) + "px", dur: rnd(2.8, 6.2).toFixed(1) + "s", delay: rnd(0, 5).toFixed(1) + "s",
      })),
      stars: Array.from({ length: 44 }, () => ({
        top: rnd(0, 80).toFixed(0) + "%", left: rnd(0, 100).toFixed(0) + "%",
        size: rnd(1, 3.4).toFixed(1) + "px", dur: rnd(2.4, 6).toFixed(1) + "s", delay: rnd(0, 4).toFixed(1) + "s",
      })),
      fireflies: Array.from({ length: 8 }, () => ({
        top: rnd(30, 85).toFixed(0) + "%", left: rnd(0, 100).toFixed(0) + "%",
        fx: rnd(-80, 80).toFixed(0) + "px", fy: "-" + rnd(80, 240).toFixed(0) + "px",
        dur: rnd(7, 14).toFixed(1) + "s", delay: rnd(0, 8).toFixed(1) + "s",
      })),
      butterflies: Array.from({ length: 9 }, () => ({
        top: rnd(20, 80).toFixed(0) + "%", left: rnd(0, 90).toFixed(0) + "%",
        fx: rnd(-40, 220).toFixed(0) + "px", fy: "-" + rnd(160, 420).toFixed(0) + "px",
        fr: rnd(-20, 20).toFixed(0) + "deg", scale: rnd(0.55, 1.25).toFixed(2),
        dur: rnd(9, 18).toFixed(1) + "s", delay: rnd(0, 7).toFixed(1) + "s", flap: rnd(0.24, 0.46).toFixed(2) + "s",
      })),
    });
  }, []);

  // Lifecycle: scroll lock, reveals, mouse-light, cinematic story scroll.
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const ease = "cubic-bezier(.19,1,.22,1)";
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          // Mask-revealed elements are clipped to a sliver, so their
          // intersection RATIO can never reach the normal threshold —
          // any visibility is enough for them (see clip note below).
          const need = el.getAttribute("data-reveal-style") === "mask" ? 0.01 : 0.14;
          if (e.intersectionRatio < need) return;
          const dl = el.getAttribute("data-reveal-delay") || "0";
          el.style.transition = `opacity 2.4s ${ease} ${dl}ms, transform 2.6s ${ease} ${dl}ms, filter 2.2s ease ${dl}ms, clip-path 2.2s ${ease} ${dl}ms`;
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.filter = "blur(0)";
          if (el.getAttribute("data-reveal-style") === "mask")
            el.style.clipPath = "inset(0 0 0 0)"; // gold-curtain wipe
          io.unobserve(el);
        });
      },
      { threshold: [0.01, 0.14], rootMargin: "0px 0px -10% 0px" },
    );
    const reducedReveal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-obs])").forEach((el) => {
        el.setAttribute("data-obs", "1");
        // Reduced motion: content is simply present — no observers,
        // no entrance choreography, nothing withheld from the reader.
        if (reducedReveal) {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.filter = "none";
          el.style.clipPath = "none";
          return;
        }
        el.style.filter = "blur(7px)";
        // Each reveal style is a different curtain: flip rises out of
        // perspective, mask wipes open, default drifts up from below.
        const styleType = el.getAttribute("data-reveal-style");
        if (styleType === "flip") {
          el.style.transform = "perspective(900px) translateY(58px) rotateX(24deg) scale(.96)";
        } else if (styleType === "mask") {
          el.style.transform = "translateY(26px)";
          // NOT 100%: a fully-clipped element reports a zero-area
          // intersection, so the observer would never fire for it.
          // The 4% sliver is invisible anyway under opacity 0 + blur.
          el.style.clipPath = "inset(0 96% 0 0)";
        } else {
          el.style.transform = "translateY(58px) scale(.965)";
        }
        io.observe(el);
      });
    });

    // Section-arrival bloom: toggle .sect-active as each snap section
    // enters, so the gold light-bloom re-runs every time you scroll to it.
    const sectIO = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("sect-active");
          else e.target.classList.remove("sect-active");
        });
      },
      { threshold: 0.4 },
    );
    document.querySelectorAll(".snap-sect").forEach((s) => sectIO.observe(s));

    const mm = (ev: MouseEvent) => {
      const l = lightRef.current;
      if (!l) return;
      const x = (ev.clientX / window.innerWidth) * 100;
      const y = (ev.clientY / window.innerHeight) * 100;
      l.style.background = `radial-gradient(680px circle at ${x}% ${y}%, rgba(215,189,133,.10), transparent 60%)`;
    };
    window.addEventListener("mousemove", mm);

    const reducedFx = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const storyScroll = () => {
      const sec = storyRef.current;
      if (!sec) return;
      const vh = window.innerHeight;
      const total = sec.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-sec.getBoundingClientRect().top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const els = sec.querySelectorAll<HTMLElement>("[data-ch]");
      const n = els.length || 4;
      const pos = p * n;
      // While a between-chapter set-piece (growing-up / flight) holds
      // the stage, chapter text yields — dimmed so the story beat is
      // unmistakably the subject.
      const growT = Math.min(Math.max((pos - 1.5) / 1.0, 0), 1);
      const flightT = Math.min(Math.max((pos - 2.5) / 1.0, 0), 1);
      const setpiece = Math.max(
        growT > 0 && growT < 1 ? Math.sin(Math.PI * growT) : 0,
        flightT > 0 && flightT < 1 ? Math.sin(Math.PI * flightT) : 0,
      );
      const yield_ = 1 - 0.8 * setpiece;
      els.forEach((el, i) => {
        const d = pos - 0.5 - i;
        const dist = Math.abs(d);
        const op = Math.max(0, 1 - dist * 1.35) * yield_;
        el.style.opacity = op.toFixed(3);
        el.style.transform = `translate(-50%,-50%) translateY(${(d * -64).toFixed(1)}px) scale(${(1 - Math.min(dist, 1) * 0.12).toFixed(3)})`;
        el.style.filter = `blur(${(Math.min(dist, 1) * 9).toFixed(2)}px)`;
        el.style.zIndex = op > 0.5 ? "3" : "1";
        el.style.pointerEvents = op > 0.6 ? "auto" : "none";
        // Drives the engraved-gold emblem: draws itself when its
        // chapter takes center stage, resets when it leaves.
        el.classList.toggle("ch-active", op > 0.55);
      });
      if (progRef.current) progRef.current.style.height = (p * 100).toFixed(1) + "%";
      if (counterRef.current) counterRef.current.textContent = ("0" + Math.min(n, Math.max(1, Math.floor(pos) + 1))).slice(-2);

      // ── Chapter-transition set-pieces, scrubbed by the same scroll ──
      // Chapters sit centered at pos = i + 0.5, so the gap between
      // chapter k and k+1 spans pos k+0.6 … k+1.4 — exactly where the
      // outgoing text has faded and the stage is empty.
      const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
      const bell = (t: number) => Math.sin(Math.PI * t);

      const grow = growFxRef.current;
      if (grow && !reducedFx) {
        const t = clamp01((pos - 1.5) / 1.0); // the FULL ch2→ch3 gap — a story beat of its own
        const go = Math.min(clamp01((t - 0.04) / 0.08), clamp01((1 - t) / 0.08));
        grow.style.opacity = t > 0 && t < 1 ? go.toFixed(3) : "0";
        const path = grow.querySelector<SVGPathElement>("[data-grow-path]");
        if (path) path.style.strokeDashoffset = String(1 - t);
        const caps = grow.querySelectorAll<SVGTextElement>("[data-grow-cap]");
        grow.querySelectorAll<SVGGElement>("[data-grow-stage]").forEach((g, k) => {
          // one life stage per scroll beat: stage k owns t ∈ [k/4.6, …]
          const st = clamp01(t * 4.6 - k - 0.15);
          g.style.opacity = st.toFixed(3);
          // position via the SVG transform ATTRIBUTE — a CSS transform
          // would override (and erase) each stage's base placement
          const bx = g.getAttribute("data-bx") ?? "0";
          const by = Number(g.getAttribute("data-by") ?? 0);
          g.setAttribute("transform", `translate(${bx} ${(by + (1 - st) * 14).toFixed(1)})`);
          const cap = caps[k];
          if (cap) cap.style.opacity = (st * 0.85).toFixed(3);
        });
      }

      const flight = flightFxRef.current;
      if (flight && !reducedFx) {
        const t = clamp01((pos - 2.5) / 1.0); // the FULL ch3→ch4 gap — the journey itself
        // fade the edges only — the flight owns the whole gap
        const fo = Math.min(clamp01(t / 0.08), clamp01((1 - t) / 0.06));
        flight.style.opacity = t > 0 && t < 1 ? fo.toFixed(3) : "0";
        if (t >= 0 && t <= 1) {
          storyFlightRef.current?.update(t);
          const la = flight.querySelector<HTMLElement>("[data-flight-label-a]");
          const lb = flight.querySelector<HTMLElement>("[data-flight-label-b]");
          if (la) la.style.opacity = String(bell(clamp01(t / 0.3)) * 0.9); // departure card
          if (lb) lb.style.opacity = String(clamp01((t - 0.74) / 0.14) * 0.9); // arrival card
        }
      }
    };
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; storyScroll(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    storyScroll();

    // ── The glide engine: one gesture = one scene ──────────────────
    // Wheel / swipe / keys are quantized into single steps between
    // "stops": each scene top, the four story-chapter centers, and
    // intermediate stops inside any scene taller than the viewport
    // (so nothing becomes unreachable on small screens). Each step
    // glides there over ~950ms with a cinematic ease; native scrolling
    // is suppressed. Recomputed per gesture, so it survives resizes
    // and anchor jumps. Disabled under prefers-reduced-motion.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let gliding = false;
    let cooldownUntil = 0;
    let touchStartY: number | null = null;

    const computeStops = () => {
      const vh = window.innerHeight;
      const maxY = Math.max(0, document.documentElement.scrollHeight - vh);
      const stops = new Set<number>();
      document.querySelectorAll<HTMLElement>(".snap-sect").forEach((el) => {
        const top = Math.min(el.offsetTop, maxY);
        stops.add(top);
        let off = 0;
        while (el.offsetHeight - off > vh * 1.15) {
          off += vh * 0.85;
          stops.add(Math.min(top + off, maxY));
        }
      });
      const story = storyRef.current;
      if (story) {
        const t = story.offsetTop;
        const total = story.offsetHeight - vh;
        for (let k = 0; k < 4; k++) stops.add(Math.min(t + ((k + 0.5) / 4) * total, maxY));
        // The growing-up sequence (ch2→3) and the flight (ch3→4) are
        // stories of their own: intermediate stops so each wheel
        // gesture advances one beat instead of skipping the whole arc.
        [1.75, 2.0, 2.25, 2.75, 3.0, 3.25].forEach((pp) =>
          stops.add(Math.min(t + (pp / 4) * total, maxY)),
        );
      }
      return [...stops].sort((a, b) => a - b);
    };

    const glide = (target: number) => {
      gliding = true;
      const start = window.scrollY;
      const dist = target - start;
      const t0 = performance.now();
      const D = 950;
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const frame = (now: number) => {
        const p = Math.min(1, (now - t0) / D);
        window.scrollTo({ top: start + dist * ease(p), behavior: "instant" as ScrollBehavior });
        if (p < 1) requestAnimationFrame(frame);
        else {
          gliding = false;
          cooldownUntil = performance.now() + 350;
        }
      };
      requestAnimationFrame(frame);
    };

    const stepScene = (dir: 1 | -1) => {
      const cur = window.scrollY;
      const stops = computeStops();
      const target =
        dir > 0 ? stops.find((s) => s > cur + 24) : [...stops].reverse().find((s) => s < cur - 24);
      if (target !== undefined) glide(target);
    };

    const gestureBlocked = () =>
      gliding || performance.now() < cooldownUntil || document.body.style.overflow === "hidden";

    const onWheel = (e: WheelEvent) => {
      if (reducedMotion) return;
      e.preventDefault();
      if (gestureBlocked() || Math.abs(e.deltaY) < 4) return;
      stepScene(e.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input,textarea,select")) return; // typing/keyboard — never trap
      if (!reducedMotion && document.body.style.overflow !== "hidden") e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (reducedMotion || touchStartY === null) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      touchStartY = null;
      if (gestureBlocked() || Math.abs(dy) < 50) return;
      stepScene(dy > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (reducedMotion) return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input,textarea,select")) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        if (!gestureBlocked()) stepScene(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        if (!gestureBlocked()) stepScene(-1);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(obs);
      io.disconnect();
      sectIO.disconnect();
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  // Scroll storytelling: sections don't just arrive — they LEAVE.
  // As each scene scrolls past, it drifts up, softens, and dims
  // (scrubbed, so it tracks the finger/wheel), which makes the next
  // scene feel like it emerges through the last one's afterglow.
  useEffect(() => {
    if (!sceneEntered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tweens: gsap.core.Tween[] = [];
    document.querySelectorAll<HTMLElement>(".snap-sect").forEach((sec) => {
      tweens.push(
        gsap.fromTo(
          sec,
          { opacity: 1, yPercent: 0, filter: "blur(0px)" },
          {
            opacity: 0.28,
            yPercent: -7,
            filter: "blur(5px)",
            ease: "none",
            scrollTrigger: { trigger: sec, start: "bottom 60%", end: "bottom 8%", scrub: 0.8 },
          },
        ),
      );
    });
    return () => {
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, [sceneEntered]);

  // Arrival-scene pointer parallax: crest and seal-stage drift on
  // separate depth planes as the cursor moves — the scene has air in
  // it before you even click. Desktop (hover-capable) only.
  useEffect(() => {
    if (!booted || sceneEntered) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const overlay = overlayRef.current;
    const card = cardRef.current;
    const stage = overlay?.querySelector<HTMLElement>("[data-seal-stage]");
    if (!overlay || !card || !stage) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(step);
    };
    const step = () => {
      raf = 0;
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      card.style.translate = `${(-cx * 18).toFixed(1)}px ${(-cy * 12).toFixed(1)}px`;
      stage.style.translate = `${(-cx * 34).toFixed(1)}px ${(-cy * 22).toFixed(1)}px`;
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(step);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
      card.style.translate = "";
      stage.style.translate = "";
    };
  }, [booted, sceneEntered]);

  // Fire the 3D seal-break the moment the FX layer + doves are mounted,
  // then — as the shards clear — the camera dives THROUGH the broken
  // seal into the hero (the zoom-through transition).
  useEffect(() => {
    const layer = fxLayerRef.current;
    if (!burst || !layer) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doves = Array.from(layer.querySelectorAll<HTMLElement>("[data-dove]"));
    const tl = playSealBurst3D({
      layer,
      x: burst.x,
      y: burst.y,
      seal: sealRef.current,
      doves,
      reduced,
    });
    let dive: gsap.core.Timeline | null = null;
    const diveCall = gsap.delayedCall(reduced ? 0.3 : 1.2, () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      dive = playCameraDive({
        overlay,
        hero: document.getElementById("hero"),
        layer,
        x: burst.x,
        y: burst.y,
        reduced,
      });
    });
    return () => {
      tl.kill();
      diveCall.kill();
      dive?.kill();
    };
  }, [burst]);

  const enter = () => {
    if (entered.current || opening.current) return;
    opening.current = true;
    unlock(); // user gesture — safe moment to arm WebAudio
    playSwell(); // golden shimmer + bells (audible only when sound is on)
    setRingBreak(true); // the ring joins the choreography
    // Hand the backdrop's frames to the burst — the flash covers its exit.
    setTimeout(() => setShowBackdrop(false), 450);
    const seal = sealRef.current, card = cardRef.current, bloom = bloomRef.current;

    // Mount the 3D FX layer anchored to the seal's center — the GSAP
    // sequence itself launches from the effect watching `burst`, once
    // the layer + doves exist in the DOM. (Overlay is fixed inset:0,
    // so viewport coords map directly.)
    if (seal) {
      const r = seal.getBoundingClientRect();
      // Reach: past every screen corner, so the dust engulfs the viewport.
      const R = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 80;
      setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2, r: R });
      // Hand the seal over to GSAP — kill the CSS glow loop AND the
      // inline transition, which would otherwise smear every frame
      // GSAP writes to transform/opacity.
      seal.style.animation = "none";
      seal.style.transition = "none";
    }
    const overlay = overlayRef.current, butter = butterRef.current, montage = montageRef.current, nav = navRef.current;
    setTimeout(() => { if (card) { card.style.transition = "transform 2.4s cubic-bezier(.16,.84,.28,1), opacity 1.6s ease"; card.style.transform = "translateY(-70px) scale(1.12)"; } }, 420);
    setTimeout(() => { if (bloom) { bloom.style.transition = "opacity 1s ease"; bloom.style.opacity = ".9"; } }, 1300);
    // (the overlay itself is flown by playCameraDive — no CSS fade here)
    setTimeout(() => {
      if (butter) butter.style.opacity = "1";
      if (montage) { montage.style.display = "block"; void montage.offsetWidth; }
    }, 1500);
    setTimeout(() => { if (bloom) { bloom.style.transition = "opacity 1.8s ease"; bloom.style.opacity = "0"; } }, 2600);
    setTimeout(() => { if (montage) montage.style.opacity = "0"; }, 3700);
    setTimeout(() => {
      entered.current = true;
      setSceneEntered(true); // wakes the golden centerpiece
      document.body.style.overflow = "";
      window.scrollTo(0, 0);
      if (overlay) overlay.style.display = "none";
      if (montage) montage.style.display = "none";
      if (nav) { nav.style.opacity = "1"; nav.style.pointerEvents = "auto"; }
      // Safety: if the emerge tween was starved (weak GPU / throttled
      // rAF), never leave the hero frozen mid-transform. Scoped — NOT
      // "all", which would erase the section's inline layout styles.
      const hero = document.getElementById("hero");
      if (hero) gsap.set(hero, { clearProps: "transform,filter,opacity" });
    }, 4400);
  };

  const navLink: CSSProperties = { fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "#e4dbc9" };
  const scrollCue: CSSProperties = { position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", fontSize: 10, letterSpacing: ".4em", textTransform: "uppercase", color: "#a5a1bd", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 };

  const reveal = (delay?: number): CSSProperties => ({ opacity: 0, transform: "translateY(38px)", ...(delay ? {} : {}) });

  // static portrait/story/detail data is memoized to keep identity stable
  const details = useMemo(() => DETAILS, []);

  const toggleSound = () => {
    unlock();
    setSoundOn((prev) => {
      setMuted(prev); // prev===true means we're turning it OFF
      return !prev;
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* cinematic arrival loader — 00 → 100 over black, then reveal */}
      {!booted && <CinematicPreloader onDone={() => setBooted(true)} />}

      {/* the persistent golden centerpiece behind every scene */}
      <GoldenCenterpiece active={sceneEntered} />

      {/* SOUND — bottom-left, in the reference sites' whispered style */}
      <button
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
        style={{ position: "fixed", left: "calc(16px + env(safe-area-inset-left, 0px))", bottom: "calc(14px + env(safe-area-inset-bottom, 0px))", zIndex: 92, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 6 }}
      >
        <span style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 12 }} aria-hidden="true">
          {[7, 11, 5].map((h, i) => (
            <span
              key={i}
              style={{
                width: 2,
                height: h,
                background: soundOn ? "#e9d29a" : "#6a6580",
                transition: "background .4s ease",
                animation: soundOn ? `floaty ${1 + i * 0.3}s ease-in-out infinite` : "none",
              }}
            />
          ))}
        </span>
        <span style={{ fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: ".42em", textTransform: "uppercase", color: soundOn ? "#e9d29a" : "#8a86a4", transition: "color .4s ease" }}>
          Sound
        </span>
      </button>

      {/* silk background */}
      <div aria-hidden style={{ position: "fixed", inset: "-8%", zIndex: -2, background: "url('/assets/silk.jpg') center/cover no-repeat", filter: "saturate(1.04) brightness(1.02)", animation: "drape 30s ease-in-out infinite", transformOrigin: "60% 40%" }} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: "radial-gradient(120% 80% at 50% 0%, rgba(246,243,238,.35), transparent 60%)" }} />
      <div ref={lightRef} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none", mixBlendMode: "screen", background: "radial-gradient(720px circle at 50% 30%, rgba(215,189,133,.08), transparent 60%)" }} />
      <div ref={bloomRef} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 80, pointerEvents: "none", opacity: 0, background: "radial-gradient(circle at 50% 42%, rgba(255,251,240,.95), rgba(244,231,196,.5) 30%, transparent 70%)" }} />

      {/* butterflies — screen-blended so they read as living light on
          the dark scenes but melt away over the cream cards instead of
          sitting on top of the text */}
      <div ref={butterRef} aria-hidden className="fx-ambient" style={{ position: "fixed", inset: 0, zIndex: 54, pointerEvents: "none", opacity: 0, transition: "opacity 1.6s ease", mixBlendMode: "screen" }}>
        {fx?.butterflies.map((b, i) => (
          <span key={i} style={{ position: "absolute", top: b.top, left: b.left, ["--fx" as string]: b.fx, ["--fy" as string]: b.fy, ["--fr" as string]: b.fr, animation: `bfly ${b.dur} ease-in-out ${b.delay} infinite` }}>
            <span style={{ display: "flex", alignItems: "center", perspective: "70px", transform: `scale(${b.scale})` }}>
              <span style={{ width: 15, height: 22, borderRadius: "82% 18% 60% 40%", background: "radial-gradient(circle at 70% 40%, rgba(246,236,207,.95), rgba(216,189,133,.55) 55%, rgba(201,163,91,.25))", boxShadow: "0 0 8px rgba(216,189,133,.5)", transformOrigin: "right center", animation: `flapL ${b.flap} ease-in-out infinite` }} />
              <span style={{ width: 2, height: 18, background: "linear-gradient(180deg,#8a6a2f,#c9a35b)", borderRadius: 2 }} />
              <span style={{ width: 15, height: 22, borderRadius: "18% 82% 40% 60%", background: "radial-gradient(circle at 30% 40%, rgba(246,236,207,.95), rgba(216,189,133,.55) 55%, rgba(201,163,91,.25))", boxShadow: "0 0 8px rgba(216,189,133,.5)", transformOrigin: "left center", animation: `flapR ${b.flap} ease-in-out infinite` }} />
            </span>
          </span>
        ))}
      </div>

      {/* memory montage */}
      <div ref={montageRef} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 82, pointerEvents: "none", display: "none", opacity: 1, transition: "opacity .8s ease", background: "radial-gradient(circle at 50% 50%, rgba(24,22,38,.34), rgba(16,14,24,.68) 80%)" }}>
        {MEMORIES.map((m) => (
          <div key={m.slot} style={{ position: "absolute", left: "50%", top: "50%", ["--r" as string]: m.r, opacity: 0, width: "min(70vw,340px)", aspectRatio: "4/5", borderRadius: 6, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.6),0 0 0 2px rgba(216,189,133,.6),0 0 0 10px rgba(255,255,255,.06)", animation: `memflash .82s ease-out ${m.delay} both` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      {/* NAV */}
      <nav ref={navRef} aria-label="Invitation sections" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "calc(16px + env(safe-area-inset-top, 0px)) clamp(20px,5vw,64px) 16px", opacity: 0, transition: "opacity 1.2s ease", pointerEvents: "none", background: "linear-gradient(180deg,rgba(20,18,30,.34),transparent)" }}>
        <a href="#hero" aria-label="Back to top — Helson and Luna" style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WEDDING.photos.monogram} alt="" style={{ display: "block", height: 36, width: "auto" }} />
        </a>
        <div style={{ display: "flex", gap: "clamp(16px,2.4vw,34px)", alignItems: "center" }}>
          <span className="nav-mid" style={{ display: "flex", gap: "clamp(16px,2.4vw,34px)", alignItems: "center" }}>
            <a href="#couple" className="nav-link" style={navLink}>Couple</a>
            <a href="#story" className="nav-link" style={navLink}>Story</a>
            <a href="#details" className="nav-link" style={navLink}>Details</a>
            <a href="#venue" className="nav-link" style={navLink}>Venue</a>
          </span>
          <a href="#rsvp" className="rsvp-pill" style={{ ...navLink, padding: "9px 20px", border: "1px solid rgba(216,189,133,.6)", borderRadius: 100, color: "#f3e8cf" }}>RSVP</a>
        </div>
      </nav>

      {/* SCENE 1 — ARRIVAL */}
      <div ref={overlayRef} style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(120% 90% at 50% 22%, #2a2740 0%, #1a1728 45%, #100e18 100%)", overflow: "hidden" }}>
        {/* Ethereal night-sky backdrop — procedural WebGL starfield +
            blue/lilac nebulae (see EtherealBackdrop). */}
        {showBackdrop && (
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <EtherealBackdrop />
        </div>
        )}
        {/* Gentle scrim so the crest/seal stay the heroes over the sky. */}
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(120% 90% at 50% 22%, rgba(42,39,64,.28) 0%, rgba(26,23,40,.42) 45%, rgba(16,14,24,.62) 100%)" }} />
        <div style={{ position: "absolute", top: "-14%", left: "50%", transform: "translateX(-50%)", zIndex: 2, width: "52vw", height: "52vw", maxWidth: 640, maxHeight: 640, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,236,224,.16), rgba(200,196,224,.05) 42%, transparent 68%)", filter: "blur(2px)" }} />
        {fx?.dust.map((p, i) => (
          <span key={i} aria-hidden className="fx-ambient" style={{ position: "absolute", top: p.top, left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: "rgba(236,228,205,.9)", ["--o" as string]: p.o, ["--dy" as string]: p.dy, ["--dx" as string]: p.dx, animation: `dust ${p.dur} linear ${p.delay} infinite`, filter: "blur(.4px)" }} />
        ))}

        <div ref={cardRef} style={{ position: "relative", zIndex: 2, width: "min(86vw,440px)", transition: "transform 1.4s cubic-bezier(.19,1,.22,1),opacity 1s ease" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.webp" alt="Helson and Luna monogram" style={{ display: "block", width: "100%", height: "auto", filter: "drop-shadow(0 26px 50px rgba(0,0,0,.55))" }} />
        </div>

        {/* seal stage: the 3D ring halos the seal; both leave together */}
        {/* ring mounts immediately (hidden under the preloader) so
            three.js is loaded and warm before the user can click */}
        <div data-seal-stage style={{ position: "relative", zIndex: 3, marginTop: 14, width: 92, height: 92 }}>
          <WeddingRing3D breaking={ringBreak} />
          <button onClick={enter} ref={sealRef} aria-label="Break the wax seal and open the invitation" style={{ position: "relative", zIndex: 3, width: 92, height: 92, border: "none", cursor: "pointer", borderRadius: "50%", background: "radial-gradient(circle at 38% 32%, #f4e6c0, #c9a35b 55%, #9a7636 100%)", animation: "sealGlow 3.4s ease-in-out infinite", transition: "transform 1s cubic-bezier(.19,1,.22,1),opacity .8s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 34, letterSpacing: ".02em", color: "#6b4f22", textShadow: "0 1px 1px rgba(255,255,255,.4)" }}>H<span style={{ fontSize: 22 }}>&amp;</span>L</span>
            <span style={{ position: "absolute", inset: 6, borderRadius: "50%", border: "1px solid rgba(107,79,34,.35)" }} />
          </button>
        </div>

        <p style={{ zIndex: 3, marginTop: 34, fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: ".5em", textTransform: "uppercase", color: "rgba(233,221,196,.82)", animation: "floaty 4s ease-in-out infinite" }}>Press the Seal to Begin</p>
      </div>

      {/* Seal-break magic, in true 3D: the GSAP sequence (sealBurst3D)
          spawns tumbling wax shards, a depth-aware pixie-dust explosion,
          a rising dust helix, banking doves and fluttering feathers into
          this fixed layer. `perspective` here is what gives every
          translateZ/rotateX its dimensionality. Fixed ABOVE the memory
          montage (z 82) so the doves soar over the flashing memories;
          the golden veil + core flash stay as cheap CSS. */}
      {burst && (
        <div
          ref={fxLayerRef}
          style={{ position: "fixed", inset: 0, zIndex: 84, pointerEvents: "none", perspective: "1100px", overflow: "hidden" }}
          aria-hidden="true"
        >
            {/* full-screen golden veil, breathing out from the seal */}
            <span style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 120% at ${burst.x}px ${burst.y}px, rgba(246,236,196,.5), rgba(216,189,133,.22) 40%, transparent 75%)`, animation: "veilFlash 2.4s ease-out forwards", opacity: 0 }} />
            {/* soft golden core flash at the moment of impact */}
            <span style={{ position: "absolute", left: burst.x - 80, top: burst.y - 80, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,251,240,.9), rgba(233,210,154,.4) 45%, transparent 70%)", animation: "burstGlow 1.4s ease-out forwards" }} />

            {/* three doves — near pair + one far, all flown by GSAP motion paths */}
            <span data-dove="near-left" style={{ position: "absolute", left: burst.x, top: burst.y, opacity: 0, willChange: "transform, opacity", transformStyle: "preserve-3d" }}>
              <Dove flip flapDur=".36s" />
            </span>
            <span data-dove="near-right" style={{ position: "absolute", left: burst.x, top: burst.y, opacity: 0, willChange: "transform, opacity", transformStyle: "preserve-3d" }}>
              <Dove flapDelay=".18s" flapDur=".4s" />
            </span>
            <span data-dove="far-center" style={{ position: "absolute", left: burst.x, top: burst.y, opacity: 0, willChange: "transform, opacity", transformStyle: "preserve-3d" }}>
              <Dove flapDelay=".09s" flapDur=".32s" />
            </span>
        </div>
      )}

      {/* SCENE 3 — HERO */}
      <section id="hero" className="snap-sect scene" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(70px,10vh,110px) 24px clamp(50px,8vh,80px)", background: "radial-gradient(130% 100% at 50% 0%, rgba(246,244,250,.62) 0%, rgba(226,225,239,.48) 42%, rgba(215,215,234,.4) 100%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "12%", left: "8%", width: 2, height: 150, background: "linear-gradient(180deg,transparent,rgba(216,189,133,.5),transparent)", animation: "floatySlow 9s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "14%", right: "10%", width: 2, height: 120, background: "linear-gradient(180deg,transparent,rgba(216,189,133,.4),transparent)", animation: "floatySlow 11s ease-in-out infinite" }} />
        {/* petals drifting down through the hero */}
        {HERO_PETALS.map((p, i) => (
          <span key={i} aria-hidden className="fx-ambient" style={{ position: "absolute", top: 0, left: p.left, width: p.s, height: p.s * 0.72, borderRadius: "60% 60% 60% 0", background: p.c, opacity: 0, ["--px" as string]: p.px, ["--pr" as string]: p.pr, animation: `petalFall ${p.dur} linear ${p.delay} infinite`, pointerEvents: "none", filter: "drop-shadow(0 2px 3px rgba(90,84,130,.25))" } as CSSProperties} />
        ))}
        <div data-reveal className="hero-kicker" style={{ ...reveal(), fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: ".62em", textTransform: "uppercase", color: "#6d6887", marginBottom: 26 }}>{WEDDING.invitationLine}</div>
        <div data-reveal data-reveal-delay="150" className="hero-crest" style={{ ...reveal(), position: "relative", width: "min(76vw,38vh,380px)", marginBottom: -6, animation: "floatySlow 10s ease-in-out infinite" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WEDDING.photos.crest} alt="" style={{ display: "block", width: "100%", filter: "drop-shadow(0 22px 42px rgba(90,84,130,.34))" }} />
        </div>
        <h1 data-reveal data-reveal-delay="300" className="gold-shimmer" style={{ ...reveal(), margin: "20px 0 4px", fontFamily: "'Pinyon Script',cursive", fontWeight: 400, fontSize: "clamp(42px,11vw,126px)", lineHeight: 0.92, ...goldText }}>{WEDDING.couple.first} &amp; {WEDDING.couple.second}</h1>
        <div data-reveal data-reveal-delay="420" style={{ ...reveal(), marginTop: 12, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(15px,2vw,20px)", letterSpacing: ".1em", color: "#5f5980" }}>{WEDDING.heroLine}</div>
        <div data-reveal data-reveal-delay="480" className="hero-date" style={{ ...reveal(), display: "flex", alignItems: "center", gap: 18, marginTop: 16, color: "#4f4a6e" }}>
          <span aria-hidden style={{ width: 52, height: 1, background: "linear-gradient(90deg,transparent,#c9a35b)" }} />
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, letterSpacing: ".36em", textTransform: "uppercase" }}>{WEDDING.date.display}</span>
          <span aria-hidden style={{ width: 52, height: 1, background: "linear-gradient(270deg,transparent,#c9a35b)" }} />
        </div>
        <HeroCountdown />
        <div style={scrollCue}>Scroll<span style={{ width: 1, height: 40, background: "linear-gradient(180deg,#c9a35b,transparent)", animation: "floaty 2.4s ease-in-out infinite" }} /></div>
      </section>

      {/* SCENE 4 — COUPLE */}
      <section id="couple" className="snap-sect scene" style={{ position: "relative", padding: "clamp(48px,7vh,72px) 24px clamp(14px,2.5vh,28px)", justifyContent: "center", background: "radial-gradient(100% 80% at 50% 8%, rgba(38,36,59,.9) 0%, rgba(30,28,48,.86) 45%, rgba(22,20,36,.92) 100%)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-6%", left: "50%", transform: "translateX(-50%)", width: "70vw", height: "70vw", maxWidth: 820, maxHeight: 820, borderRadius: "50%", background: "radial-gradient(circle, rgba(216,189,133,.16), rgba(200,196,224,.06) 44%, transparent 68%)", pointerEvents: "none" }} />
        {fx?.sparkles.map((s, i) => (
          <span key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, pointerEvents: "none", background: "radial-gradient(circle,#f6eccf,rgba(216,189,133,0))", borderRadius: "50%", boxShadow: "0 0 8px 2px rgba(216,189,133,.6)", animation: `sparkle ${s.dur} ease-in-out ${s.delay} infinite` }} />
        ))}

        <div data-reveal className="couple-head" style={{ opacity: 0, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(6px,1.2vh,12px)", marginBottom: "clamp(6px,1.2vh,12px)" }}>
          <span aria-hidden className="couple-line" style={{ width: 1, height: "clamp(20px,4vh,36px)", background: "linear-gradient(180deg,transparent,#d8bd85)" }} />
          <span aria-hidden style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#e9d29a", transform: "rotate(45deg)", display: "inline-block", textShadow: "0 0 18px rgba(216,189,133,.7)" }}>✦</span>
          <span style={{ fontSize: 11, letterSpacing: ".62em", textTransform: "uppercase", color: "#c7bfe0" }}>Two Hearts · One Light</span>
        </div>
        <h2 data-reveal data-reveal-delay="140" className="couple-quote" style={{ opacity: 0, position: "relative", zIndex: 2, margin: "0 0 clamp(16px,3vh,34px)", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(24px,3.2vw,38px)", color: "#efe7d2", maxWidth: "18ch", lineHeight: 1.3 }}>{WEDDING.coupleQuote}</h2>

        {/* Editorial spread: two portrait plates flank the celestial
            scene, hung at slightly different heights like frames in a
            gallery. The plates hide below 960px, where the compressed
            single-screen mobile composition takes over. */}
        <div className="couple-spread" style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(22px,3.4vw,52px)", width: "100%", maxWidth: 1240 }}>
          <div data-reveal data-reveal-delay="200" className="couple-portrait" style={{ opacity: 0, flex: "0 1 min(236px,24vh)", alignSelf: "flex-start", marginTop: 18 }}>
            <PortraitFrame src={WEDDING.photos.portraitFirst} initial={WEDDING.couple.first[0]} name={WEDDING.couple.first} role={WEDDING.couple.firstRole} tilt="-1.6deg" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 1 760px", minWidth: 0 }}>
            {/* the couple within a majestic moving celestial scene */}
            <div data-reveal data-reveal-delay="120" className="couple-scene" style={{ opacity: 0, position: "relative", width: "min(94vw,760px)", aspectRatio: "16/11", maxHeight: "min(36dvh,36vh)", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 1px rgba(216,189,133,.5),0 0 0 7px rgba(255,255,255,.05),0 40px 90px rgba(0,0,0,.55),0 0 70px rgba(216,189,133,.2)" }}>
              <EtherealScene />
            </div>
            <div data-reveal data-reveal-delay="240" className="couple-names" style={{ opacity: 0, marginTop: "clamp(10px,2vh,20px)", fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(40px,8vw,62px)", lineHeight: 0.9, background: "linear-gradient(120deg,#c9a35b,#f6ecc4,#c9a35b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 5s linear infinite" }}>{WEDDING.couple.first} &amp; {WEDDING.couple.second}</div>
            <div data-reveal data-reveal-delay="300" style={{ opacity: 0, fontSize: 10, letterSpacing: ".44em", textTransform: "uppercase", color: "#b7aecf", marginTop: 8 }}>{WEDDING.couple.firstRole} &amp; {WEDDING.couple.secondRole}</div>
          </div>

          <div data-reveal data-reveal-delay="280" className="couple-portrait" style={{ opacity: 0, flex: "0 1 min(236px,24vh)", alignSelf: "flex-end", marginBottom: 18 }}>
            <PortraitFrame src={WEDDING.photos.portraitSecond} initial={WEDDING.couple.second[0]} name={WEDDING.couple.second} role={WEDDING.couple.secondRole} tilt="1.6deg" />
          </div>
        </div>

        <p data-reveal data-reveal-delay="240" className="couple-text" style={{ opacity: 0, position: "relative", zIndex: 2, maxWidth: "56ch", margin: "clamp(12px,2.2vh,24px) auto 0", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(16px,2vw,21px)", lineHeight: 1.65, color: "#e2dac6" }}>{WEDDING.coupleVow}</p>
      </section>

      {/* SCENE 5 — LOVE STORY */}
      <section id="story" ref={storyRef} style={{ position: "relative", height: "680vh", background: "linear-gradient(180deg,rgba(22,20,34,.62) 0%,rgba(26,23,42,.78) 50%,rgba(22,20,34,.62) 100%)" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: "-14%", left: "50%", transform: "translateX(-50%)", width: "74vw", height: "74vw", maxWidth: 940, maxHeight: 940, borderRadius: "50%", background: "radial-gradient(circle,rgba(216,189,133,.15),rgba(200,196,224,.05) 44%,transparent 68%)", pointerEvents: "none" }} />
          {fx?.sparkles.map((s, i) => (
            <span key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, pointerEvents: "none", background: "radial-gradient(circle,#f6eccf,rgba(216,189,133,0))", borderRadius: "50%", boxShadow: "0 0 8px 2px rgba(216,189,133,.55)", animation: `sparkle ${s.dur} ease-in-out ${s.delay} infinite` }} />
          ))}

          {/* ── Chapter 2 → 3: a life growing up — silhouettes light up
                 along a golden path as the scroll carries the story ── */}
          <div ref={growFxRef} aria-hidden style={{ position: "absolute", inset: 0, zIndex: 4, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, pointerEvents: "none" }}>
            <svg viewBox="0 0 640 220" style={{ width: "min(88vw,560px)", overflow: "visible", filter: "drop-shadow(0 0 14px rgba(233,210,154,.45))" }}>
              <path data-grow-path d="M40 178 C 200 150 440 150 600 178" fill="none" stroke="#d8bd85" strokeWidth="1.4" strokeDasharray="1 6" strokeLinecap="round" pathLength={1} strokeDashoffset={1} />
              {/* baby, crawling */}
              <g data-grow-stage data-bx="70" data-by="148" transform="translate(70 148)" fill="#efdcaa" opacity="0">
                <ellipse cx="0" cy="16" rx="20" ry="10" />
                <circle cx="20" cy="6" r="10" />
                <ellipse cx="-14" cy="24" rx="6" ry="4" />
                <ellipse cx="10" cy="25" rx="6" ry="4" />
              </g>
              {/* toddler, first steps */}
              <g data-grow-stage data-bx="225" data-by="122" transform="translate(225 122)" fill="#efdcaa" opacity="0">
                <circle cx="0" cy="-10" r="11" />
                <path d="M-8 0 C -9 14 9 14 8 0 L 7 24 L 3 24 L 1 12 L -1 12 L -3 24 L -7 24 Z" />
                <path d="M-8 4 L -16 12 M8 4 L 16 10" stroke="#efdcaa" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
              {/* child, running with a kite */}
              <g data-grow-stage data-bx="380" data-by="108" transform="translate(380 108)" fill="#efdcaa" opacity="0">
                <circle cx="0" cy="-18" r="10" />
                <path d="M-6 -8 C -8 6 8 6 6 -8 L 14 26 L 9 28 L 2 8 L -6 28 L -11 26 Z" />
                <path d="M-6 -4 L -18 2 M6 -6 L 20 -14" stroke="#efdcaa" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M20 -14 L 38 -46" stroke="#d8bd85" strokeWidth="1" fill="none" />
                <path d="M38 -58 L 46 -46 L 38 -34 L 30 -46 Z" fill="none" stroke="#e9d29a" strokeWidth="1.4" />
              </g>
              {/* grown, stepping into the story */}
              <g data-grow-stage data-bx="540" data-by="92" transform="translate(540 92)" fill="#efdcaa" opacity="0">
                <circle cx="0" cy="-30" r="11" />
                <path d="M-8 -18 C -10 2 10 2 8 -18 L 10 16 L 5 42 L 0 42 L 2 18 L -2 18 L -5 42 L -10 42 L -10 16 Z" />
                <path d="M-8 -14 L -15 6 M8 -14 L 15 6" stroke="#efdcaa" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              </g>
              {/* stage captions — the story under each figure */}
              <g fill="#cbbf9d" fontSize="10.5" fontFamily="Jost,sans-serif" letterSpacing="2.6" textAnchor="middle" style={{ textTransform: "uppercase" } as CSSProperties}>
                <text data-grow-cap x="70" y="205" opacity="0">{WEDDING.growingUp[0]}</text>
                <text data-grow-cap x="225" y="205" opacity="0">{WEDDING.growingUp[1]}</text>
                <text data-grow-cap x="380" y="205" opacity="0">{WEDDING.growingUp[2]}</text>
                <text data-grow-cap x="540" y="205" opacity="0">{WEDDING.growingUp[3]}</text>
              </g>
            </svg>
          </div>

          {/* ── Chapter 3 → 4: a real 3D airliner — takes off from
                 center, banks out the right edge, transits unseen,
                 re-enters left and lands as Chapter 4 arrives ── */}
          <div ref={flightFxRef} aria-hidden style={{ position: "absolute", inset: 0, zIndex: 4, opacity: 0, pointerEvents: "none" }}>
            <StoryFlight3D ref={storyFlightRef} />
            <div data-flight-label-a style={{ position: "absolute", left: "50%", top: "72%", transform: "translateX(-50%)", opacity: 0, fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: 11, letterSpacing: ".5em", textTransform: "uppercase", color: "#d8c9a3", textShadow: "0 0 14px rgba(233,210,154,.5)" }}>
              {WEDDING.flight.departure}
            </div>
            <div data-flight-label-b style={{ position: "absolute", left: "50%", top: "72%", transform: "translateX(-50%)", opacity: 0, fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: 11, letterSpacing: ".5em", textTransform: "uppercase", color: "#d8c9a3", textShadow: "0 0 14px rgba(233,210,154,.5)" }}>
              {WEDDING.flight.arrival}
            </div>
          </div>

          <div style={{ position: "absolute", top: "clamp(30px,5vh,54px)", left: 0, right: 0, textAlign: "center", zIndex: 6, pointerEvents: "none" }}>
            <div style={{ fontSize: 10, letterSpacing: ".56em", textTransform: "uppercase", color: "#8f89ad", marginBottom: 10 }}>{WEDDING.couple.first} &amp; {WEDDING.couple.second}</div>
            <h2 className="gold-shimmer" style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(30px,4.2vw,52px)", letterSpacing: ".14em", lineHeight: 1, ...goldText }}>Our Story</h2>
            <div style={{ marginTop: 10, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, letterSpacing: ".4em", color: "#c7bfe0" }}><span ref={counterRef} style={{ color: "#e9d29a" }}>01</span> &nbsp;/&nbsp; 04</div>
          </div>

          <div style={{ position: "absolute", left: "clamp(16px,5vw,64px)", top: "22%", bottom: "22%", width: 1, background: "rgba(216,189,133,.22)", zIndex: 6 }}>
            <div ref={progRef} style={{ position: "absolute", top: 0, left: -1.5, width: 4, height: "0%", background: "linear-gradient(180deg,#f6ecc4,#c9a35b)", boxShadow: "0 0 16px rgba(216,189,133,.85)", borderRadius: 3, transition: "height .12s linear" }} />
          </div>

          {STORY.map((c) => (
            <div key={c.i} data-ch={c.i} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(90vw,660px)", opacity: 0, textAlign: "center", willChange: "transform,opacity,filter" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, letterSpacing: ".52em", textTransform: "uppercase", color: "#d8bd85", marginBottom: 24, textShadow: "0 0 20px rgba(216,189,133,.4)" }}>{c.no}</div>
              <div style={{ position: "relative", width: "min(56vw,214px,26vh)", aspectRatio: "4/5", margin: "0 auto clamp(14px,3vh,32px)", borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 2px rgba(216,189,133,.7),0 0 0 10px rgba(255,255,255,.05),0 26px 60px rgba(0,0,0,.5),0 0 56px rgba(216,189,133,.22)", animation: "floatySlow 12s ease-in-out infinite" }}>
                {c.photo ? (
                  <>
                    <img src={c.photo} alt={c.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    {/* ethereal gold-dusk veil so the photograph sits inside the night-sky palette */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 38%, rgba(216,189,133,0) 46%, rgba(24,20,40,.45) 100%)", boxShadow: "inset 0 0 44px rgba(24,20,40,.55), inset 0 0 18px rgba(216,189,133,.18)" }} />
                  </>
                ) : (
                  <StoryEmblem chapter={c.i} />
                )}
              </div>
              <h3 style={{ margin: "0 0 clamp(10px,2vh,20px)", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(30px,5vw,56px)", color: "#f2ead4", lineHeight: 1.08 }}>{c.title}</h3>
              <p style={{ margin: "0 auto", maxWidth: "40ch", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(16px,2.1vw,21px)", lineHeight: 1.65, color: "#d6cebc" }}>{c.body}</p>
            </div>
          ))}

          <div style={{ position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)", zIndex: 6, fontSize: 10, letterSpacing: ".42em", textTransform: "uppercase", color: "#b7aecf", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none" }}>Scroll to unfold<span style={{ width: 1, height: 34, background: "linear-gradient(180deg,#c9a35b,transparent)", animation: "floaty 2.4s ease-in-out infinite" }} /></div>
        </div>
      </section>

      {/* SCENE 6 — DETAILS */}
      <section id="details" className="snap-sect scene" style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(64px,9vh,90px) 24px clamp(20px,4vh,44px)", background: "radial-gradient(120% 80% at 50% 0%, rgba(244,239,232,.74) 0%, rgba(236,231,226,.6) 55%, rgba(230,223,218,.5) 100%)", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <div data-reveal style={{ ...reveal(), fontSize: 11, letterSpacing: ".56em", textTransform: "uppercase", color: "#7c6a4d", textShadow: "0 1px 6px rgba(255,255,255,.5)", marginBottom: 18 }}>The Celebration</div>
          <h2 data-reveal data-reveal-delay="120" className="details-title" style={{ ...reveal(), margin: "0 auto 10px", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(34px,5.6vw,64px)", letterSpacing: ".08em", color: "#3d3860", lineHeight: 1.04 }}>Wedding Details</h2>
          <div data-reveal data-reveal-delay="180" className="details-date" style={{ ...reveal(), display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "0 0 clamp(18px,4vh,44px)", color: "#7c6a4d" }}>
            <span aria-hidden style={{ width: 44, height: 1, background: "linear-gradient(90deg,transparent,#c9a35b)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(15px,2vw,19px)", letterSpacing: ".08em" }}>{WEDDING.date.long}, {WEDDING.date.year.toLowerCase()}</span>
            <span aria-hidden style={{ width: 44, height: 1, background: "linear-gradient(270deg,transparent,#c9a35b)" }} />
          </div>
          {/* The suite: an engraved sheet — one plate, four columns
              divided by hairlines, like a letterpress invitation. */}
          <div data-reveal data-reveal-style="flip" data-reveal-delay="220" className="details-suite" style={{ ...reveal(), position: "relative", background: "linear-gradient(180deg,#fcfaf5,#f4efe6)", boxShadow: "0 30px 70px rgba(120,105,80,.18),inset 0 0 0 1px rgba(216,189,133,.45)", padding: "10px" }}>
            <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: "1px solid rgba(216,189,133,.35)" }}>
              {details.map((d, i) => (
                <div key={d.label} className="det-col" style={{ position: "relative", padding: "clamp(28px,3.4vw,46px) clamp(14px,2vw,28px)", borderLeft: i > 0 ? "1px solid rgba(216,189,133,.32)" : "none" }}>
                  <div className="det-icon" style={{ marginBottom: 16, opacity: 0.9 }}><DetailIcon kind={d.icon} /></div>
                  <div className="det-label" style={{ fontSize: 10, letterSpacing: ".4em", textTransform: "uppercase", color: "#a99a80", marginBottom: 12 }}>{d.label}</div>
                  <div className="det-title" style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(18px,1.8vw,23px)", color: "#4a4468", lineHeight: 1.3 }}>{d.title}</div>
                  <div className="det-sub" style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(14px,1.4vw,17px)", color: "#7a7392", marginTop: 6 }}>{d.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <p data-reveal data-reveal-delay="300" className="details-note" style={{ ...reveal(), margin: "clamp(14px,3vh,30px) auto 0", maxWidth: "52ch", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.7, color: "#6d6788" }}>{WEDDING.venue.arrivalNote}</p>
        </div>
      </section>

      {/* SCENE 7 — VENUE */}
      <section id="venue" className="snap-sect scene" style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(64px,9vh,90px) 24px clamp(20px,4vh,44px)", background: "linear-gradient(180deg,rgba(241,238,244,.92) 0%,rgba(228,226,240,.88) 100%)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1000, width: "100%", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "clamp(22px,4vw,68px)", alignItems: "center", justifyContent: "center" }}>
          <div data-reveal style={{ ...reveal(), flex: "1 1 300px", minWidth: 280 }}>
            <div style={{ fontSize: 11, letterSpacing: ".56em", textTransform: "uppercase", color: "#6a6486", marginBottom: 16 }}>The Venue</div>
            <h2 className="venue-title" style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',serif", fontWeight: 400, fontSize: "clamp(34px,5vw,58px)", color: "#3d3860", lineHeight: 1.05 }}>{WEDDING.venue.name}</h2>
            <div className="venue-city" style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: 22, color: "#574f74", marginBottom: 26 }}>{WEDDING.venue.city}</div>
            <p className="venue-desc" style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 18, lineHeight: 1.75, color: "#4e4a68", maxWidth: "42ch" }}>{WEDDING.venue.description}</p>
            <div className="venue-arrival" style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 24, maxWidth: "44ch" }}>
              <span aria-hidden style={{ flexShrink: 0, marginTop: 9, width: 26, height: 1, background: "#c9a35b" }} />
              <p style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: 16, lineHeight: 1.65, color: "#6d6788" }}>{WEDDING.venue.arrivalNote}</p>
            </div>
            <a href={WEDDING.venue.mapsUrl} target="_blank" rel="noopener" className="lux-btn venue-btn" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 28, padding: "14px 30px", borderRadius: 100, border: "1px solid rgba(201,163,91,.7)", fontSize: 11, letterSpacing: ".32em", textTransform: "uppercase", color: "#a9853f" }}>Directions →</a>
          </div>
          <div data-reveal data-reveal-style="mask" data-reveal-delay="200" className="venue-map" style={{ ...reveal(), flex: "1 1 320px", minWidth: 300 }}>
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", boxShadow: "0 30px 60px rgba(90,84,130,.26),inset 0 0 0 1px rgba(216,189,133,.4),inset 0 0 0 7px rgba(255,255,255,.55)", background: "linear-gradient(160deg,#eef0f5,#e4e6f0)" }}>
              {/* An engraved, brand-matched plan of the journey — an
                  atlas plate rather than an embedded map product. */}
              <svg viewBox="0 0 400 300" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label={`Stylized map showing the golden route to ${WEDDING.venue.name}, ${WEDDING.venue.city}`}>
                <rect width="400" height="300" fill="#eceef4" />
                {/* city blocks */}
                <path d="M0 210 H400 M0 150 H400 M120 0 V300 M260 0 V300" stroke="#d7d9e6" strokeWidth="6" fill="none" />
                <path d="M0 96 H400 M60 0 V300 M330 0 V300 M0 258 H400" stroke="#dfe1ec" strokeWidth="2.5" fill="none" />
                {/* a river of lilac light */}
                <path d="M-10 288 C 90 268 150 292 230 276 S 360 286 410 270" stroke="#cfd3ea" strokeWidth="10" fill="none" opacity=".6" />
                {/* hairline inner frame */}
                <rect x="10" y="10" width="380" height="280" fill="none" stroke="rgba(201,163,91,.45)" strokeWidth="1" />
                {/* the golden route */}
                <path d="M40 260 C110 220 120 150 200 140 S300 90 350 50" stroke="#c9a35b" strokeWidth="3" fill="none" strokeDasharray="7 9" strokeLinecap="round" style={{ strokeDashoffset: 520, animation: "dash 3.6s ease-out forwards .3s" }} />
                <circle cx="40" cy="260" r="7" fill="#b8935a" />
                <text x="54" y="272" fontFamily="Jost,sans-serif" fontSize="9" letterSpacing="2.4" fill="#8a84a5" style={{ textTransform: "uppercase" }}>You</text>
                {/* destination pin + halo */}
                <circle cx="350" cy="62" r="20" fill="none" stroke="rgba(201,163,91,.5)" strokeWidth="1" strokeDasharray="2 4" />
                <g transform="translate(350 50)">
                  <path d="M0 -4 C10 -4 14 4 8 12 L0 24 L-8 12 C-14 4 -10 -4 0 -4 Z" fill="#c9a35b" />
                  <circle cx="0" cy="6" r="4.5" fill="#fbf6ea" />
                </g>
                <text x="350" y="98" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontSize="15" fontStyle="italic" fill="#574f74">{WEDDING.venue.name}</text>
                {/* compass rose */}
                <g transform="translate(44 52)" stroke="#a9a3c0" strokeWidth="1" fill="none">
                  <circle r="13" />
                  <path d="M0 -19 L3.5 -3 L0 3 L-3.5 -3 Z" fill="#c9a35b" stroke="none" />
                  <path d="M0 19 V13 M-19 0 H-13 M19 0 H13" />
                  <text y="-24" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="9" letterSpacing="2" fill="#8a84a5" stroke="none">N</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 9 — RSVP */}
      <section id="rsvp" className="snap-sect scene" style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(40px,6vh,120px) 20px", boxSizing: "border-box", background: "radial-gradient(120% 90% at 50% 10%, rgba(239,234,243,.6) 0%, rgba(228,226,239,.46) 55%, rgba(216,215,234,.4) 100%)", overflow: "hidden" }}>
        <RsvpForm />
      </section>

      {/* SCENE 10 — CLOSING */}
      <section className="snap-sect scene" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(60px,9vh,110px) 24px", background: "radial-gradient(130% 100% at 50% 30%, #26243b 0%, #17152300 0%, #100e18 100%),linear-gradient(180deg,#1b1930,#100e18)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: "44vw", height: "44vw", maxWidth: 520, maxHeight: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(240,236,224,.16),transparent 66%)" }} />
        {fx?.stars.map((s, i) => (
          <span key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: "50%", background: "#f3ecd8", animation: `twinkle ${s.dur} ease-in-out ${s.delay} infinite` }} />
        ))}
        {fx?.fireflies.map((f, i) => (
          <span key={i} aria-hidden className="fx-ambient" style={{ position: "absolute", top: f.top, left: f.left, width: 5, height: 5, borderRadius: "50%", background: "#f0d99a", boxShadow: "0 0 10px 3px rgba(240,217,154,.7)", ["--fx" as string]: f.fx, ["--fy" as string]: f.fy, animation: `firefly ${f.dur} ease-in-out ${f.delay} infinite` }} />
        ))}
        <div data-reveal style={{ opacity: 0, transform: "translateY(38px)", position: "relative", zIndex: 2 }}>
          {/* the crest returns for the farewell — the artifact closes
              the way it opened, sealed with the same mark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WEDDING.photos.monogram} alt="" aria-hidden="true" style={{ display: "block", width: "clamp(54px,8vw,84px)", height: "auto", margin: "0 auto 34px", opacity: 0.9, filter: "drop-shadow(0 10px 30px rgba(0,0,0,.5))" }} />
          <blockquote style={{ margin: "0 auto", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(24px,4vw,40px)", lineHeight: 1.6, color: "#e6dcc4", maxWidth: "20ch" }}>&ldquo;{WEDDING.closingQuote}&rdquo;</blockquote>
          <div aria-hidden style={{ margin: "44px auto 0", width: 60, height: 1, background: "linear-gradient(90deg,transparent,#c9a35b,transparent)" }} />
          <div className="gold-shimmer" style={{ marginTop: 44, fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(42px,10vw,110px)", ...goldText }}>{WEDDING.couple.first} &amp; {WEDDING.couple.second}</div>
          <div style={{ marginTop: 14, fontSize: 11, letterSpacing: ".5em", textTransform: "uppercase", color: "#a49f8a" }}>{WEDDING.date.shortLine}</div>
        </div>
      </section>
    </div>
  );
}
