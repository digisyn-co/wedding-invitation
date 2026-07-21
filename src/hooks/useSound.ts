"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

/**
 * Thin Howler wrapper for the ambient score. Starts muted (autoplay
 * policies + courtesy to the visitor); the seal-open gesture is a
 * genuine user interaction, so it's the only place playback begins.
 * No audio file ships by default — pass `src` once you have a track;
 * until then this hook is a safe no-op.
 */
export function useSound(src?: string) {
  const howlRef = useRef<Howl | null>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src) return;
    const howl = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      html5: true,
      onload: () => setReady(true),
    });
    howlRef.current = howl;
    return () => {
      howl.unload();
    };
  }, [src]);

  const swell = useCallback(
    (targetVolume = 0.5, duration = 2500) => {
      const howl = howlRef.current;
      if (!howl || !ready || muted) return;
      if (!howl.playing()) howl.play();
      howl.fade(0, targetVolume, duration);
    },
    [ready, muted],
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      const howl = howlRef.current;
      if (howl) {
        if (next) {
          howl.fade(howl.volume(), 0, 400);
        } else if (howl.playing()) {
          howl.fade(0, 0.5, 800);
        }
      }
      return next;
    });
  }, []);

  return { muted, ready: ready || !src, toggleMute, swell };
}
