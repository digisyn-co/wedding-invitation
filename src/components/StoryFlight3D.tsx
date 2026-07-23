"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface StoryFlightHandle {
  /** Drive the flight with the chapter-transition progress (0…1). */
  update(t: number): void;
}

interface Key {
  t: number; x: number; y: number; s: number;
  yaw: number; pitch: number; roll: number; o: number;
}

/**
 * The chapter 3 → 4 flight, flown by a real 3D airliner (Three.js,
 * built from PBR primitives — white fuselage, swept wings with gold
 * winglets, twin engines, gold tail — lit by a PMREM environment so
 * the livery catches light as it banks).
 *
 * Choreography, scrubbed by scroll (fully reversible):
 *   takeoff from center → climb, bank, exit RIGHT →
 *   (unseen transit) → re-enter LEFT, descend →
 *   flare → touch down at center as Chapter 4 arrives.
 *
 * Renders only when update() is called (no idle rAF loop) — costs
 * nothing outside the transition.
 */
export const StoryFlight3D = forwardRef<StoryFlightHandle>(function StoryFlight3D(_, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<StoryFlightHandle>({ update: () => {} });

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const mount = mountRef.current;
      if (disposed || !mount) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return; // no WebGL — the transition simply shows labels
      }
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
      renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, (mount.clientWidth || 1) / (mount.clientHeight || 1), 0.1, 100);
      camera.position.set(0, 0, 16);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const key = new THREE.DirectionalLight(0xfff2d8, 2.2);
      key.position.set(4, 6, 8);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xcdbfe0, 0.8);
      fill.position.set(-5, -2, 6);
      scene.add(fill);

      // ── the airliner (forward = +X) ─────────────────────────────
      const white = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, metalness: 0.25, roughness: 0.28, envMapIntensity: 1.15 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xc9a35b, metalness: 0.95, roughness: 0.22, envMapIntensity: 1.4 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x1d2334, metalness: 0.3, roughness: 0.35 });
      const doubleWhite = white.clone();
      doubleWhite.side = THREE.DoubleSide;
      const geos: { dispose(): void }[] = [];
      const G = <T extends { dispose(): void }>(g: T) => (geos.push(g), g);

      const plane = new THREE.Group();

      // fuselage — capsule laid along X, tapered tail cone behind
      const fus = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.55, 5.6, 8, 24)), white);
      fus.rotation.z = -Math.PI / 2;
      plane.add(fus);
      const tailCone = new THREE.Mesh(G(new THREE.ConeGeometry(0.42, 1.5, 20)), white);
      tailCone.rotation.z = Math.PI / 2;
      tailCone.position.set(-3.4, 0.08, 0);
      tailCone.scale.y = 1;
      plane.add(tailCone);

      // cockpit windshield
      const glass = new THREE.Mesh(G(new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)), dark);
      glass.rotation.z = -Math.PI / 2.6;
      glass.position.set(2.55, 0.18, 0);
      glass.scale.set(1, 0.7, 0.85);
      plane.add(glass);

      // swept wings — shape drawn in XY (X = chord, Y = span), rotated
      // so the span lies along ±Z. rotation.x = ±90° maps +Y→±Z cleanly;
      // no negative scaling, so normals stay honest.
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0.95, 0);
      wingShape.lineTo(-0.65, 0);
      wingShape.lineTo(-2.15, 3.85);
      wingShape.lineTo(-1.55, 3.95);
      wingShape.closePath();
      const wingGeo = G(new THREE.ExtrudeGeometry(wingShape, { depth: 0.09, bevelEnabled: false }));
      const mkWing = (side: 1 | -1) => {
        const w = new THREE.Mesh(wingGeo, doubleWhite);
        w.rotation.x = (side * Math.PI) / 2; // span → ±Z (low wing)
        const holder = new THREE.Group();
        holder.add(w);
        holder.position.set(0.3, -0.15, 0);
        holder.rotation.x = side * -0.07; // dihedral: tips gently up
        // gold winglet at the tip
        const wl = new THREE.Mesh(G(new THREE.BoxGeometry(0.42, 0.5, 0.05)), gold);
        wl.position.set(-1.75, 0.22, side * 3.8);
        wl.rotation.x = side * 0.45; // canted outward
        holder.add(wl);
        return holder;
      };
      plane.add(mkWing(1), mkWing(-1));

      // engines slung under each wing
      ([1, -1] as const).forEach((side) => {
        const eng = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.26, 0.8, 6, 14)), white);
        eng.rotation.z = -Math.PI / 2;
        eng.position.set(0.85, -0.55, side * 1.7);
        plane.add(eng);
        const rim = new THREE.Mesh(G(new THREE.TorusGeometry(0.26, 0.035, 8, 20)), gold);
        rim.rotation.y = Math.PI / 2;
        rim.position.set(1.5, -0.55, side * 1.7);
        plane.add(rim);
      });

      // tail fin (gold — the livery's signature) + stabilizers
      const finShape = new THREE.Shape();
      finShape.moveTo(0.55, 0);
      finShape.lineTo(-0.55, 0);
      finShape.lineTo(-1.4, 1.25);
      finShape.lineTo(-0.95, 1.3);
      finShape.closePath();
      const fin = new THREE.Mesh(G(new THREE.ExtrudeGeometry(finShape, { depth: 0.07, bevelEnabled: false })), gold);
      fin.position.set(-2.9, 0.35, -0.035);
      plane.add(fin);
      ([1, -1] as const).forEach((side) => {
        const st = new THREE.Mesh(wingGeo, doubleWhite);
        st.rotation.x = (side * Math.PI) / 2;
        st.scale.setScalar(0.4);
        st.position.set(-2.95, 0.15, 0);
        plane.add(st);
      });

      plane.scale.setScalar(0.5);
      plane.visible = false;
      scene.add(plane);

      // soft ground shadow for takeoff/landing
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
      const shadow = new THREE.Mesh(G(new THREE.CircleGeometry(1.2, 24)), shadowMat);
      shadow.scale.set(1.5, 0.3, 1);
      scene.add(shadow);

      // ── flight plan: takeoff center → out RIGHT → in LEFT → land ──
      // Conventions (forward = +X): yaw > 0 turns the nose TOWARD the
      // viewer (3/4 view), roll > 0 banks right-wing-down.
      const KEYS: Key[] = [
        { t: 0.0,  x: 0.0,   y: -0.34, s: 0.42, yaw: 0.45, pitch: 0,     roll: 0,    o: 0 },
        { t: 0.06, x: 0.04,  y: -0.33, s: 0.46, yaw: 0.42, pitch: 0.06,  roll: 0,    o: 1 },
        { t: 0.2,  x: 0.3,   y: -0.1,  s: 0.66, yaw: 0.32, pitch: 0.28,  roll: 0.2,  o: 1 },
        { t: 0.4,  x: 1.05,  y: 0.34,  s: 1.0,  yaw: 0.15, pitch: 0.34,  roll: 0.48, o: 1 },
        { t: 0.46, x: 1.6,   y: 0.58,  s: 1.15, yaw: 0.06, pitch: 0.3,   roll: 0.52, o: 0 },
        { t: 0.5,  x: -1.7,  y: 0.72,  s: 0.36, yaw: 0.4,  pitch: -0.05, roll: 0.15, o: 0 },
        { t: 0.56, x: -1.15, y: 0.58,  s: 0.42, yaw: 0.45, pitch: -0.16, roll: 0.14, o: 1 },
        { t: 0.78, x: -0.34, y: 0.05,  s: 0.6,  yaw: 0.48, pitch: -0.18, roll: 0.06, o: 1 },
        { t: 0.92, x: 0.05,  y: -0.3,  s: 0.7,  yaw: 0.45, pitch: 0.12,  roll: 0,    o: 1 }, // flare
        { t: 1.0,  x: 0.3,   y: -0.35, s: 0.7,  yaw: 0.45, pitch: 0.01,  roll: 0,    o: 1 }, // rollout
      ];
      const smooth = (u: number) => u * u * (3 - 2 * u);
      const state = (t: number): Key => {
        if (t <= KEYS[0].t) return KEYS[0];
        for (let i = 0; i < KEYS.length - 1; i += 1) {
          const a = KEYS[i], b = KEYS[i + 1];
          if (t <= b.t) {
            const u = smooth((t - a.t) / (b.t - a.t));
            const mix = (ka: number, kb: number) => ka + (kb - ka) * u;
            return {
              t, x: mix(a.x, b.x), y: mix(a.y, b.y), s: mix(a.s, b.s),
              yaw: mix(a.yaw, b.yaw), pitch: mix(a.pitch, b.pitch),
              roll: mix(a.roll, b.roll), o: mix(a.o, b.o),
            };
          }
        }
        return KEYS[KEYS.length - 1];
      };

      const resize = () => {
        const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", resize);

      apiRef.current = {
        update(t: number) {
          if (disposed) return;
          const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
          const halfW = halfH * camera.aspect;
          const k = state(t);
          plane.visible = k.o > 0.01 && t > 0.001 && t < 0.999;
          plane.position.set(k.x * halfW, k.y * halfH, 0);
          plane.scale.setScalar(0.5 * k.s);
          // yaw negated: rotation.y > 0 would swing the nose AWAY from
          // the camera; we want the 3/4 hero angle toward the viewer.
          plane.rotation.set(k.roll, -k.yaw, k.pitch);
          // ground shadow near takeoff & landing altitudes
          const floorY = -0.42 * halfH;
          shadow.position.set(plane.position.x + 0.4, floorY, -0.5);
          const closeness = Math.max(0, 1 - Math.abs(plane.position.y - floorY) / 1.8);
          shadowMat.opacity = plane.visible ? closeness * 0.22 * k.o : 0;
          shadow.visible = shadowMat.opacity > 0.01;
          mount.style.opacity = String(k.o);
          renderer.render(scene, camera);
        },
      };
      apiRef.current.update(0);

      cleanup = () => {
        window.removeEventListener("resize", resize);
        pmrem.dispose();
        geos.forEach((g) => g.dispose());
        [white, gold, dark, doubleWhite, shadowMat].forEach((m) => m.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  useImperativeHandle(ref, () => ({ update: (t: number) => apiRef.current.update(t) }), []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, willChange: "opacity" }}
    />
  );
});
