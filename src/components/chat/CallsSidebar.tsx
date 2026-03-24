import { useState } from "react";
import { Search, X, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import type { User } from "@/data/mockData";

export interface CallLog {
  id: string;
  user: User;
  type: "voice" | "video";
  direction: "incoming" | "outgoing" | "missed";
  time: string;
}

interface CallsSidebarProps {
  callLogs: CallLog[];
  onStartCall: (user: User, type: "voice" | "video") => void;
}

export default function CallsSidebar({ callLogs, onStartCall }: CallsSidebarProps) {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = callLogs.filter(c => c.user.name.toLowerCase().includes(search.toLowerCase()));

  const renderCallIcon = (direction: string) => {
    switch (direction) {
      case "missed": return <PhoneMissed className="h-3.5 w-3.5 text-destructive" />;
      case "incoming": return <PhoneIncoming className="h-3.5 w-3.5 text-blue-500" />;
      case "outgoing": return <PhoneOutgoing className="h-3.5 w-3.5 text-green-500" />;
      default: return null;
    }
  };

  return (
    <aside className="flex flex-col h-full bg-background w-full shrink-0 border-r border-border">
      {/* Header */}
      <div className="p-5 pb-3 space-y-3 shrink-0">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Calls</h1>
        
        {/* Search */}
        <div className={cn(
          "relative rounded-xl transition-all duration-300",
          searchFocused && "shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
        )}>
          <Search className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
            searchFocused ? "text-primary" : "text-muted-foreground"
          )} />
          <input
            type="text"
            placeholder="Search calls…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full rounded-xl bg-secondary/80 pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none transition-all duration-300"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mx-5 border-t border-border/60" />

      {/* Call List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2 animate-fade-in">
            <Phone className="h-8 w-8 text-muted-foreground/40" />
            <p>No recent calls</p>
          </div>
        ) : (
          filtered.map(call => (
            <div
              key={call.id}
              className="w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-300 hover:bg-accent/30 group"
            >
              <UserAvatar name={call.user.name} online={call.user.online} size="lg" profilePicture={call.user.profilePicture} />
              
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "font-bold text-[15px] truncate block",
                  call.direction === "missed" ? "text-destructive" : "text-foreground"
                )}>
                  {call.user.name}
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  {renderCallIcon(call.direction)}
                  <span>{call.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onStartCall(call.user, "voice")}
                  className="p-2 rounded-full hover:bg-secondary text-primary transition-colors"
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onStartCall(call.user, "video")}
                  className="p-2 rounded-full hover:bg-secondary text-primary transition-colors"
                >
                  <Video className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
