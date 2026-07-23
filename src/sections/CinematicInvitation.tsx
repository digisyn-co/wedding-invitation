"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { playSealBurst3D, playCameraDive } from "@/animations/sealBurst3D";

gsap.registerPlugin(ScrollTrigger);
import { CinematicPreloader } from "@/components/CinematicPreloader";
import { GoldenCenterpiece } from "@/components/GoldenCenterpiece";
import { EtherealBackdrop } from "@/components/EtherealBackdrop";
import { WeddingRing3D } from "@/components/WeddingRing3D";
import { unlock, setMuted, playSwell } from "@/lib/sealAudio";
import { AnimatedCharacter } from "@/components/AnimatedCharacter";
import { EtherealScene } from "@/components/EtherealScene";
import { StoryEmblem } from "@/components/StoryEmblem";
import { HeroCountdown } from "@/components/HeroCountdown";
import { RsvpForm } from "@/components/RsvpForm";
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

/* Deeper gold ramp for headings that sit on LIGHT scenes — the airy
   gradient above disappears against cream; this one keeps its shape,
   with a white edge-light for engraved legibility. */
const goldTextDark: CSSProperties = {
  background: "linear-gradient(120deg,#a97f3d 0%,#8a6428 38%,#c9a35b 58%,#a97f3d 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  filter: "drop-shadow(0 1px 0 rgba(255,255,255,.55))",
};

interface Dust { top: string; left: string; size: string; o: string; dy: string; dx: string; dur: string; delay: string }
interface Spark { top: string; left: string; size: string; dur: string; delay: string }
interface Star { top: string; left: string; size: string; dur: string; delay: string }
interface Fly { top: string; left: string; fx: string; fy: string; dur: string; delay: string }
interface Bfly { top: string; left: string; fx: string; fy: string; fr: string; scale: string; dur: string; delay: string; flap: string }
interface Particles { dust: Dust[]; sparkles: Spark[]; stars: Star[]; fireflies: Fly[]; butterflies: Bfly[] }
interface SealBurst { x: number; y: number; r: number }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const STORY = [
  { i: 0, slot: "story-1", no: "Chapter One", title: "The First Glance", body: "A crowded room, a fleeting look — and somehow the noise softened to a hush. Neither knew it yet, but the story had already begun." },
  { i: 1, slot: "story-2", no: "Chapter Two", title: "A Thousand Letters", body: "Words became a bridge across the miles. Every note, every late-night call, drew two distant hearts a little closer to one home." },
  { i: 2, slot: "story-3", no: "Chapter Three", title: "The Question", body: "Beneath a sky spilling with stars, one knee, one ring, one breathless yes. Forever, it turned out, was simply a matter of asking." },
  { i: 3, slot: "story-4", no: "Chapter Four", title: "The Beginning", body: "And now, surrounded by the people they love most, they write the truest chapter of all — the one that never ends." },
];

const DETAILS = [
  { icon: "✦", label: "The Date", title: "December 12", sub: "Saturday, 2026", delay: 120 },
  { icon: "❋", label: "Ceremony", title: "3:30 in the afternoon", sub: "Vows & first light", delay: 220 },
  { icon: "✿", label: "Reception", title: "Dinner & dancing", sub: "To follow, till late", delay: 320 },
  { icon: "♛", label: "Dress Code", title: "Formal · Lilac & Gold", sub: "Dress to enchant", delay: 420 },
];

