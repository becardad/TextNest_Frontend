import { useState } from "react";
import { Eye, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewOnceMediaProps {
  imageUrl: string;
  isMine: boolean;
  viewed: boolean;
  onView: () => void;
}

export default function ViewOnceMedia({ imageUrl, isMine, viewed, onView }: ViewOnceMediaProps) {
  const [isViewing, setIsViewing] = useState(false);

  if (isViewing) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => { setIsViewing(false); onView(); }}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/60" />
          <span className="text-xs text-white/60 font-medium">View once</span>
        </div>
        <img src={imageUrl} alt="View once" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
      </div>
    );
  }

  if (viewed) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl",
        isMine ? "bg-white/10" : "bg-accent/60"
      )}>
        <Eye className={cn("h-4 w-4", isMine ? "text-white/40" : "text-muted-foreground/40")} />
        <span className={cn("text-xs", isMine ? "text-white/40" : "text-muted-foreground/40")}>
          Opened
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => { if (!isMine) setIsViewing(true); }}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all active:scale-95",
        isMine
          ? "bg-white/10"
          : "bg-primary/10 hover:bg-primary/15 cursor-pointer"
      )}
    >
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center",
        isMine ? "bg-white/15" : "bg-primary/15"
      )}>
        <Eye className={cn("h-4 w-4", isMine ? "text-white/70" : "text-primary")} />
      </div>
      <span className={cn("text-xs font-medium", isMine ? "text-white/70" : "text-primary")}>
        {isMine ? "View once photo" : "Photo · Tap to view"}
      </span>
    </button>
  );
}
