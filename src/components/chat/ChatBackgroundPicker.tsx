import { useState } from "react";
import { ArrowLeft, Check, Image as ImageIcon, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBackgroundPickerProps {
  currentBg: string;
  onSelect: (bg: string) => void;
  onClose: () => void;
}

const solidColors = [
  { id: "default", label: "Default", value: "" },
  { id: "warm", label: "Warm Stone", value: "hsl(38 18% 96%)" },
  { id: "dark", label: "Dark", value: "hsl(0 0% 5%)" },
  { id: "navy", label: "Navy", value: "hsl(220 20% 12%)" },
  { id: "forest", label: "Forest", value: "hsl(150 15% 12%)" },
  { id: "wine", label: "Wine", value: "hsl(350 20% 12%)" },
  { id: "sand", label: "Sand", value: "hsl(35 30% 90%)" },
  { id: "sky", label: "Sky", value: "hsl(200 30% 92%)" },
];

const wallpapers = [
  {
    id: "w1",
    label: "Mountain",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop",
  },
  {
    id: "w2",
    label: "Ocean",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=900&fit=crop",
  },
  {
    id: "w3",
    label: "Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=900&fit=crop",
  },
  {
    id: "w4",
    label: "City",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=900&fit=crop",
  },
  {
    id: "w5",
    label: "Stars",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=900&fit=crop",
  },
  {
    id: "w6",
    label: "Flowers",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=900&fit=crop",
  },
];

export default function ChatBackgroundPicker({ currentBg, onSelect, onClose }: ChatBackgroundPickerProps) {
  const [tab, setTab] = useState<"colors" | "wallpapers">("colors");

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
        <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent active:scale-95 transition-all">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-base font-semibold text-foreground">Chat Wallpaper</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 py-3 shrink-0">
        <button
          onClick={() => setTab("colors")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95",
            tab === "colors" ? "gradient-primary text-white shadow-md shadow-primary/20" : "bg-secondary text-foreground hover:bg-accent"
          )}
        >
          <Palette className="h-4 w-4" />
          Colors
        </button>
        <button
          onClick={() => setTab("wallpapers")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95",
            tab === "wallpapers" ? "gradient-primary text-white shadow-md shadow-primary/20" : "bg-secondary text-foreground hover:bg-accent"
          )}
        >
          <ImageIcon className="h-4 w-4" />
          Wallpapers
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-6">
        {tab === "colors" ? (
          <div className="grid grid-cols-4 gap-3">
            {solidColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onSelect(color.value)}
                className={cn(
                  "relative aspect-[3/4] rounded-xl border-2 transition-all active:scale-95 overflow-hidden",
                  currentBg === color.value ? "border-primary shadow-md shadow-primary/20" : "border-border/50 hover:border-primary/30"
                )}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: color.value || "hsl(var(--chat-surface))",
                  }}
                />
                {/* Mini chat preview */}
                <div className="absolute inset-2 flex flex-col justify-end gap-1">
                  <div className="self-start bg-card/80 rounded-lg px-2 py-1 max-w-[80%]">
                    <div className="h-1 w-10 bg-foreground/20 rounded" />
                  </div>
                  <div className="self-end gradient-primary rounded-lg px-2 py-1 max-w-[80%]">
                    <div className="h-1 w-8 bg-white/40 rounded" />
                  </div>
                </div>
                {currentBg === color.value && (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <span className="absolute bottom-1 left-0 right-0 text-[8px] text-center font-medium text-foreground/60">{color.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {wallpapers.map((wp) => (
              <button
                key={wp.id}
                onClick={() => onSelect(`url(${wp.url})`)}
                className={cn(
                  "relative aspect-[3/4] rounded-xl border-2 transition-all active:scale-95 overflow-hidden",
                  currentBg === `url(${wp.url})` ? "border-primary shadow-md shadow-primary/20" : "border-border/50 hover:border-primary/30"
                )}
              >
                <img src={wp.url} alt={wp.label} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
                {currentBg === `url(${wp.url})` && (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <span className="absolute bottom-1 left-0 right-0 text-[8px] text-center font-semibold text-white drop-shadow">{wp.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
