import { cn } from "@/lib/utils";
import { Check, CheckCheck, Play, Mic, CornerUpRight, Image as ImageIcon, Star, Ban, Trash2, Pencil, Forward, Lock, File, Download } from "lucide-react";
import type { Message } from "@/data/mockData";
import { useState, useRef, useEffect } from "react";

function resolveUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
  return `${baseUrl}/${path.replace(/\\/g, '/')}`;
}

function AudioPlayer({ src, duration, isMine }: { src: string; duration?: string; isMine: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else {
        // Force reload if src changed or was empty
        if (!audioRef.current.src || audioRef.current.src !== resolveUrl(src)) {
           audioRef.current.src = resolveUrl(src);
        }
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div className="flex items-center gap-4 min-w-[220px] py-1">
      <audio ref={audioRef} src={resolveUrl(src)} preload="metadata" />
      <button 
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 shadow-md",
          isMine ? "bg-white/25 hover:bg-white/35 text-white" : "bg-primary/15 hover:bg-primary/25 text-primary"
        )}
      >
        {isPlaying ? (
          <div className="flex gap-1 items-center justify-center">
            <div className="w-1 h-3 bg-current rounded-full animate-pulse" />
            <div className="w-1 h-4 bg-current rounded-full animate-pulse delay-75" />
            <div className="w-1 h-3 bg-current rounded-full animate-pulse delay-150" />
          </div>
        ) : (
          <Play className="h-4.5 w-4.5 ml-0.5" fill="currentColor" />
        )}
      </button>
      <div className="flex items-center gap-[2px] flex-1 h-8 px-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-[2.5px] rounded-full transition-all duration-300",
              isMine ? "bg-white/30" : "bg-muted-foreground/20",
              (i / 28) * 100 < progress && (isMine ? "bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "bg-primary shadow-[0_0_8px_rgba(255,165,0,0.3)]")
            )}
            style={{
              height: `${Math.max(4, Math.sin(i * 0.6) * 14 + (isPlaying ? Math.random() * 8 : 2) + 6)}px`,
            }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <Mic className={cn("h-3 w-3", isMine ? "text-white/40" : "text-muted-foreground/40")} />
        <span className={cn("text-[9px] font-bold tabular-nums", isMine ? "text-white/70" : "text-muted-foreground")}>
          {duration || "0:00"}
        </span>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  index: number;
  isStarred?: boolean;
  onToggleStar?: (msgId: string) => void;
  onDelete?: (msgId: string) => void;
  onDeleteForMe?: (msgId: string) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onReact?: (emoji: string) => void;
  onForward?: () => void;
}

