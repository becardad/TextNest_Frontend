import { useEffect, useState } from "react";

/* ────────────────────────────────────────────────────────────────────
   TEXTNEST SPLASH ANIMATION
   1. Bird flies in from the left with flapping wings
   2. Bird blurs into a glowing cloud → cloud resolves into "Text"
   3. "Nest" word appears → blurs into amber cloud → resolves into nest SVG
   4. The "Text" (from bird) drops into the nest bowl from above
   5. Full brand label fades in
───────────────────────────────────────────────────────────────────── */

type Phase =
  | "idle"
  | "fly"          // bird sweeping in
  | "blur-out"     // bird blurs out
  | "text-in"      // "Text" crystallises from cloud
  | "text-hold"    // "Text" visible at top
  | "nest-word"    // "Nest" text appears
  | "nest-blur"    // "Nest" blurs out
  | "nest-svg"     // nest SVG materialises
  | "text-drop"    // top "Text" fades and TEXT glows INSIDE nest
  | "brand"        // full TextNest label
  | "hold"
  | "out";

/* ── Flapping Bird ───────────────────────────────────────── */
const Bird = () => (
  <svg viewBox="0 0 170 88" width="190" xmlns="http://www.w3.org/2000/svg">
    <path d="M82 58 Q62 72 30 74 Q52 62 78 60 Z" fill="hsl(var(--primary)/0.5)" />
    <ellipse cx="84" cy="56" rx="30" ry="18" fill="hsl(var(--primary))" />
    <path d="M54 60 Q36 76 26 64 Q38 56 54 56 Z" fill="hsl(var(--primary)/0.9)" />
    <circle cx="106" cy="44" r="15" fill="hsl(var(--primary))" />
    <path d="M121 43 L138 40 L121 49 Z" fill="hsl(28,85%,58%)" />
    <circle cx="112" cy="41" r="4" fill="white" />
    <circle cx="113.2" cy="41" r="2" fill="#0d0d1a" />
    <circle cx="112" cy="40" r="1" fill="white" opacity="0.8" />
    <path fill="hsl(var(--primary)/0.95)" d="M80 50 Q56 18 18 16 Q44 34 76 48 Z">
      <animateTransform attributeName="transform" type="rotate"
        values="0;-26;2;22;0" dur="0.48s" repeatCount="indefinite" additive="sum"
        calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
    </path>
  </svg>
);

