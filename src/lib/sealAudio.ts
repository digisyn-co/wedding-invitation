/**
 * Synthesized sound design for the invitation — no audio assets
 * required. Everything is WebAudio: a barely-there ambient pad that
 * hums while sound is on, and a golden "swell" for the seal-break —
 * a soft bell arpeggio over a shimmer of filtered noise, tuned to
 * feel like light rather than a sound effect.
 *
 * Autoplay-safe: nothing is constructed until `unlock()` runs inside
 * a user gesture (the SOUND toggle / seal click).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let muted = true;

function ensureContext() {
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    typeof window !== "undefined"
      ? window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  return ctx;
}

/** Call from a user gesture. Creates/resumes the context. */
export function unlock() {
  const c = ensureContext();
  if (c && c.state === "suspended") void c.resume();
}

export function isMuted() {
  return muted;
}

/** Fade the master bus; starts/stops the ambient pad accordingly. */
export function setMuted(next: boolean) {
  muted = next;
  const c = ensureContext();
  if (!c || !master) return;
  const t = c.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(next ? 0 : 1, t + 1.2);
  if (!next && ambientNodes.length === 0) startAmbient();
}

/** A quiet two-voice drone with slow detune movement — moonlight hum. */
function startAmbient() {
  const c = ensureContext();
  if (!c || !master) return;
  const chord = [146.83, 220.0, 293.66]; // D3, A3, D4
  chord.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    lfo.type = "sine";
    lfo.frequency.value = 0.06 + i * 0.021;
    lfoGain.gain.value = freq * 0.0035; // gentle drift, never vibrato
    lfo.connect(lfoGain).connect(osc.frequency);
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.014 / (i + 1), c.currentTime + 4);
    osc.connect(gain).connect(master!);
    osc.start();
    lfo.start();
    ambientNodes.push({ osc, gain });
  });
}

/** One bell partial-stack note with exponential decay. */
function bell(c: AudioContext, out: AudioNode, freq: number, when: number, vol: number) {
  [1, 2.76, 5.4].forEach((partial, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * partial;
    const v = vol / Math.pow(3.2, i);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(v, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 2.6 - i * 0.5);
    osc.connect(gain).connect(out);
    osc.start(when);
    osc.stop(when + 2.8);
  });
}

/**
 * The seal-break swell: rising shimmer (band-passed noise sweeping
 * upward) crowned by a D-major bell arpeggio. ~3s, self-cleaning.
 */
export function playSwell() {
  const c = ensureContext();
  if (!c || !master || muted) return;
  const t = c.currentTime + 0.03;

  // — shimmer: noise through a rising bandpass, swelling then gone —
  const dur = 2.8;
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 9;
  bp.frequency.setValueAtTime(900, t);
  bp.frequency.exponentialRampToValueAtTime(7500, t + dur);
  const nGain = c.createGain();
  nGain.gain.setValueAtTime(0, t);
  nGain.gain.linearRampToValueAtTime(0.05, t + 0.9);
  nGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  noise.connect(bp).connect(nGain).connect(master);
  noise.start(t);
  noise.stop(t + dur);

  // — the bells: D5 · F#5 · A5 · D6, unhurried —
  const notes = [587.33, 739.99, 880.0, 1174.66];
  notes.forEach((f, i) => bell(c, master!, f, t + 0.55 + i * 0.22, 0.11));
}
