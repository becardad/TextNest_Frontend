import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenLockProps {
  children: React.ReactNode;
}

export default function ScreenLock({ children }: ScreenLockProps) {
  // Using explicit lock requirement from localStorage, default false
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem("app_locked") === "true");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Whenever returning to the app after being hidden for >1 minute, lock it automatically if protection is enabled
      if (document.visibilityState === "visible" && localStorage.getItem("screen_lock_enabled") === "true") {
        const lastActive = parseInt(localStorage.getItem("last_active_time") || "0", 10);
        if (Date.now() - lastActive > 60000) { // 60 seconds
          setIsLocked(true);
          localStorage.setItem("app_locked", "true");
        }
      } else {
        localStorage.setItem("last_active_time", Date.now().toString());
      }
    };
    
    // Periodically update last active time while using
    const interval = setInterval(() => {
      localStorage.setItem("last_active_time", Date.now().toString());
    }, 10000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const handleUnlock = () => {
    const savedPin = localStorage.getItem("app_pin") || "1234"; // Default fallback
    if (pin === savedPin) {
      setIsLocked(false);
      localStorage.removeItem("app_locked");
      setPin("");
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPin("");
    }
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center max-w-xs w-full px-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold mb-2">App Locked</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Enter your PIN to unlock</p>
        
        <div className={cn("flex gap-3 mb-10 transition-transform", error && "animate-[shake_0.4s_ease-in-out]")}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(
              "w-4 h-4 rounded-full transition-all duration-200",
              pin.length > i ? "bg-primary scale-110" : "bg-secondary border border-border"
            )} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "enter"].map((key) => (
            <button
              key={key}
              disabled={pin.length >= 4 && typeof key === "number"}
              onClick={() => {
                if (key === "clear") setPin(prev => prev.slice(0, -1));
                else if (key === "enter") handleUnlock();
                else if (pin.length < 4) setPin(prev => prev + key.toString());
              }}
              className={cn(
                "h-16 rounded-2xl text-xl font-medium flex items-center justify-center transition-all bg-secondary/50",
                typeof key === "number" ? "hover:bg-secondary active:scale-95" : "text-sm font-semibold uppercase hover:bg-primary/10 hover:text-primary",
                key === "enter" && pin.length === 4 && "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {key === "clear" ? "DEL" : key === "enter" ? "OK" : key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
