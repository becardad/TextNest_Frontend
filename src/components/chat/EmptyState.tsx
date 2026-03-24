import { MessageCircle, ArrowLeft, Sparkles, Lock, Zap } from "lucide-react";
import TextNestLogo from "../TextNestLogo";

export default function EmptyState() {
  return (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-background text-center px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30 dark:opacity-15" />

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-20 w-16 h-16 rounded-2xl bg-primary/5 rotate-12 animate-float" />
      <div className="absolute bottom-32 right-24 w-12 h-12 rounded-full bg-primary/5 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-16 w-8 h-8 rounded-lg bg-primary/5 -rotate-12 animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        {/* Animated brand logo */}
        <div className="relative mb-12 flex flex-col items-center justify-center animate-float">
          <TextNestLogo size={180} birdVariant="hover" />
          <h1 className="mt-8 text-5xl font-black bg-gradient-to-br from-foreground via-foreground/90 to-primary/80 bg-clip-text text-transparent tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
            TextNest
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
          Your conversations await
        </h2>

        {/* TextNest-themed taglines */}
        <div className="flex flex-col items-center gap-2 mb-2 animate-fade-in" style={{ animationDelay: "350ms", animationFillMode: "backwards" }}>
          <p className="text-base font-semibold text-primary/80 tracking-wide">
            🪺 Where every message finds its nest.
          </p>
          <p className="text-sm text-muted-foreground/80 italic">
            "Weave your words. Build your flock."
          </p>
          <p className="text-xs text-muted-foreground/50 tracking-widest uppercase font-bold mt-1">
            Instant · Encrypted · Always yours
          </p>
        </div>

        {/* Feature highlights */}
        <div className="flex items-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "backwards" }}>
          {[
            { icon: Zap, label: "Instant delivery" },
            { icon: Lock, label: "E2E encrypted" },
            { icon: Sparkles, label: "Smart replies" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <f.icon className="h-3.5 w-3.5 text-primary/60" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-8 text-xs text-muted-foreground/50 animate-fade-in" style={{ animationDelay: "800ms", animationFillMode: "backwards" }}>
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Choose a conversation to get started</span>
        </div>
      </div>
    </div>
  );
}
