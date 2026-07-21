"use client";

import { useCallback, useMemo } from "react";
import { Particles, ParticlesProvider, type ParticlesPluginRegistrar } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

/**
 * Ambient floating light motes for the opening scene — moonlit dust
 * drifting slowly upward. Deliberately sparse and slow so it reads as
 * atmosphere, not a "particle effect".
 */
export function ParticleField({ dense = false }: { dense?: boolean }) {
  const init = useCallback<ParticlesPluginRegistrar>(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: dense ? 70 : 40,
          density: { enable: true, width: 1600, height: 900 },
        },
        color: { value: ["#d8be86", "#cfae70", "#f9fafc"] },
        opacity: {
          value: { min: 0.08, max: 0.55 },
          animation: { enable: true, speed: 0.4, sync: false, startValue: "random" },
        },
        size: { value: { min: 0.6, max: 2.2 } },
        move: {
          enable: true,
          speed: { min: 0.15, max: 0.5 },
          direction: "top",
          straight: false,
          random: true,
          outModes: { default: "out", top: "out", bottom: "out" },
        },
        shape: { type: "circle" },
      },
      interactivity: {
        events: { onHover: { enable: false }, onClick: { enable: false } },
      },
    }),
    [dense],
  );

  return (
    <ParticlesProvider init={init}>
      <Particles
        id="tsparticles-ambient"
        options={options}
        className="pointer-events-none absolute inset-0"
      />
    </ParticlesProvider>
  );
}
