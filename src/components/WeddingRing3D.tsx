"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * A real 3D gold wedding ring, rendered with Three.js (lazy-loaded so
 * it costs nothing until the arrival scene is on screen). PBR gold —
 * metalness 1, low roughness, PMREM room environment — so reflections
 * move naturally as it turns. The ring lies tilted, encircling the wax
 * seal like a halo, breathing and slowly revolving. On seal break it
 * becomes part of the choreography: it rights itself to face the
 * viewer, spins up, and flies through the camera as the dive begins.
 *
 * Renders into a transparent 320×320 canvas centered on the seal;
 * pointer-events: none so the seal button stays clickable through the
 * ring's opening.
 */
export function WeddingRing3D({ breaking }: { breaking: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ breakFly: () => void } | null>(null);
  const breakingRef = useRef(breaking);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const mount = mountRef.current;
      if (disposed || !mount) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const SIZE = 320;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return; // WebGL unavailable — the scene degrades gracefully without the ring
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(SIZE, SIZE);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
      camera.position.set(0, 0, 6);

      // Studio-style environment: this is what makes the gold read as
      // gold — moving reflections, not flat shading.
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const key = new THREE.PointLight(0xffe6b0, 30, 20);
      key.position.set(3, 3, 4);
      scene.add(key);
      const rim = new THREE.PointLight(0xcdbfe0, 12, 20);
      rim.position.set(-3, -2, 3);
      scene.add(rim);

      const group = new THREE.Group();

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd9b36c,
        metalness: 1,
        roughness: 0.12,
        envMapIntensity: 1.4,
      });
      const band = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.16, 48, 128), goldMat);
      group.add(band);

      // The stone: a faceted octahedron with near-zero roughness and a
      // hot envMap — reads as a catching-the-light diamond without the
      // cost of real refraction.
      const gemGeo = new THREE.OctahedronGeometry(0.3, 0);
      const gem = new THREE.Mesh(
        gemGeo,
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.1,
          roughness: 0.02,
          envMapIntensity: 2.6,
          flatShading: true,
        }),
      );
      gem.position.y = 1.66;
      gem.scale.set(1, 1.3, 1);
      group.add(gem);

      const collet = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.21, 0.2, 16), goldMat);
      collet.position.y = 1.44;
      group.add(collet);

      group.rotation.x = 1.12; // lying almost flat — a halo around the seal
      scene.add(group);

      let raf = 0;
      const clock = new THREE.Clock();
      const speed = reduced ? 0.04 : 0.25;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();
        group.rotation.z = t * speed;
        if (!reduced) group.position.y = Math.sin(t * 0.9) * 0.06;
        renderer.render(scene, camera);
      };
      tick();

      apiRef.current = {
        breakFly: () => {
          if (reduced) {
            gsap.to(mount, { opacity: 0, duration: 0.8 });
            return;
          }
          // Rights itself to face the viewer, spins up, flies past the
          // camera — timed to land inside the burst → dive window.
          gsap.to(group.rotation, { x: 0.22, duration: 1.1, ease: "power2.inOut" });
          gsap.to(group.rotation, { z: "+=9", duration: 2.3, ease: "power2.in" });
          gsap.to(group.position, { z: 4.7, y: 0.35, duration: 2.15, ease: "power3.in", delay: 0.25 });
          gsap.to(mount, { opacity: 0, duration: 0.5, delay: 1.75, ease: "power1.in" });
        },
      };

      // If the seal was already broken while three.js was still on the
      // wire (fast click / slow network), join the choreography late
      // rather than never.
      if (breakingRef.current) apiRef.current.breakFly();

      cleanup = () => {
        cancelAnimationFrame(raf);
        pmrem.dispose();
        band.geometry.dispose();
        gemGeo.dispose();
        collet.geometry.dispose();
        goldMat.dispose();
        (gem.material as InstanceType<typeof THREE.MeshStandardMaterial>).dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    breakingRef.current = breaking;
    if (breaking) apiRef.current?.breakFly();
  }, [breaking]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 320,
        height: 320,
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        zIndex: 2,
        filter: "drop-shadow(0 0 26px rgba(216,189,133,.4))",
      }}
    />
  );
}
