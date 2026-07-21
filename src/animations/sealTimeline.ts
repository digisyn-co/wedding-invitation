import gsap from "gsap";

export interface SealBreakRefs {
  scene: HTMLElement;
  sealButton: HTMLButtonElement;
  crackPaths: SVGPathElement[];
  burstLayer: HTMLDivElement;
  ribbonLeft: HTMLElement;
  ribbonRight: HTMLElement;
  envelopeFlap: HTMLElement;
  card: HTMLElement;
  monogramChars: HTMLElement[];
  foilSheen: HTMLElement;
  instruction: HTMLElement;
}

export interface SealBreakCallbacks {
  onFlowersBloom?: () => void;
  onMusicSwell?: () => void;
  onComplete?: () => void;
}

/** Spawns N short-lived DOM fragments bursting outward from the seal's
 *  center, used for both the wax shards and the gold dust — kept as
 *  cheap absolutely-positioned divs rather than a canvas/WebGL layer
 *  since the burst lasts well under a second. */
function spawnBurst(
  layer: HTMLDivElement,
  {
    count,
    build,
  }: {
    count: number;
    build: (el: HTMLDivElement, index: number) => gsap.TweenVars;
  },
) {
  const nodes: HTMLDivElement[] = [];
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.left = "50%";
    el.style.top = "50%";
    el.style.willChange = "transform, opacity";
    layer.appendChild(el);
    nodes.push(el);
    const vars = build(el, i);
    gsap.set(el, { xPercent: -50, yPercent: -50, ...vars.immediate });
  }
  return nodes;
}

/**
 * Builds (but does not play) the full cinematic "break the seal"
 * sequence: compression -> crack -> wax shards + gold dust -> seal
 * falls away -> ribbon unties -> envelope opens -> invitation rises
 * and unfolds -> florals bloom -> foil catches the light -> camera
 * pushes in -> monogram reveals letter by letter.
 */
export function createSealBreakTimeline(
  refs: SealBreakRefs,
  { onFlowersBloom, onMusicSwell, onComplete }: SealBreakCallbacks,
  reduced: boolean,
) {
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete,
  });

  if (reduced) {
    // Respect prefers-reduced-motion: cut straight to the revealed
    // state with simple fades, no motion/physics.
    tl.to(refs.instruction, { opacity: 0, duration: 0.2 })
      .set(refs.sealButton, { opacity: 0 })
      .set([refs.ribbonLeft, refs.ribbonRight], { opacity: 0 })
      .set(refs.envelopeFlap, { opacity: 0 })
      .call(() => onFlowersBloom?.())
      .to(refs.card, { opacity: 1, duration: 0.4 })
      .to(refs.monogramChars, { opacity: 1, duration: 0.4 })
      .call(() => onMusicSwell?.());
    return tl;
  }

  tl.to(refs.instruction, { opacity: 0, y: -6, duration: 0.25 }, 0)

    // 1. compress
    .to(refs.sealButton, { scale: 0.9, duration: 0.15, ease: "power2.in" }, 0.05)

    // 2. crack lines draw in with a small wobble
    .to(
      refs.crackPaths,
      { strokeDashoffset: 0, duration: 0.35, ease: "power1.out", stagger: 0.04 },
      0.2,
    )
    .to(refs.sealButton, { rotate: -2, duration: 0.08, yoyo: true, repeat: 3 }, 0.2)

    // 3. wax shards burst outward + fall with rotation
    .call(
      () => {
        spawnBurst(refs.burstLayer, {
          count: 14,
          build: (el) => {
            el.style.width = `${gsap.utils.random(4, 9)}px`;
            el.style.height = el.style.width;
            el.style.background = "linear-gradient(135deg,#cfae70,#b88a4a)";
            el.style.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
            const angle = gsap.utils.random(0, 360);
            const dist = gsap.utils.random(40, 130);
            gsap.to(el, {
              x: Math.cos((angle * Math.PI) / 180) * dist,
              y: Math.sin((angle * Math.PI) / 180) * dist + 60,
              rotate: gsap.utils.random(-180, 180),
              opacity: 0,
              duration: gsap.utils.random(0.6, 0.95),
              ease: "power2.in",
              onComplete: () => el.remove(),
            });
            return { immediate: { opacity: 1 } };
          },
        });
        // 4. gold dust radiates alongside the shards
        spawnBurst(refs.burstLayer, {
          count: 26,
          build: (el) => {
            el.style.width = `${gsap.utils.random(2, 4)}px`;
            el.style.height = el.style.width;
            el.style.borderRadius = "9999px";
            el.style.background = "#d8be86";
            el.style.boxShadow = "0 0 6px 1px rgba(216,190,134,0.8)";
            const angle = gsap.utils.random(0, 360);
            const dist = gsap.utils.random(50, 170);
            gsap.to(el, {
              x: Math.cos((angle * Math.PI) / 180) * dist,
              y: Math.sin((angle * Math.PI) / 180) * dist,
              scale: 0,
              opacity: 0,
              duration: gsap.utils.random(0.8, 1.3),
              ease: "power1.out",
              onComplete: () => el.remove(),
            });
            return { immediate: { opacity: 1, scale: 1 } };
          },
        });
      },
      undefined,
      0.55,
    )

    // 5. the broken seal itself tumbles away
    .to(
      refs.sealButton,
      { scale: 0.4, opacity: 0, rotate: -18, y: 30, duration: 0.45, ease: "power2.in" },
      0.6,
    )

    // 6. ribbon unties and falls from both sides
    .to(
      refs.ribbonLeft,
      { rotate: -75, x: -50, y: 30, opacity: 0, duration: 0.6, ease: "power3.out" },
      0.75,
    )
    .to(
      refs.ribbonRight,
      { rotate: 75, x: 50, y: 30, opacity: 0, duration: 0.6, ease: "power3.out" },
      0.75,
    )

    // 7. envelope flap opens
    .to(
      refs.envelopeFlap,
      { rotateX: -160, duration: 0.85, ease: "expo.out", transformPerspective: 900 },
      0.95,
    )

    // 8. invitation rises and unfolds
    .fromTo(
      refs.card,
      { y: 36, scale: 0.93, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 1.05, ease: "expo.out" },
      1.15,
    )

    // 9. florals bloom (delegated to React/Motion state)
    .call(() => onFlowersBloom?.(), undefined, 1.5)

    // 10. gold foil catches the light, sweeping across the frame
    .fromTo(
      refs.foilSheen,
      { backgroundPositionX: "-150%" },
      { backgroundPositionX: "150%", duration: 1.3, ease: "power1.inOut" },
      1.6,
    )

    // 11. camera pushes in, subtly
    .to(refs.scene, { scale: 1.05, duration: 1.6, ease: "power1.inOut" }, 1.15)

    // 12. monogram initials reveal letter by letter
    .fromTo(
      refs.monogramChars,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" },
      1.85,
    )
    .call(() => onMusicSwell?.(), undefined, 0.75);

  return tl;
}
