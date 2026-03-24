import { ArrowLeft, Phone, Video, Bell, BellOff, Star, Lock, Ban, Trash2, ChevronRight, Image as ImageIcon, Link, File } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import type { User, Chat } from "@/data/mockData";

interface ContactDetailsProps {
  chat: Chat;
  onClose: () => void;
}

export default function ContactDetails({ chat, onClose }: ContactDetailsProps) {
  const { user } = chat;
  const isGroup = user.bio?.includes("members");
  const mediaCount = chat.messages.filter(m => m.type === "image" || m.imageUrl).length;

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-base font-semibold text-foreground">Contact Info</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile section */}
        <div className="flex flex-col items-center py-8 px-5 space-y-3">
          <UserAvatar name={user.name} online={user.online} size="xl" />
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
            {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
            <p className="text-xs text-muted-foreground">
              {user.online ? (
                <span className="text-primary font-medium">Online</span>
              ) : (
                `Last seen ${user.lastSeen || "recently"}`
              )}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-6 pt-2">
            {[
              { icon: Phone, label: "Call" },
              { icon: Video, label: "Video" },
              { icon: Star, label: "Favorite" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="flex flex-col items-center gap-1.5 group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors active:scale-95">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-5 border-t border-border/40" />

        {/* About / Bio */}
        <div className="px-5 py-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</p>
          <p className="text-sm text-foreground">{user.bio || "Hey there! I'm using TextNest."}</p>
        </div>

        <div className="mx-5 border-t border-border/40" />

        {/* Media, Links, Docs */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Media, Links & Docs</p>
            <span className="text-xs text-primary font-medium">{mediaCount}</span>
          </div>
          {mediaCount > 0 ? (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-thin pb-1">
              {chat.messages
                .filter(m => m.imageUrl)
                .map(m => (
                  <div key={m.id} className="h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-secondary">
                    <img src={m.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No media shared yet</p>
          )}
          <div className="flex gap-2 mt-3">
            {[
              { icon: ImageIcon, label: "Media", count: mediaCount },
              { icon: Link, label: "Links", count: 0 },
              { icon: File, label: "Docs", count: 0 },
            ].map(({ icon: Icon, label, count }) => (
              <button key={label} className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 hover:bg-accent transition-colors active:scale-[0.98]">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground ml-auto tabular-nums">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-5 border-t border-border/40" />

        {/* Group members */}
        {isGroup && (
          <>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{user.bio}</p>
              {["Sarah Mitchell", "Alex Rivera", "Priya Kapoor", "Emma Larsson", "You"].map((name) => (
                <div key={name} className="flex items-center gap-3 py-1">
                  <UserAvatar name={name} online={name !== "Priya Kapoor"} size="sm" />
                  <span className="text-sm text-foreground">{name}</span>
                  {name === "You" && <span className="text-[10px] text-muted-foreground ml-auto">Admin</span>}
                </div>
              ))}
            </div>
            <div className="mx-5 border-t border-border/40" />
          </>
        )}

        {/* Notifications */}
        <div className="px-5 py-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors active:scale-[0.98]">
            {chat.muted ? <BellOff className="h-4 w-4 text-muted-foreground" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm text-foreground">{chat.muted ? "Unmute Notifications" : "Mute Notifications"}</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground/50" />
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors active:scale-[0.98]">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Encryption</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground/50" />
          </button>
        </div>

        <div className="mx-5 border-t border-border/40" />

        {/* Danger zone */}
        <div className="px-5 py-4 space-y-2 pb-8">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]">
            <Ban className="h-4 w-4" />
            <span className="text-sm font-medium">Block {user.name.split(" ")[0]}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]">
            <Trash2 className="h-4 w-4" />
            <span className="text-sm font-medium">Delete Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
