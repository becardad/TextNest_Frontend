import { cn } from "@/lib/utils";

export default function TextNestLogo({ className, size = 150, birdVariant = 'loop' }: { className?: string; size?: number; birdVariant?: 'hover' | 'loop' }) {
  const scale = size / 150;
  
  return (
    <div 
      className={cn("relative flex items-center justify-center overflow-visible", className)} 
      style={{ width: size, height: size, fontSize: `${1.4 * scale}rem` }}
    >
      {/* Shared glow behind everything */}
      <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full animate-pulse-slow" />

      {/* Realistic Twig Nest — Logo Version - perfectly square viewBox for centering */}
      <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl">
        {/* ── Inner Bowl (Dark recessed area) ── */}
        <ellipse cx="160" cy="160" rx="95"  ry="40" fill="#2A1B0E" opacity="0.8"/>
        <ellipse cx="160" cy="155" rx="80"  ry="30" fill="#150A05" opacity="0.95"/>
        
        {/* ── Background Twig Layer (Darker) ── */}
        <g stroke="#3E2712" strokeWidth="3" strokeLinecap="round" opacity="0.7">
          <path d="M70 170 L120 200 M250 170 L200 200 M160 205 L160 185" />
          <path d="M90 190 L140 205 M230 190 L180 205 M120 210 L200 210" />
          <path d="M50 150 L80 180 M270 150 L240 180 M160 140 L160 120" />
        </g>

        {/* ── Mid-Layer Twig Texture (Varying Browns) ── */}
        <g strokeLinecap="round">
          {/* Dark browns */}
          <path d="M45 135 L100 175" stroke="#4A3018" strokeWidth="4" />
          <path d="M275 135 L220 175" stroke="#4A3018" strokeWidth="4" />
          <path d="M100 195 L220 195" stroke="#3D2B1A" strokeWidth="4.5" />
          
          {/* Warmer browns */}
          <path d="M35 165 L90 205" stroke="#63442D" strokeWidth="3.5" />
          <path d="M285 165 L230 205" stroke="#63442D" strokeWidth="3.5" />
          <path d="M60 145 L110 130" stroke="#7A5C3E" strokeWidth="3" />
          <path d="M260 145 L210 130" stroke="#7A5C3E" strokeWidth="3" />
          
          {/* Light tan highlight twigs */}
          <path d="M55 185 L120 215" stroke="#8B6D4C" strokeWidth="2.5" />
          <path d="M265 185 L200 215" stroke="#8B6D4C" strokeWidth="2.5" />
          <path d="M160 218 L230 205" stroke="#A68B6A" strokeWidth="2.2" />
        </g>

        {/* ── Top Rim - Messy Sticking-out Branches ── */}
        <g strokeLinecap="round">
          <path d="M40 140 L15 100" stroke="#5A4028" strokeWidth="3" />
          <path d="M55 130 L30 80"  stroke="#7A5C3E" strokeWidth="2.5"   />
          <path d="M75 125 L55 70"  stroke="#4A3018" strokeWidth="2.8" />
          <path d="M90 120 L80 60"  stroke="#8B6D4C" strokeWidth="2.2" />
          <path d="M280 140 L305 100" stroke="#5A4028" strokeWidth="3" />
          <path d="M265 130 L290 80"  stroke="#7A5C3E" strokeWidth="2.5"   />
          <path d="M245 125 L265 70"  stroke="#4A3018" strokeWidth="2.8" />
          <path d="M230 120 L240 60"  stroke="#8B6D4C" strokeWidth="2.2" />
        </g>

        {/* ── Inner rim shading ── */}
        <ellipse cx="160" cy="140" rx="105" ry="20" fill="none" stroke="#2A1B0E" strokeWidth="8" opacity="0.3"/>
      </svg>

      {/* "Text" word inside the nest bowl - Precisely centered */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center select-none pointer-events-none mt-1">
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "1em", fontWeight: 900,
          letterSpacing: "0.04em", lineHeight: 1,
          background: "linear-gradient(120deg, hsl(var(--primary)), hsl(28,80%,68%))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 0 ${8 * scale}px hsl(var(--primary)/0.7))`,
        }}>Text</span>
      </div>

      {/* Bird Animation Variant Selection */}
      {birdVariant === 'hover' ? (
        <div className="absolute pointer-events-none animate-bird-fly-stay" style={{ top: -48 * scale, right: -48 * scale }}>
          <svg width={Math.round(86 * scale)} height={Math.round(54 * scale)} viewBox="0 0 170 88" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="84" cy="56" rx="30" ry="18" fill="hsl(var(--primary))" />
            <circle cx="106" cy="44" r="15" fill="hsl(var(--primary))" />
            <circle cx="111" cy="41" r="3.5" fill="#fff" />
            <circle cx="112" cy="41" r="2" fill="#1a0e05" />
            <path d="M121 43 L142 38 L121 49" fill="hsl(28,85%,58%)" />
            <path fill="hsl(var(--primary)/0.9)" d="M80 50 Q56 18 18 16 Q44 34 76 48 Z">
              <animateTransform attributeName="transform" type="rotate"
                values="0;-25;5;25;0" dur="0.25s" repeatCount="indefinite" additive="sum" />
            </path>
            <path d="M54 58 Q30 70 14 65" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M54 62 Q28 78 12 76" stroke="hsl(28,70%,55%)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <div className="absolute pointer-events-none animate-bird-visit" style={{ top: -28, right: -28 }}>
          <svg width="34" height="21" viewBox="0 0 170 88" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="84" cy="56" rx="30" ry="18" fill="hsl(var(--primary))" />
            <circle cx="106" cy="44" r="15" fill="hsl(var(--primary))" />
            <path d="M121 43 L138 40 L121 49" fill="hsl(28,85%,58%)" />
            <path fill="hsl(var(--primary)/0.9)" d="M80 50 Q56 18 18 16 Q44 34 76 48 Z">
              <animateTransform attributeName="transform" type="rotate"
                values="0;-25;5;25;0" dur="0.25s" repeatCount="indefinite" additive="sum" />
            </path>
          </svg>
        </div>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

        /* Original small looping bird */
        @keyframes bird-visit {
          0%   { transform: translate(120px, -80px) rotate(-15deg) scale(0); opacity: 0; }
          5%   { transform: translate(110px, -70px) rotate(-10deg) scale(0.6); opacity: 1; }
          20%  { transform: translate(-30px, 30px) rotate(5deg) scale(0.8); }
          25%  { transform: translate(-45px, 20px) rotate(0deg) scale(1); }
          45%  { transform: translate(-45px, 20px) rotate(-5deg) scale(1); } /* Landing pause on rim */
          55%  { transform: translate(-60px, 0px) rotate(-20deg) scale(0.8); }
          75%  { transform: translate(-150px, -120px) rotate(-30deg) scale(0.5); opacity: 1; }
          80%  { transform: translate(-160px, -130px) rotate(-30deg) scale(0.4); opacity: 0; }
          100% { transform: translate(120px, -80px) scale(0); opacity: 0; }
        }
        .animate-bird-visit {
          animation: bird-visit 11s linear infinite;
        }

        /* Phase 1: fly in once from top-right and settle above the nest */
        @keyframes bird-arrive {
          0%   { transform: translate(180px, -140px) rotate(-25deg) scale(0.3); opacity: 0; }
          8%   { opacity: 1; transform: translate(140px, -110px) rotate(-22deg) scale(0.5); }
          50%  { transform: translate(-42px, 14px) rotate(-4deg) scale(1); }
          70%  { transform: translate(-44px, 10px) rotate(-2deg) scale(1); }
          85%  { transform: translate(-44px, 13px) rotate(-3deg) scale(1); }
          100% { transform: translate(-44px, 11px) rotate(-3deg) scale(1); opacity: 1; }
        }

        /* Phase 2: gentle infinite hover once settled */
        @keyframes bird-hover {
          0%, 100% { transform: translate(-44px, 11px) rotate(-3deg); }
          50%       { transform: translate(-44px, 16px) rotate(-3deg); }
        }

        /* Run arrive once (2.2s), then hover forever starting exactly after */
        .animate-bird-fly-stay {
          animation:
            bird-arrive 2.2s cubic-bezier(0.22, 1, 0.36, 1) 1 forwards,
            bird-hover  2.4s ease-in-out infinite 2.2s;
        }
      `}</style>
    </div>
  );
}
