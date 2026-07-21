"use client";

import { useCallback, useRef, useState } from "react";
import { ParticleField } from "@/components/ParticleField";
import { MoonlightGlow } from "@/components/MoonlightGlow";
import { WaxSeal } from "@/components/WaxSeal";
import { SoundToggle } from "@/components/SoundToggle";
import { InvitationReveal } from "@/sections/InvitationReveal";
import { createSealBreakTimeline } from "@/animations/sealTimeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSound } from "@/hooks/useSound";

type Stage = "idle" | "breaking" | "opened";

/**
 * The full opening experience: dark ambient scene -> wax-sealed
 * envelope -> the signature seal-break interaction -> the invitation
 * rising into view. Owns every ref the break timeline animates so the
 * sequencing logic itself lives in `animations/sealTimeline.ts`.
 */
export function OpeningScene() {
  const [stage, setStage] = useState<Stage>("idle");
  const [bloomed, setBloomed] = useState(false);
  const reduced = useReducedMotion();
  const { muted, toggleMute, swell } = useSound(/* pass a track src once you have one */);

  const sceneRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const burstLayerRef = useRef<HTMLDivElement>(null);
  const ribbonLeftRef = useRef<HTMLDivElement>(null);
  const ribbonRightRef = useRef<HTMLDivElement>(null);
  const envelopeFlapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const monogramWrapRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<HTMLDivElement>(null);
  const instructionRef = useRef<HTMLParagraphElement>(null);

  const handleBreak = useCallback(() => {
    if (stage !== "idle") return;
    setStage("breaking");

    const seal = sealRef.current;
    const scene = sceneRef.current;
    const burstLayer = burstLayerRef.current;
    const ribbonLeft = ribbonLeftRef.current;
    const ribbonRight = ribbonRightRef.current;
    const envelopeFlap = envelopeFlapRef.current;
    const card = cardRef.current;
    const monogramWrap = monogramWrapRef.current;
    const foilSheen = foilRef.current;
    const instruction = instructionRef.current;

    if (
      !seal ||
      !scene ||
      !burstLayer ||
      !ribbonLeft ||
      !ribbonRight ||
      !envelopeFlap ||
      !card ||
      !monogramWrap ||
      !foilSheen ||
      !instruction
    ) {
      setStage("opened");
      return;
    }

    const crackPaths = Array.from(seal.querySelectorAll<SVGPathElement>("[data-crack]"));
    const monogramChars = Array.from(monogramWrap.children) as HTMLElement[];

    createSealBreakTimeline(
      {
        scene,
        sealButton: seal,
        crackPaths,
        burstLayer,
        ribbonLeft,
        ribbonRight,
        envelopeFlap,
        card,
        monogramChars,
        foilSheen,
        instruction,
      },
      {
        onFlowersBloom: () => setBloomed(true),
        onMusicSwell: () => swell(),
        onComplete: () => setStage("opened"),
      },
      reduced,
    );
  }, [stage, reduced, swell]);

  return (
    <div
      ref={sceneRef}
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-twilight-975 px-4 py-12"
    >
      <ParticleField />
      <MoonlightGlow />

      <SoundToggle muted={muted} onToggle={toggleMute} className="absolute right-4 top-4 z-20" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative aspect-[3/4.3] w-[86vw] max-w-[380px]">
          {/* envelope body, visible as the border around the card until opened */}
          <div className="absolute inset-0 rounded-[3px] bg-gradient-to-b from-twilight-900 to-twilight-950 shadow-[0_25px_70px_rgba(0,0,0,0.6)]" />

          <InvitationReveal
            ref={cardRef}
            monogramWrapRef={monogramWrapRef}
            foilRef={foilRef}
            bloomed={bloomed}
          />

          {/* envelope flap — folds open on break */}
          <div
            ref={envelopeFlapRef}
            className="absolute left-0 right-0 top-0 z-20 h-[58%] origin-top"
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div
              className="h-full w-full"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)",
                background:
                  "linear-gradient(160deg, #2e2a40 0%, #201d30 55%, #17141f 100%)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            />
          </div>

          {/* ribbon */}
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div
              ref={ribbonLeftRef}
              className="absolute h-3 w-1/2 origin-right bg-gradient-to-r from-antique-gold to-champagne-gold"
              style={{ right: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
            />
            <div
              ref={ribbonRightRef}
              className="absolute h-3 w-1/2 origin-left bg-gradient-to-l from-antique-gold to-champagne-gold"
              style={{ left: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
            />
          </div>

          {/* seal */}
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <div ref={burstLayerRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
              <WaxSeal ref={sealRef} onActivate={handleBreak} disabled={stage !== "idle"} />
            </div>
          </div>
        </div>

        <p
          ref={instructionRef}
          className="font-display text-sm uppercase tracking-[0.35em] text-champagne-gold/80"
        >
          Click the Wax Seal
        </p>
      </div>
    </div>
  );
}