/* ── Realistic Twig Nest ────────────────────────────────── */
const NestIllustration = () => (
  <svg viewBox="0 0 320 260" width="320" xmlns="http://www.w3.org/2000/svg">
    {/* ── Inner Bowl (Dark recessed area) ── */}
    {/* Centered vertically at 130 (half of 260) */}
    <ellipse cx="160" cy="130" rx="95"  ry="40" fill="#2A1B0E" opacity="0.8"/>
    <ellipse cx="160" cy="125" rx="80"  ry="30" fill="#150A05" opacity="0.95"/>
    
    {/* ── Background Twig Layer ── */}
    <g stroke="#3E2712" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
      <path d="M70 145 L120 175 M250 145 L200 175 M160 180 L160 160" />
      <path d="M90 165 L140 180 M230 165 L180 180 M120 185 L200 185" />
      <path d="M50 125 L80 155 M270 125 L240 155 M160 115 L160 95" />
    </g>

    {/* ── Mid-Layer Twig Texture ── */}
    <g strokeLinecap="round">
      <path d="M45 110 L100 150" stroke="#4A3018" strokeWidth="3.5" />
      <path d="M275 110 L220 150" stroke="#4A3018" strokeWidth="3.5" />
      <path d="M100 170 L220 170" stroke="#3D2B1A" strokeWidth="4" />
      <path d="M35 140 L90 180" stroke="#63442D" strokeWidth="3" />
      <path d="M285 140 L230 180" stroke="#63442D" strokeWidth="3" />
      <path d="M60 120 L110 105" stroke="#7A5C3E" strokeWidth="2.5" />
      <path d="M260 120 L210 105" stroke="#7A5C3E" strokeWidth="2.5" />
      <path d="M55 160 L120 190" stroke="#8B6D4C" strokeWidth="2" />
      <path d="M265 160 L200 190" stroke="#8B6D4C" strokeWidth="2" />
      <path d="M160 193 L230 180" stroke="#A68B6A" strokeWidth="1.8" />
    </g>

    {/* ── Top Rim - Messy Sticking-out Branches ── */}
    <g strokeLinecap="round">
      <path d="M40 115 L15 75" stroke="#5A4028" strokeWidth="2.5" />
      <path d="M55 105 L30 55" stroke="#7A5C3E" strokeWidth="2"   />
      <path d="M75 100 L55 45" stroke="#4A3018" strokeWidth="2.2" />
      <path d="M90 95  L80 35" stroke="#8B6D4C" strokeWidth="1.8" />
      <path d="M280 115 L305 75" stroke="#5A4028" strokeWidth="2.5" />
      <path d="M265 105 L290 55" stroke="#7A5C3E" strokeWidth="2"   />
      <path d="M245 100 L265 45" stroke="#4A3018" strokeWidth="2.2" />
      <path d="M230 95  L240 35" stroke="#8B6D4C" strokeWidth="1.8" />
      <path d="M15 75 L5 85"    stroke="#5A4028" strokeWidth="2" />
      <path d="M30 55 L45 50"   stroke="#7A5C3E" strokeWidth="1.5" />
      <path d="M305 75 L315 85" stroke="#5A4028" strokeWidth="2" />
      <path d="M290 55 L275 50" stroke="#7A5C3E" strokeWidth="1.5" />
    </g>

    {/* ── Inner rim shading ── */}
    <ellipse cx="160" cy="115" rx="105" ry="20" fill="none" stroke="#2A1B0E" strokeWidth="6" opacity="0.3"/>
  </svg>
);

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase("fly"),        50),
      setTimeout(() => setPhase("blur-out"),   900),
      setTimeout(() => setPhase("text-in"),   1350),
      setTimeout(() => setPhase("text-hold"), 1850),
      setTimeout(() => setPhase("nest-word"), 2350),
      setTimeout(() => setPhase("nest-blur"), 2950),
      setTimeout(() => setPhase("nest-svg"),  3400),
      setTimeout(() => setPhase("text-drop"), 3900),  // Text falls into nest
      setTimeout(() => setPhase("brand"),     4500),
      setTimeout(() => setPhase("hold"),      5000),
      setTimeout(() => setPhase("out"),       6400),
      setTimeout(() => onDone(),              7100),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDone]);

  /* ── phase helpers ── */
  const p = (s: Phase) => phase === s;
  const after = (...phases: Phase[]) => phases.includes(phase);

  const afterText = after("text-hold","nest-word","nest-blur","nest-svg","text-drop","brand","hold");
  const afterNest = after("nest-svg","text-drop","brand","hold");
  const textDropped = after("text-drop","brand","hold");

  // Bird
  const birdVisible = p("fly") || p("blur-out");
  const birdTx      = p("fly") ? "-320px" : "0px";
  const birdTy      = p("fly") ? "-90px"  : "0px";
  const birdBlur    = p("blur-out") ? 40 : 0;
  const birdScale   = p("blur-out") ? 1.35 : 1;

  // Top "Text" word — visible after text-in but hidden once it drops into nest
  const topTextVisible = (p("text-in") || afterText) && !textDropped;
  const topTextShow    = p("text-in") || after("text-hold","nest-word","nest-blur","nest-svg");

  // Nest word
  const nestWordVisible = p("nest-word") || p("nest-blur");
  const nestWordBlur    = p("nest-blur") ? 40 : 0;
  const nestWordScale   = p("nest-blur") ? 1.35 : 1;

  // Nest SVG
  const nestVisible = afterNest;

  // Text INSIDE nest (appears when text-drop fires)
  const nestTextVisible = textDropped;

  // Brand
  const brandVisible = after("brand","hold");
  const dotsVisible  = p("hold");

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      style={{ opacity: p("out") ? 0 : 1, transition: "opacity 0.8s ease-out" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[160px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="flex flex-col items-center" style={{ gap: "2rem" }}>

        {/* ══ TOP ZONE: Bird → Cloud → "Text" ══ */}
        <div className="relative flex items-center justify-center" style={{ width: 320, height: 110 }}>

          {/* Cloud glow shared at peak of blur */}
          <div style={{
            position: "absolute",
            width: 240, height: 80, borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(var(--primary)/0.55) 0%, transparent 70%)",
            filter: "blur(18px)",
            opacity: p("blur-out") || p("text-in") ? 1 : 0,
            transform: `scale(${p("blur-out") ? 1 : 0.5})`,
            transition: "opacity 0.5s ease, transform 0.5s ease",
            pointerEvents: "none",
          }} />

          {/* Bird */}
          <div style={{
            position: "absolute",
            opacity: birdVisible ? 1 : 0,
            filter: `blur(${birdBlur}px)`,
            transform: `translateX(${birdTx}) translateY(${birdTy}) scale(${birdScale})`,
            transition: p("fly")
              ? "transform 0.8s cubic-bezier(0.22,0.6,0.36,1)"
              : "filter 0.45s ease-in, opacity 0.45s ease-in, transform 0.45s ease-in",
            transitionProperty: "transform, filter, opacity",
          }}>
            <Bird />
          </div>

          {/* "Text" at top — fades away when it drops into nest */}
          <div style={{
            position: "absolute",
            opacity: topTextShow ? 1 : 0,
            animation: p("text-in") ? "deblur 0.55s cubic-bezier(0.22,1,0.36,1) forwards" : "none",
            filter: topTextShow && !p("text-in") ? "blur(0px)" : "blur(40px)",
            transform: `scale(${topTextShow ? 1 : 0.7})`,
            transition: "opacity 0.45s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            transitionProperty: "opacity, transform",
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "5.5rem", fontWeight: 900,
              letterSpacing: "-0.03em", lineHeight: 1, display: "block",
              background: "linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 18px hsl(var(--primary)/0.55))",
            }}>Text</span>
          </div>
        </div>

        {/* ══ BOTTOM ZONE: "Nest" → Cloud → Nest SVG (with "Text" inside) ══ */}
        <div className="relative flex items-center justify-center" style={{ width: 320, height: 260 }}>

          {/* Amber cloud */}
          <div style={{
            position: "absolute",
            width: 260, height: 90, borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(24,72%,58%,0.5) 0%, transparent 70%)",
            filter: "blur(20px)",
            opacity: p("nest-blur") || p("nest-svg") ? 1 : 0,
            transform: `scale(${p("nest-blur") ? 1 : 0.5})`,
            transition: "opacity 0.5s ease, transform 0.5s ease",
            pointerEvents: "none",
          }} />

          {/* "Nest" word */}
          <div style={{
            position: "absolute",
            opacity: nestWordVisible ? 1 : 0,
            filter: `blur(${nestWordBlur}px)`,
            transform: `scale(${nestWordScale})`,
            transition: p("nest-word")
              ? "opacity 0.4s cubic-bezier(0.34,1.56,0.64,1)"
              : "filter 0.45s ease-in, opacity 0.45s ease-in, transform 0.45s ease-in",
            transitionProperty: "filter, opacity, transform",
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "5.5rem", fontWeight: 900,
              letterSpacing: "-0.03em", lineHeight: 1, display: "block",
              color: "hsl(24,72%,58%)",
              filter: "drop-shadow(0 0 18px hsl(24,72%,58%,0.45))",
            }}>Nest</span>
          </div>

          {/* Nest SVG container — Text flies in to sit inside it */}
          <div style={{
            position: "absolute",
            opacity: nestVisible ? 1 : 0,
            animation: p("nest-svg") ? "deblur 0.6s cubic-bezier(0.22,1,0.36,1) forwards" : "none",
            filter: nestVisible && !p("nest-svg") ? "blur(0px)" : "blur(40px)",
            transform: `scale(${nestVisible ? 1 : 0.7})`,
            transition: nestVisible && !p("nest-svg")
              ? "opacity 0.3s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)"
              : "opacity 0.15s ease",
            transitionProperty: "opacity, transform",
          }}>
            <div className="relative" style={{ width: 320, height: 260 }}>
              <NestIllustration />

              {/* "Text" that fell from bird — sits in the bowl */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: nestTextVisible ? 1 : 0,
                transform: `translate(-50%, -50%) scale(${nestTextVisible ? 1 : 0.5}) translateY(${nestTextVisible ? 0 : -24}px)`,
                filter: nestTextVisible ? "blur(0px)" : "blur(10px)",
                transition: "all 0.65s cubic-bezier(0.34,1.56,0.64,1)",
                marginTop: "4px", // Shifted up slightly as requested
              }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "2.8rem", fontWeight: 900,
                  letterSpacing: "0.06em", lineHeight: 1,
                  background: "linear-gradient(120deg, hsl(var(--primary)), hsl(28,80%,68%))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 16px hsl(var(--primary)/0.75))",
                }}>Text</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Brand label ══ */}
        <div style={{
          opacity: brandVisible ? 1 : 0,
          transform: brandVisible ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s ease-out",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: "2.2rem", fontWeight: 900,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Text</span>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: "2.2rem", fontWeight: 900,
              letterSpacing: "-0.02em", color: "hsl(24,70%,58%)",
            }}>Nest</span>
          </div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))" }}>
            Connect · Chat · Share
          </p>
        </div>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-14 flex items-center gap-2"
        style={{ opacity: dotsVisible ? 1 : 0, transition: "opacity 0.4s" }}>
        {[0,1,2].map(i => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce"
            style={{ animationDelay: `${i*150}ms`, animationDuration: "0.9s" }} />
        ))}
      </div>

      <style>{`
        @keyframes deblur {
          from { filter: blur(40px); }
          to   { filter: blur(0px); }
        }
      `}</style>
    </div>
  );
}
