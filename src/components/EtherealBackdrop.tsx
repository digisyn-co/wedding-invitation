"use client";

import { useEffect, useRef } from "react";

/**
 * The ethereal deep-space backdrop for the arrival scene — replaces
 * the old YouTube iframe with a hand-written WebGL shader in the
 * spirit of medhatalkadri.com: a living night sky of procedural
 * stars (three parallax depths, gentle twinkle, a few warm gold ones
 * among the blue-white) beneath domain-warped nebula clouds in
 * ethereal blues with a whisper of wedding lilac.
 *
 * Costs a fraction of what the iframe did: one quad, one fragment
 * shader, rendered at reduced internal resolution (noise upscales
 * invisibly), paused when the tab is hidden. Runs happily on phones.
 */

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x),
             mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<4;i++){ v += a*noise(p); p = p*2.03 + vec2(17.1, 9.2); a *= 0.5; }
  return v;
}

/* one parallax layer of stars: sparse cells, sub-cell placement, twinkle */
vec3 stars(vec2 p, float density, float drift, float t){
  vec2 q = p*density + vec2(t*drift, t*drift*0.6);
  vec2 g = floor(q), f = fract(q);
  float r = hash(g);
  float sel = smoothstep(0.78, 1.0, r);            // most cells stay empty
  vec2 pos = vec2(hash(g+1.3), hash(g+2.7))*0.8 + 0.1;
  float d = length(f - pos);
  float core = smoothstep(0.10, 0.0, d);
  float halo = smoothstep(0.35, 0.0, d)*0.25;
  float tw = 0.55 + 0.45*sin(t*(1.5+r*2.5) + r*40.0);
  float gold = step(0.965, hash(g+5.1));           // a few warm ones
  vec3 tint = mix(vec3(0.82,0.90,1.0), vec3(1.0,0.86,0.58), gold);
  return tint * (core + halo) * tw * sel;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;  // aspect-correct
  float t = uTime;
  vec2 m = uMouse*0.03;

  /* — deep twilight base with a faint crown of light up top — */
  vec3 col = mix(vec3(0.031,0.043,0.078), vec3(0.066,0.078,0.125), uv.y);
  col += vec3(0.05,0.06,0.10) * smoothstep(1.1, 0.0, length(p - vec2(0.0, 0.62)));

  /* — nebulae: domain-warped fbm, masked into corners like a real sky — */
  vec2 np = p*1.35 + m*0.6 + vec2(t*0.012, -t*0.008);
  float w1 = fbm(np*1.8 + vec2(t*0.02, 0.0));
  float w2 = fbm(np*1.8 - vec2(0.0, t*0.016));
  float neb = fbm(np*2.2 + 1.6*vec2(w1, w2));
  float shape = smoothstep(0.48, 0.95, neb);

  float mBlue  = smoothstep(1.25, 0.15, length(p - vec2( 0.72, 0.42)));
  float mLilac = smoothstep(1.15, 0.10, length(p - vec2(-0.68,-0.38)));
  float mHeart = smoothstep(1.35, 0.30, length(p)) * 0.35;

  col += vec3(0.13,0.30,0.52) * shape * mBlue  * 0.85;   // ethereal blue
  col += vec3(0.30,0.22,0.46) * shape * mLilac * 0.65;   // wedding lilac
  col += vec3(0.10,0.18,0.34) * shape * mHeart;          // faint central breath

  /* — three star depths, drifting at different rates (parallax) — */
  vec2 sp = p + m;
  col += stars(sp,           34.0, 0.0016, t) * 0.9;
  col += stars(sp*1.7 + 3.1, 52.0, 0.0034, t) * 0.55;
  col += stars(sp*2.6 + 7.7, 78.0, 0.0060, t) * 0.32;

  /* — vignette so the crest and seal stay the heroes — */
  col *= 1.0 - 0.42*smoothstep(0.45, 1.25, length(p));

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export function EtherealBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // no WebGL → the overlay's gradient stands alone

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const SCALE = coarse ? 0.4 : 0.55; // noise upscales invisibly

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // pointer parallax (lerped so it glides, never jumps)
    let mx = 0, my = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!coarse) window.addEventListener("mousemove", onMove);

    let raf = 0;
    let running = true;
    const t0 = performance.now();
    const frame = () => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      cx += (mx - cx) * 0.04;
      cy += (my - cy) * 0.04;
      gl.uniform1f(uTime, reduced ? 0 : (performance.now() - t0) / 1000);
      gl.uniform2f(uMouse, cx, cy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (reduced) running = false; // one still frame is enough
    };
    frame();

    const onVis = () => {
      const hidden = document.hidden;
      if (hidden && running) { running = false; cancelAnimationFrame(raf); }
      else if (!hidden && !running && !reduced) { running = true; frame(); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}