const MEMORIES = [
  { slot: "memory-1", r: "-6deg", delay: "0s" },
  { slot: "memory-2", r: "5deg", delay: ".34s" },
  { slot: "memory-3", r: "-3deg", delay: ".68s" },
  { slot: "memory-4", r: "7deg", delay: "1.02s" },
  { slot: "memory-5", r: "-5deg", delay: "1.36s" },
];

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
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
    );
    const obs = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-obs])").forEach((el) => {
        el.setAttribute("data-obs", "1");
        el.style.filter = "blur(7px)";
        // Each reveal style is a different curtain: flip rises out of
        // perspective, mask wipes open, default drifts up from below.
        const styleType = el.getAttribute("data-reveal-style");
        if (styleType === "flip") {
          el.style.transform = "perspective(900px) translateY(58px) rotateX(24deg) scale(.96)";
        } else if (styleType === "mask") {
          el.style.transform = "translateY(26px)";
          el.style.clipPath = "inset(0 100% 0 0)";
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
      els.forEach((el, i) => {
        const d = pos - 0.5 - i;
        const dist = Math.abs(d);
        const op = Math.max(0, 1 - dist * 1.35);
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
        const t = clamp01((pos - 1.6) / 0.8); // between ch2 and ch3
        grow.style.opacity = t > 0 && t < 1 ? bell(t).toFixed(3) : "0";
        const path = grow.querySelector<SVGPathElement>("[data-grow-path]");
        if (path) path.style.strokeDashoffset = String(1 - t);
        grow.querySelectorAll<SVGGElement>("[data-grow-stage]").forEach((g, k) => {
          const st = clamp01(t * 4.8 - k * 1.05); // stages light up in turn
          g.style.opacity = st.toFixed(3);
          // position via the SVG transform ATTRIBUTE — a CSS transform
          // would override (and erase) each stage's base placement
          const bx = g.getAttribute("data-bx") ?? "0";
          const by = Number(g.getAttribute("data-by") ?? 0);
          g.setAttribute("transform", `translate(${bx} ${(by + (1 - st) * 14).toFixed(1)})`);
        });
      }

      const flight = flightFxRef.current;
      if (flight && !reducedFx) {
        const t = clamp01((pos - 2.6) / 0.8); // between ch3 and ch4
        flight.style.opacity = t > 0 && t < 1 ? bell(t).toFixed(3) : "0";
        if (t > 0 && t < 1) {
          const route = flight.querySelector<SVGPathElement>("[data-flight-route]");
          const plane = flight.querySelector<SVGGElement>("[data-flight-plane]");
          const shadow = flight.querySelector<SVGPathElement>("[data-flight-shadow]");
          const pulse = flight.querySelector<SVGCircleElement>("[data-flight-pulse]");
          // quadratic bezier: PH (445,90) → ctrl (250,150) → Perth (330,334)
          const ft = t * t * (3 - 2 * t); // smoothstep — gentle take-off/landing
          const mt = 1 - ft;
          const x = mt * mt * 445 + 2 * mt * ft * 250 + ft * ft * 330;
          const y = mt * mt * 90 + 2 * mt * ft * 150 + ft * ft * 334;
          const dx = 2 * mt * (250 - 445) + 2 * ft * (330 - 250);
          const dy = 2 * mt * (150 - 90) + 2 * ft * (334 - 150);
          const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          const alt = bell(ft); // climbs, cruises, descends
          const s = 0.85 + alt * 0.45;
          if (route) route.style.strokeDashoffset = String(1 - ft);
          if (plane) plane.setAttribute("transform", `translate(${x.toFixed(1)} ${(y - alt * 16).toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${s.toFixed(3)})`);
          if (shadow) shadow.setAttribute("transform", `translate(${(x + alt * 9).toFixed(1)} ${(y + alt * 12).toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${(s * 0.9).toFixed(3)} ${(s * 0.55).toFixed(3)})`);
          if (pulse) {
            const pr = 4 + ((p * 40) % 10);
            pulse.setAttribute("r", pr.toFixed(1));
            pulse.style.opacity = String(Math.max(0, 1 - (pr - 4) / 10));
          }
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
        style={{ position: "fixed", left: 22, bottom: 20, zIndex: 92, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 6 }}
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
      <div style={{ position: "fixed", inset: "-8%", zIndex: -2, background: "url('/assets/silk.jpg') center/cover no-repeat", filter: "saturate(1.04) brightness(1.02)", animation: "drape 30s ease-in-out infinite", transformOrigin: "60% 40%" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: "radial-gradient(120% 80% at 50% 0%, rgba(246,243,238,.35), transparent 60%)" }} />
      <div ref={lightRef} style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none", mixBlendMode: "screen", background: "radial-gradient(720px circle at 50% 30%, rgba(215,189,133,.08), transparent 60%)" }} />
      <div ref={bloomRef} style={{ position: "fixed", inset: 0, zIndex: 80, pointerEvents: "none", opacity: 0, background: "radial-gradient(circle at 50% 42%, rgba(255,251,240,.95), rgba(244,231,196,.5) 30%, transparent 70%)" }} />

      {/* butterflies — screen-blended so they read as living light on
          the dark scenes but melt away over the cream cards instead of
          sitting on top of the text */}
      <div ref={butterRef} style={{ position: "fixed", inset: 0, zIndex: 54, pointerEvents: "none", opacity: 0, transition: "opacity 1.6s ease", mixBlendMode: "screen" }}>
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
      <div ref={montageRef} style={{ position: "fixed", inset: 0, zIndex: 82, pointerEvents: "none", display: "none", opacity: 1, transition: "opacity .8s ease", background: "radial-gradient(circle at 50% 50%, rgba(24,22,38,.34), rgba(16,14,24,.68) 80%)" }}>
        {MEMORIES.map((m) => (
          <div key={m.slot} style={{ position: "absolute", left: "50%", top: "50%", ["--r" as string]: m.r, opacity: 0, width: "min(70vw,340px)", aspectRatio: "4/5", borderRadius: 6, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.6),0 0 0 2px rgba(216,189,133,.6),0 0 0 10px rgba(255,255,255,.06)", animation: `memflash .82s ease-out ${m.delay} both` }}>
            <AnimatedCharacter variant="couple" />
          </div>
        ))}
      </div>

      {/* NAV */}
      <nav ref={navRef} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px clamp(20px,5vw,64px)", opacity: 0, transition: "opacity 1.2s ease", pointerEvents: "none", background: "linear-gradient(180deg,rgba(20,18,30,.34),transparent)" }}>
        <a href="#hero" style={{ display: "flex", alignItems: "center" }}>
          <img src="/assets/HL.png" alt="H & L" style={{ display: "block", height: 36, width: "auto" }} />
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
          <span key={i} style={{ position: "absolute", top: p.top, left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: "rgba(236,228,205,.9)", ["--o" as string]: p.o, ["--dy" as string]: p.dy, ["--dx" as string]: p.dx, animation: `dust ${p.dur} linear ${p.delay} infinite`, filter: "blur(.4px)" }} />
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
          <button onClick={enter} ref={sealRef} style={{ position: "relative", zIndex: 3, width: 92, height: 92, border: "none", cursor: "pointer", borderRadius: "50%", background: "radial-gradient(circle at 38% 32%, #f4e6c0, #c9a35b 55%, #9a7636 100%)", animation: "sealGlow 3.4s ease-in-out infinite", transition: "transform 1s cubic-bezier(.19,1,.22,1),opacity .8s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 34, letterSpacing: ".02em", color: "#6b4f22", textShadow: "0 1px 1px rgba(255,255,255,.4)" }}>H<span style={{ fontSize: 22 }}>&amp;</span>L</span>
            <span style={{ position: "absolute", inset: 6, borderRadius: "50%", border: "1px solid rgba(107,79,34,.35)" }} />
          </button>
        </div>

        <p style={{ zIndex: 3, marginTop: 34, fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: ".5em", textTransform: "uppercase", color: "rgba(233,221,196,.82)", animation: "floaty 4s ease-in-out infinite" }}>Click the Seal to Begin</p>
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
      <section id="hero" className="snap-sect" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 90px", background: "radial-gradient(130% 100% at 50% 0%, rgba(246,244,250,.62) 0%, rgba(226,225,239,.48) 42%, rgba(215,215,234,.4) 100%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "12%", left: "8%", width: 2, height: 150, background: "linear-gradient(180deg,transparent,rgba(216,189,133,.5),transparent)", animation: "floatySlow 9s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "14%", right: "10%", width: 2, height: 120, background: "linear-gradient(180deg,transparent,rgba(216,189,133,.4),transparent)", animation: "floatySlow 11s ease-in-out infinite" }} />
        {/* petals drifting down through the hero */}
        {HERO_PETALS.map((p, i) => (
          <span key={i} aria-hidden style={{ position: "absolute", top: 0, left: p.left, width: p.s, height: p.s * 0.72, borderRadius: "60% 60% 60% 0", background: p.c, opacity: 0, ["--px" as string]: p.px, ["--pr" as string]: p.pr, animation: `petalFall ${p.dur} linear ${p.delay} infinite`, pointerEvents: "none", filter: "drop-shadow(0 2px 3px rgba(90,84,130,.25))" } as CSSProperties} />
        ))}
        <div data-reveal style={{ ...reveal(), fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: ".62em", textTransform: "uppercase", color: "#8a86a4", marginBottom: 26 }}>Together with their families</div>
        <div data-reveal data-reveal-delay="150" style={{ ...reveal(), position: "relative", width: "min(82vw,420px)", marginBottom: -8, animation: "floatySlow 10s ease-in-out infinite" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.webp" alt="" style={{ display: "block", width: "100%", filter: "drop-shadow(0 22px 42px rgba(90,84,130,.34))" }} />
        </div>
        <h1 data-reveal data-reveal-delay="300" className="gold-shimmer" style={{ ...reveal(), margin: "22px 0 4px", fontFamily: "'Pinyon Script',cursive", fontWeight: 400, fontSize: "clamp(42px,12vw,138px)", lineHeight: 0.92, ...goldText }}>Helson &amp; Luna</h1>
        <div data-reveal data-reveal-delay="450" style={{ ...reveal(), display: "flex", alignItems: "center", gap: 18, marginTop: 14, color: "#6d688a" }}>
          <span style={{ width: 52, height: 1, background: "linear-gradient(90deg,transparent,#c9a35b)" }} />
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, letterSpacing: ".36em", textTransform: "uppercase" }}>12 · 12 · 2026</span>
          <span style={{ width: 52, height: 1, background: "linear-gradient(270deg,transparent,#c9a35b)" }} />
        </div>
        <HeroCountdown />
        <div style={scrollCue}>Scroll<span style={{ width: 1, height: 40, background: "linear-gradient(180deg,#c9a35b,transparent)", animation: "floaty 2.4s ease-in-out infinite" }} /></div>
      </section>

      {/* SCENE 4 — COUPLE */}
      <section id="couple" className="snap-sect" style={{ position: "relative", padding: "clamp(96px,15vh,180px) 24px", background: "radial-gradient(100% 80% at 50% 8%, rgba(38,36,59,.9) 0%, rgba(30,28,48,.86) 45%, rgba(22,20,36,.92) 100%)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflow: "hidden" }}>
        {/* bridge: the hero's lavender light melts into this dusk */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, rgba(224,223,239,.42), transparent)" }} />
        <div style={{ position: "absolute", top: "-6%", left: "50%", transform: "translateX(-50%)", width: "70vw", height: "70vw", maxWidth: 820, maxHeight: 820, borderRadius: "50%", background: "radial-gradient(circle, rgba(216,189,133,.16), rgba(200,196,224,.06) 44%, transparent 68%)", pointerEvents: "none" }} />
        {fx?.sparkles.map((s, i) => (
          <span key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, pointerEvents: "none", background: "radial-gradient(circle,#f6eccf,rgba(216,189,133,0))", borderRadius: "50%", boxShadow: "0 0 8px 2px rgba(216,189,133,.6)", animation: `sparkle ${s.dur} ease-in-out ${s.delay} infinite` }} />
        ))}

        <div data-reveal className="couple-head" style={{ opacity: 0, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <span className="couple-line" style={{ width: 1, height: 52, background: "linear-gradient(180deg,transparent,#d8bd85)" }} />
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#e9d29a", transform: "rotate(45deg)", display: "inline-block", textShadow: "0 0 18px rgba(216,189,133,.7)" }}>✦</span>
          <span style={{ fontSize: 11, letterSpacing: ".62em", textTransform: "uppercase", color: "#c7bfe0" }}>Two Hearts · One Light</span>
        </div>
        <h2 data-reveal data-reveal-delay="140" className="couple-quote" style={{ opacity: 0, position: "relative", zIndex: 2, margin: "0 0 60px", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(26px,3.6vw,44px)", color: "#efe7d2", maxWidth: "18ch", lineHeight: 1.3 }}>Woven together by destiny, and sealed in gold.</h2>

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 760, width: "100%" }}>
          <div className="couple-crown" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#d8bd85", marginBottom: 14, textShadow: "0 0 14px rgba(216,189,133,.6)" }}>♛</div>
          {/* the couple within a majestic moving celestial scene */}
          <div data-reveal data-reveal-delay="120" className="couple-scene" style={{ opacity: 0, position: "relative", width: "min(94vw,760px)", aspectRatio: "16/11", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 1px rgba(216,189,133,.5),0 0 0 7px rgba(255,255,255,.05),0 40px 90px rgba(0,0,0,.55),0 0 70px rgba(216,189,133,.2)" }}>
            <EtherealScene />
          </div>
          <div data-reveal data-reveal-delay="240" className="couple-names" style={{ opacity: 0, marginTop: 28, fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(46px,10vw,78px)", lineHeight: 0.9, background: "linear-gradient(120deg,#c9a35b,#f6ecc4,#c9a35b)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 5s linear infinite" }}>Helson &amp; Luna</div>
          <div data-reveal data-reveal-delay="300" style={{ opacity: 0, fontSize: 10, letterSpacing: ".44em", textTransform: "uppercase", color: "#b7aecf", marginTop: 8 }}>The Groom &amp; The Bride</div>
        </div>

        <div data-reveal data-reveal-delay="240" className="couple-div" style={{ opacity: 0, position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 16, margin: "64px 0 22px", color: "#d8bd85" }}>
          <span style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#c9a35b)" }} />
          <span style={{ transform: "rotate(45deg)", textShadow: "0 0 14px rgba(216,189,133,.7)" }}>✦</span>
          <span style={{ width: 60, height: 1, background: "linear-gradient(270deg,transparent,#c9a35b)" }} />
        </div>
        <p data-reveal data-reveal-delay="240" className="couple-text" style={{ opacity: 0, position: "relative", zIndex: 2, maxWidth: "52ch", margin: "0 auto", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.75, color: "#e2dac6" }}>Under a lilac sky they found one another — and in every quiet moment since, chose each other again. Now they invite you to witness the promise they were always meant to make.</p>
      </section>

      {/* SCENE 5 — LOVE STORY */}
      <section id="story" ref={storyRef} style={{ position: "relative", height: "520vh", background: "linear-gradient(180deg,rgba(22,20,34,.62) 0%,rgba(26,23,42,.78) 50%,rgba(22,20,34,.62) 100%)" }}>
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
            </svg>
          </div>

          {/* ── Chapter 3 → 4: the flight — Philippines to Perth on a
                 perspective-tilted night chart, plane banking along the
                 route with its shadow far below ── */}
          <div ref={flightFxRef} aria-hidden style={{ position: "absolute", inset: 0, zIndex: 4, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, pointerEvents: "none", perspective: "900px" }}>
            <svg viewBox="0 0 600 400" style={{ width: "min(92vw,620px)", overflow: "visible", transform: "rotateX(26deg)", transformStyle: "preserve-3d", filter: "drop-shadow(0 18px 40px rgba(0,0,0,.4))" }}>
              <rect x="30" y="20" width="540" height="360" rx="14" fill="rgba(18,16,32,.55)" stroke="rgba(216,189,133,.3)" strokeWidth="1" />
              {/* faint graticule */}
              <path d="M30 110 H570 M30 200 H570 M30 290 H570 M150 20 V380 M300 20 V380 M450 20 V380" stroke="rgba(216,189,133,.08)" strokeWidth="1" />
              {/* Philippine archipelago, abstracted */}
              <g fill="rgba(216,189,133,.14)" stroke="rgba(233,210,154,.35)" strokeWidth=".8">
                <ellipse cx="447" cy="72" rx="9" ry="16" transform="rotate(12 447 72)" />
                <ellipse cx="436" cy="102" rx="5" ry="8" />
                <ellipse cx="454" cy="112" rx="6" ry="7" />
                <ellipse cx="446" cy="132" rx="10" ry="11" />
              </g>
              {/* Australia's west, abstracted */}
              <path d="M310 330 C 330 296 372 284 412 292 C 452 300 474 330 468 352 C 430 368 350 366 316 352 C 306 346 304 338 310 330 Z" fill="rgba(216,189,133,.12)" stroke="rgba(233,210,154,.3)" strokeWidth=".8" />
              {/* markers + labels */}
              <circle cx="445" cy="90" r="4" fill="#f6ecc4" />
              <circle data-flight-pulse cx="445" cy="90" r="4" fill="none" stroke="#f6ecc4" strokeWidth="1" />
              <text x="462" y="86" fill="#d8c9a3" fontSize="12" letterSpacing="2.5" fontFamily="Jost,sans-serif">PHILIPPINES</text>
              <circle cx="330" cy="334" r="4" fill="#f6ecc4" />
              <text x="230" y="360" fill="#d8c9a3" fontSize="12" letterSpacing="2.5" fontFamily="Jost,sans-serif">PERTH · AUSTRALIA</text>
              {/* the route, drawn on as the plane flies it */}
              <path data-flight-route d="M445 90 Q 250 150 330 334" fill="none" stroke="#e9d29a" strokeWidth="1.6" strokeDasharray="1" strokeDashoffset="1" pathLength={1} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px rgba(233,210,154,.8))" }} />
              {/* ground shadow, flattened + offset by altitude */}
              <path data-flight-shadow d="M0,-22 C2.5,-14 2.5,-4 2,2 L18,10 L18,14 L2,9 L1.6,16 L7,20 L7,23 L0,21 L-7,23 L-7,20 L-1.6,16 L-2,9 L-18,14 L-18,10 L-2,2 C-2.5,-4 -2.5,-14 0,-22 Z" fill="rgba(0,0,0,.35)" />
              {/* the plane, nose-up artwork rotated to the route tangent */}
              <g data-flight-plane>
                <path d="M0,-22 C2.5,-14 2.5,-4 2,2 L18,10 L18,14 L2,9 L1.6,16 L7,20 L7,23 L0,21 L-7,23 L-7,20 L-1.6,16 L-2,9 L-18,14 L-18,10 L-2,2 C-2.5,-4 -2.5,-14 0,-22 Z" fill="#f3ead6" stroke="#c9a35b" strokeWidth=".6" />
                <path d="M0,-16 L0,-2" stroke="#c9a35b" strokeWidth="1" opacity=".55" />
              </g>
            </svg>
          </div>

          <div style={{ position: "absolute", top: "clamp(30px,5vh,54px)", left: 0, right: 0, textAlign: "center", zIndex: 6, pointerEvents: "none" }}>
            <div className="gold-shimmer" style={{ fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(38px,5vw,62px)", lineHeight: 0.9, ...goldText }}>Our Story</div>
            <div style={{ marginTop: 8, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, letterSpacing: ".4em", color: "#c7bfe0" }}><span ref={counterRef} style={{ color: "#e9d29a" }}>01</span> &nbsp;/&nbsp; 04</div>
          </div>

          <div style={{ position: "absolute", left: "clamp(16px,5vw,64px)", top: "22%", bottom: "22%", width: 1, background: "rgba(216,189,133,.22)", zIndex: 6 }}>
            <div ref={progRef} style={{ position: "absolute", top: 0, left: -1.5, width: 4, height: "0%", background: "linear-gradient(180deg,#f6ecc4,#c9a35b)", boxShadow: "0 0 16px rgba(216,189,133,.85)", borderRadius: 3, transition: "height .12s linear" }} />
          </div>

          {STORY.map((c) => (
            <div key={c.i} data-ch={c.i} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(90vw,660px)", opacity: 0, textAlign: "center", willChange: "transform,opacity,filter" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, letterSpacing: ".52em", textTransform: "uppercase", color: "#d8bd85", marginBottom: 24, textShadow: "0 0 20px rgba(216,189,133,.4)" }}>{c.no}</div>
              <div style={{ position: "relative", width: "min(56vw,214px)", aspectRatio: "4/5", margin: "0 auto 32px", borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 2px rgba(216,189,133,.7),0 0 0 10px rgba(255,255,255,.05),0 26px 60px rgba(0,0,0,.5),0 0 56px rgba(216,189,133,.22)", animation: "floatySlow 12s ease-in-out infinite" }}>
                <StoryEmblem chapter={c.i} />
              </div>
              <h3 style={{ margin: "0 0 20px", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(34px,5.4vw,60px)", color: "#f2ead4", lineHeight: 1.08 }}>{c.title}</h3>
              <p style={{ margin: "0 auto", maxWidth: "40ch", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(18px,2.3vw,23px)", lineHeight: 1.75, color: "#d6cebc" }}>{c.body}</p>
            </div>
          ))}

          <div style={{ position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)", zIndex: 6, fontSize: 10, letterSpacing: ".42em", textTransform: "uppercase", color: "#b7aecf", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none" }}>Scroll to unfold<span style={{ width: 1, height: 34, background: "linear-gradient(180deg,#c9a35b,transparent)", animation: "floaty 2.4s ease-in-out infinite" }} /></div>
        </div>
      </section>

      {/* SCENE 6 — DETAILS */}
      <section id="details" className="snap-sect" style={{ position: "relative", padding: "clamp(90px,14vh,160px) 24px", background: "radial-gradient(120% 80% at 50% 0%, rgba(244,239,232,.74) 0%, rgba(236,231,226,.6) 55%, rgba(230,223,218,.5) 100%)", overflow: "hidden" }}>
        {/* bridge: dusk melting into daylight — kept short so the
            section label never sinks into the dark band on phones */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, rgba(23,20,34,.8), transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
          <div data-reveal style={{ ...reveal(), fontSize: 11, letterSpacing: ".56em", textTransform: "uppercase", color: "#7c6a4d", textShadow: "0 1px 6px rgba(255,255,255,.5)", marginBottom: 14 }}>The Celebration</div>
          <h2 data-reveal data-reveal-delay="120" className="gold-shimmer details-title" style={{ ...reveal(), margin: "0 0 56px", fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(38px,7vw,80px)", ...goldTextDark }}>Wedding Details</h2>
          <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 26 }}>
            {details.map((d) => (
              <div key={d.label} data-reveal data-reveal-style="flip" data-reveal-delay={String(d.delay)} className="lux-card" style={{ ...reveal(), position: "relative", padding: "44px 26px 38px", borderRadius: 6, background: "linear-gradient(180deg,#fbf8f3,#f3ede4)", boxShadow: "0 20px 46px rgba(120,105,80,.16),inset 0 0 0 1px rgba(216,189,133,.35),inset 0 0 0 6px rgba(255,255,255,.5)" }}>
                <div className="det-icon" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#c9a35b", marginBottom: 14 }}>{d.icon}</div>
                <div className="det-divider" style={{ width: 34, height: 1, background: "#d8bd85", margin: "0 auto 18px" }} />
                <div className="det-label" style={{ fontSize: 10, letterSpacing: ".4em", textTransform: "uppercase", color: "#a99a80", marginBottom: 10 }}>{d.label}</div>
                <div className="det-title" style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 24, color: "#4a4468", lineHeight: 1.3 }}>{d.title}</div>
                <div className="det-sub" style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 17, color: "#7a7392", marginTop: 6 }}>{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCENE 7 — VENUE */}
      <section id="venue" className="snap-sect" style={{ position: "relative", padding: "clamp(90px,14vh,160px) 24px", background: "linear-gradient(180deg,rgba(241,238,244,.92) 0%,rgba(228,226,240,.88) 100%)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "clamp(30px,5vw,68px)", alignItems: "center", justifyContent: "center" }}>
          <div data-reveal style={{ ...reveal(), flex: "1 1 300px", minWidth: 280 }}>
            <div style={{ fontSize: 11, letterSpacing: ".56em", textTransform: "uppercase", color: "#6a6486", marginBottom: 16 }}>The Venue</div>
            <h2 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',serif", fontWeight: 400, fontSize: "clamp(34px,5vw,58px)", color: "#3d3860", lineHeight: 1.05 }}>Diversion 21</h2>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: 22, color: "#574f74", marginBottom: 26 }}>Iloilo City, Philippines</div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 18, lineHeight: 1.75, color: "#4e4a68", maxWidth: "42ch" }}>Follow the golden path to an evening of candlelight and quiet wonder. Ceremony at half past three, followed by dinner beneath the stars.</p>
            <a href="https://maps.google.com/?q=Diversion+21+Iloilo+City" target="_blank" rel="noopener" className="lux-btn" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 30, padding: "14px 30px", borderRadius: 100, border: "1px solid rgba(201,163,91,.7)", fontSize: 11, letterSpacing: ".32em", textTransform: "uppercase", color: "#a9853f" }}>Open in Maps →</a>
          </div>
          <div data-reveal data-reveal-style="mask" data-reveal-delay="200" style={{ ...reveal(), flex: "1 1 320px", minWidth: 300 }}>
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", boxShadow: "0 30px 60px rgba(90,84,130,.26),inset 0 0 0 1px rgba(216,189,133,.4),inset 0 0 0 7px rgba(255,255,255,.55)", background: "linear-gradient(160deg,#eef0f5,#e4e6f0)" }}>
              <svg viewBox="0 0 400 300" style={{ display: "block", width: "100%", height: "auto" }}>
                <rect width="400" height="300" fill="#eceef4" />
                <path d="M0 210 H400 M0 150 H400 M120 0 V300 M260 0 V300" stroke="#d7d9e6" strokeWidth="6" fill="none" />
                <path d="M40 260 C110 220 120 150 200 140 S300 90 350 50" stroke="#c9a35b" strokeWidth="3" fill="none" strokeDasharray="7 9" strokeLinecap="round" style={{ strokeDashoffset: 520, animation: "dash 3.6s ease-out forwards .3s" }} />
                <circle cx="40" cy="260" r="7" fill="#b8935a" />
                <g transform="translate(350 50)">
                  <path d="M0 -4 C10 -4 14 4 8 12 L0 24 L-8 12 C-14 4 -10 -4 0 -4 Z" fill="#c9a35b" />
                  <circle cx="0" cy="6" r="4.5" fill="#fbf6ea" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 9 — RSVP */}
      <section id="rsvp" className="snap-sect" style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(40px,6vh,150px) 20px", boxSizing: "border-box", background: "radial-gradient(120% 90% at 50% 10%, rgba(239,234,243,.6) 0%, rgba(228,226,239,.46) 55%, rgba(216,215,234,.4) 100%)", overflow: "hidden" }}>
        <RsvpForm />
      </section>

      {/* SCENE 10 — CLOSING */}
      <section className="snap-sect" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px", background: "radial-gradient(130% 100% at 50% 30%, #26243b 0%, #17152300 0%, #100e18 100%),linear-gradient(180deg,#1b1930,#100e18)", overflow: "hidden" }}>
        {/* bridge: the last daylight fading into the final night */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 150, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, rgba(221,219,236,.4), transparent)" }} />
        <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: "44vw", height: "44vw", maxWidth: 520, maxHeight: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(240,236,224,.16),transparent 66%)" }} />
        {fx?.stars.map((s, i) => (
          <span key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: "50%", background: "#f3ecd8", animation: `twinkle ${s.dur} ease-in-out ${s.delay} infinite` }} />
        ))}
        {fx?.fireflies.map((f, i) => (
          <span key={i} style={{ position: "absolute", top: f.top, left: f.left, width: 5, height: 5, borderRadius: "50%", background: "#f0d99a", boxShadow: "0 0 10px 3px rgba(240,217,154,.7)", ["--fx" as string]: f.fx, ["--fy" as string]: f.fy, animation: `firefly ${f.dur} ease-in-out ${f.delay} infinite` }} />
        ))}
        <div data-reveal style={{ opacity: 0, transform: "translateY(38px)", position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(24px,4vw,40px)", lineHeight: 1.6, color: "#e6dcc4", maxWidth: "20ch", margin: "0 auto" }}>&ldquo;And in the hush of the stars, forever began.&rdquo;</div>
          <div style={{ margin: "44px auto 0", width: 60, height: 1, background: "linear-gradient(90deg,transparent,#c9a35b,transparent)" }} />
          <div className="gold-shimmer" style={{ marginTop: 44, fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(42px,10vw,110px)", ...goldText }}>Helson &amp; Luna</div>
          <div style={{ marginTop: 14, fontSize: 11, letterSpacing: ".5em", textTransform: "uppercase", color: "#a49f8a" }}>12 December 2026 · Iloilo City</div>
        </div>
      </section>
    </div>
  );
}
