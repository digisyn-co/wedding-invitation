export function MoonlightGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute left-1/2 top-[8%] h-[380px] w-[380px] -translate-x-1/2 rounded-full opacity-70 blur-3xl motion-safe:animate-[moonlight_8s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, rgba(216,190,134,0.35) 0%, rgba(199,194,221,0.16) 45%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(23,20,31,0.85) 100%)",
        }}
      />
      <style>{`
        @keyframes moonlight {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.85; transform: translateX(-50%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
