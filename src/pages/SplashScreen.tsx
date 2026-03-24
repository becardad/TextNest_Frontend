import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"logo" | "fade-out">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fade-out"), 2000);
    const t2 = setTimeout(() => navigate("/login", { replace: true }), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "fade-out" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary/30">
          <MessageCircle className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">TextNest</h1>
        <p className="text-sm text-muted-foreground">Your conversations, nested safely.</p>
      </div>

      <div className="mt-12 animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "backwards" }}>
        <div className="h-1 w-16 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full gradient-primary animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
