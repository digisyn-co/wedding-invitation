"use client";

import { useEffect, useState } from "react";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function diff(target: number): TimeLeft {
  const now = Date.now();
  const delta = Math.max(0, target - now);
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta / 3_600_000) % 24),
    minutes: Math.floor((delta / 60_000) % 60),
    seconds: Math.floor((delta / 1000) % 60),
    done: delta === 0,
  };
}

/**
 * Live countdown to an ISO date. Returns null on the first render so
 * server and client markup match (avoids hydration mismatch), then
 * ticks once per second on the client.
 */
export function useCountdown(dateISO: string): TimeLeft | null {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(dateISO).getTime();
    setTime(diff(target));
    const id = window.setInterval(() => setTime(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [dateISO]);

  return time;
}