export default function MessageBubble({ message, isMine, index, isStarred, onToggleStar, onDelete, onDeleteForMe, onReply, onEdit, onReact, onForward }: MessageBubbleProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const quickReactions = ["❤️", "👍", "😂", "😮", "😢", "🔥"];
  
  if (message.type === "system") {
    return (
      <div 
        className="w-full flex justify-center my-6 px-4 animate-fade-in"
        style={{ animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: "backwards" }}
      >
        <div className="bg-secondary/30 backdrop-blur-sm border border-border/10 px-6 py-2 rounded-full shadow-sm hover:bg-secondary/40 transition-colors">
          <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">{message.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex px-4 mb-2 group/msg relative",
        isMine ? "justify-end" : "justify-start",
        isMine ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: "backwards" }}
    >
      <div className="relative max-w-[70%] md:max-w-[60%]">
        {/* Reply preview */}
        {message.replyTo && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-2 mb-0.5 rounded-t-xl text-[11px] border-l-[3px] border-primary/60",
            isMine
              ? "bg-black/20 text-white rounded-br-none"
              : "bg-primary/10 text-foreground rounded-bl-none border-primary"
          )}>
            <CornerUpRight className="h-3 w-3 shrink-0 text-primary" />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-primary text-[10px]">{message.replyTo.name}</span>
              <span className="truncate opacity-80">{message.replyTo.text}</span>
            </div>
          </div>
        )}

        <div
          className={cn(
            "px-4 py-2.5 text-[14.5px] leading-relaxed relative",
            "transition-all duration-300 ease-out hover:scale-[1.01] active:scale-[0.99]",
            isMine
              ? "gradient-sent text-white shadow-lg shadow-primary/20"
              : "bg-card/95 border border-border/40 text-foreground shadow-elevated backdrop-blur-sm",
            message.replyTo
              ? isMine ? "rounded-b-[20px] rounded-br-[6px]" : "rounded-b-[20px] rounded-bl-[6px]"
              : isMine ? "rounded-[20px] rounded-br-[6px]" : "rounded-[20px] rounded-bl-[6px]",
            message.type === "image" && "p-2 overflow-hidden"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
            setShowReactions(false);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setShowReactions(!showReactions);
            setShowActions(false);
          }}
        >
          {/* Forwarded Tag */}
          {message.isForwarded && (
            <div className={cn("flex items-center gap-1 mb-1 opacity-80 italic text-[10px]", isMine ? "text-white/80" : "text-muted-foreground")}>
              <Forward className="h-3 w-3" /> Forwarded
            </div>
          )}

          {/* Image message */}
          {message.type === "image" && message.imageUrl && (
            <div className="relative rounded-xl overflow-hidden mb-1.5 shadow-inner bg-black">
              {!imgLoaded && (
                <div className="w-[260px] h-[180px] bg-muted/30 animate-pulse rounded-xl flex items-center justify-center">
                  <ImageIcon className="h-7 w-7 text-muted-foreground/30" />
                </div>
              )}
              <img
                src={resolveUrl(message.imageUrl)}
                alt="Shared image"
                className={cn(
                  "w-[260px] max-h-[300px] object-cover rounded-xl transition-all duration-500 group-hover/msg:scale-105",
                  imgLoaded ? "opacity-100" : "opacity-0 absolute"
                )}
                onLoad={() => setImgLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Video message */}
          {message.type === "video" && message.imageUrl && (
            <div className="relative rounded-xl overflow-hidden mb-1.5 shadow-inner bg-black">
              <video
                src={resolveUrl(message.imageUrl)}
                controls
                className="w-[260px] max-h-[300px] rounded-xl"
              />
            </div>
          )}

          {/* Document message */}
          {message.type === "document" && message.imageUrl && (
            <a href={resolveUrl(message.imageUrl)} target="_blank" rel="noreferrer" className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors mb-1.5 border",
              isMine ? "bg-white/10 hover:bg-white/20 border-white/20" : "bg-secondary/50 hover:bg-secondary/70 border-border/50"
            )}>
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", isMine ? "bg-white/20" : "bg-primary/10")}>
                <File className={cn("h-5 w-5", isMine ? "text-white" : "text-primary")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold truncate", isMine ? "text-white" : "text-foreground")}>{message.fileName || "Document"}</p>
                <p className={cn("text-[10px] mt-0.5", isMine ? "text-white/70" : "text-muted-foreground")}>{message.fileSize || "Unknown size"}</p>
              </div>
              <Download className={cn("h-4 w-4 shrink-0", isMine ? "text-white/70" : "text-muted-foreground")} />
            </a>
          )}

          {/* Voice message */}
          {message.type === "voice" && (
            <div className="flex items-center gap-4 min-w-[200px] py-1">
              <AudioPlayer 
                src={message.imageUrl || ""} 
                duration={message.voiceDuration} 
                isMine={isMine} 
              />
            </div>
          )}

          {/* Text content */}
          {message.deleted ? (
            <span className="flex items-center gap-2 text-muted-foreground/60 italic text-xs py-0.5">
              <Ban className="h-3.5 w-3.5 opacity-50" />
              This message was deleted
            </span>
          ) : message.text && message.type === "text" && (
            <span className="break-words overflow-wrap-anywhere block leading-[1.6]">
              {message.text}
            </span>
          )}

          {/* Timestamp + status */}
          <div
            className={cn(
              "flex items-center gap-1 justify-end mt-1.5 select-none opacity-70 group-hover/msg:opacity-100 transition-opacity",
              isMine ? "text-white/80" : "text-muted-foreground"
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {message.timestamp.split(" ").slice(-2).join(" ")}
            </span>
            {isMine && (
              <div className="flex -space-x-1.5 ml-0.5">
                {message.status === "read" ? (
                  <CheckCheck className="h-3.5 w-3.5 text-blue-400" strokeWidth={3} />
                ) : message.status === "delivered" ? (
                  <CheckCheck className="h-3.5 w-3.5 text-white/90" strokeWidth={2.5} />
                ) : (
                  <Check className="h-3.5 w-3.5 text-white/70" strokeWidth={2.5} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn(
            "flex items-center gap-1 -mt-1.5 relative z-10",
            isMine ? "justify-end pr-2" : "justify-start pl-2"
          )}>
            {message.reactions.map((r, i) => (
              <button
                key={i}
                className={cn(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-all duration-200",
                  "hover:scale-110 active:scale-95",
                  r.byMe
                    ? "bg-primary/15 border-primary/30 shadow-sm"
                    : "bg-card border-border/50 shadow-sm"
                )}
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="text-muted-foreground tabular-nums">{r.count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Reactions Popup (Double Click) */}
        {showReactions && (
          <div className={cn(
            "absolute -top-11 z-30 animate-in fade-in zoom-in duration-200",
            "flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border/50 shadow-elevated",
            isMine ? "right-0" : "left-0"
          )}>
            {quickReactions.map(emoji => (
              <button
                key={emoji}
                className="text-lg hover:scale-125 active:scale-95 transition-transform p-0.5"
                onClick={(e) => { e.stopPropagation(); onReact?.(emoji); setShowReactions(false); }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Actions Popup (Single Click) */}
        {showActions && (
          <div className={cn(
            "absolute -top-11 z-30 animate-in fade-in zoom-in duration-200",
            "flex items-center gap-1 px-2 py-1.5 rounded-full bg-card border border-border/50 shadow-elevated",
            isMine ? "right-0" : "left-0"
          )}>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar?.(message.id); setShowActions(false); }}
              className={cn(
                "p-1.5 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all",
                isStarred ? "text-amber-400" : "text-muted-foreground"
              )}
              title="Star"
            >
              <Star className="h-4 w-4" fill={isStarred ? "currentColor" : "none"} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onReply?.(); setShowActions(false); }} title="Reply" className="p-1.5 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-foreground">
              <CornerUpRight className="h-4 w-4" />
            </button>
            {onForward && !message.deleted && (
              <button onClick={(e) => { e.stopPropagation(); onForward(); setShowActions(false); }} title="Forward" className="p-1.5 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-foreground">
                <Forward className="h-4 w-4" />
              </button>
            )}
            {isMine && !message.deleted && onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(); setShowActions(false); }} title="Edit" className="p-1.5 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-blue-500">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {isMine && !message.deleted && onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(message.id); setShowActions(false); }}
                title="Delete for Everyone"
                className="p-1.5 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            {!message.deleted && onDeleteForMe && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteForMe(message.id); setShowActions(false); }}
                title="Delete for me"
                className="p-1.5 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <Ban className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Star indicator */}
        {isStarred && (
          <div className={cn("flex mt-0.5", isMine ? "justify-end pr-1" : "justify-start pl-1")}>
            <Star className="h-2.5 w-2.5 text-amber-400" fill="currentColor" />
          </div>
        )}
      </div>
    </div>
  );
}
