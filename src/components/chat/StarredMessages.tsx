import { ArrowLeft, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/data/mockData";

interface StarredMessagesProps {
  starredMessages: { msg: Message; chatName: string }[];
  onClose: () => void;
}

export default function StarredMessages({ starredMessages, onClose }: StarredMessagesProps) {

  return (
    <aside className="flex flex-col h-full bg-background w-full shrink-0 border-r border-border overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <Star className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">Starred Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {starredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 px-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-7 w-7 text-primary/60" />
            </div>
            <p className="text-sm font-medium">No starred messages</p>
            <p className="text-xs text-center text-muted-foreground/70">
              Long press or double-tap a message and tap the star to bookmark it here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {starredMessages.map(({ msg, chatName }) => (
              <div key={msg.id} className="px-5 py-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-primary">{chatName}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {msg.text || (msg.type === "image" ? "📷 Photo" : msg.type === "voice" ? "🎙️ Voice note" : "📎 Media")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {msg.senderId === "me" ? "You" : chatName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}