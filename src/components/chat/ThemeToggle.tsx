import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <button
      onClick={() => setDark(!dark)}
      className={cn(
        "relative p-2 rounded-lg transition-all duration-300 active:scale-95",
        "hover:bg-accent text-muted-foreground hover:text-foreground",
        "overflow-hidden"
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-4 w-4">
        <Sun className={cn(
          "h-4 w-4 absolute inset-0 transition-all duration-500",
          dark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        )} />
        <Moon className={cn(
          "h-4 w-4 absolute inset-0 transition-all duration-500",
          dark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )} />
      </div>
    </button>
  );
}
