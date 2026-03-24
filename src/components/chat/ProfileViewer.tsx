import { useState } from "react";
import { ArrowLeft, Phone, Video, MessageCircle, Ban, Trash2, Lock, Bell, BellOff, ChevronRight, Heart, Image as ImageIcon, Link, File, Camera, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import type { Chat, User } from "@/data/mockData";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface ProfileViewerProps {
  user: User;
  chat?: Chat;
  isOwnProfile?: boolean;
  onClose: () => void;
  onCall?: (type: "voice" | "video") => void;
  onMessage?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function ProfileViewer({ user, chat, isOwnProfile, onClose, onCall, onMessage, isFavorite, onToggleFavorite }: ProfileViewerProps) {
  const { login } = useAuth(); // We can use login to quietly update context state
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [localProfilePic, setLocalProfilePic] = useState(user.profilePicture);
  const mediaCount = chat?.messages.filter(m => m.type === "image" || m.imageUrl).length || 0;

  const handleUpdateProfile = async (updates: Partial<User>) => {
    try {
      const res = await api.put('/chat/profile', updates);
      toast.success("Profile updated");
      const savedUser = JSON.parse(sessionStorage.getItem('user') || "{}");
      const updatedUser = { ...savedUser, ...updates };
      login(updatedUser, sessionStorage.getItem('token') || "");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const finalUrl = uploadRes.data.url;
      setLocalProfilePic(finalUrl);
      handleUpdateProfile({ profilePicture: finalUrl });
    } catch (err) {
      toast.error("Failed to upload avatar");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in overflow-hidden">
      {/* Header with profile picture background */}
      <div className="relative shrink-0">
        {/* Background blur */}
        <div className="absolute inset-0 h-48 overflow-hidden">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="" className="w-full h-full object-cover opacity-20 blur-2xl scale-125" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-primary/10 to-transparent" />
          )}
        </div>

        {/* Back button */}
        <div className="relative z-10 flex items-center gap-3 px-5 py-4">
          <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent/50 backdrop-blur-sm active:scale-95 transition-all">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-base font-semibold text-foreground">
            {isOwnProfile ? "My Profile" : "Contact Info"}
          </h2>
        </div>

        {/* Profile picture */}
        <div className="relative z-10 flex flex-col items-center pb-5 px-5">
          <div className="relative group">
            {localProfilePic ? (
              <img
                src={localProfilePic}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-background shadow-elevated"
              />
            ) : (
              <div className="border-4 border-background rounded-full shadow-elevated">
                <UserAvatar name={user.name} size="xl" />
              </div>
            )}
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full gradient-primary flex items-center justify-center shadow-md border-2 border-background active:scale-95 transition-transform cursor-pointer">
                <Camera className="h-3.5 w-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>
          <h3 className="text-xl font-bold text-foreground mt-3">{user.name}</h3>
          {user.phone && (
            <p className="text-sm text-muted-foreground mt-0.5">{user.phone}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.online ? (
              <span className="text-primary font-medium">Online</span>
            ) : (
              `Last seen ${user.lastSeen || "recently"}`
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Quick actions */}
        {!isOwnProfile && (
          <>
            <div className="flex items-center justify-center gap-5 py-4 px-5">
              {[
                { icon: Phone, label: "Audio", action: () => onCall?.("voice") },
                { icon: Video, label: "Video", action: () => onCall?.("video") },
                { icon: MessageCircle, label: "Chat", action: onMessage },
                { icon: Heart, label: isFavorite ? "Unfavorite" : "Favorite", action: () => onToggleFavorite?.() },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 group">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors active:scale-95">
                    <Icon className={cn("h-4.5 w-4.5 text-primary", label === "Unfavorite" && "fill-current")} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
            <div className="mx-5 border-t border-border/40" />
          </>
        )}

        {/* About / Bio */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</p>
            {isOwnProfile && (
              <button onClick={() => setEditingBio(!editingBio)} className="p-1 rounded hover:bg-accent transition-colors">
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          {editingBio && isOwnProfile ? (
            <div className="flex gap-2">
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="flex-1 h-8 px-2.5 rounded-md bg-secondary text-sm text-foreground border border-border outline-none focus:border-primary/40 transition-colors"
                autoFocus
              />
              <button
                onClick={() => { setEditingBio(false); handleUpdateProfile({ bio }); }}
                className="text-xs font-medium text-primary hover:text-primary/80 px-2"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-sm text-foreground">{bio || "Hey there! I'm using TextNest."}</p>
          )}
        </div>

        {user.phone && (
          <>
            <div className="mx-5 border-t border-border/40" />
            <div className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Phone</p>
              <p className="text-sm text-foreground">{user.phone}</p>
            </div>
          </>
        )}

        {/* Media section */}
        {chat && (
          <>
            <div className="mx-5 border-t border-border/40" />
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Media, Links & Docs</p>
                <span className="text-xs text-primary font-medium tabular-nums">{mediaCount}</span>
              </div>
              {mediaCount > 0 ? (
                <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                  {chat.messages
                    .filter(m => m.imageUrl)
                    .map(m => (
                      <div key={m.id} className="h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-secondary">
                        <img src={m.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No media shared yet</p>
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
          </>
        )}

        <div className="mx-5 border-t border-border/40" />

        {/* Settings */}
        <div className="px-5 py-4 space-y-1">
          {!isOwnProfile && (
            <>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors active:scale-[0.98]">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Mute Notifications</span>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground/50" />
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors active:scale-[0.98]">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Encryption</span>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground/50" />
              </button>
            </>
          )}
        </div>

        {/* Danger zone */}
        {!isOwnProfile && (
          <>
            <div className="mx-5 border-t border-border/40" />
            <div className="px-5 py-4 space-y-1 pb-8">
              <button
                onClick={() => toast.success(`${user.name} blocked`)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]"
              >
                <Ban className="h-4 w-4" />
                <span className="text-sm font-medium">Block {user.name.split(" ")[0]}</span>
              </button>
              <button
                onClick={() => toast.success("Chat deleted")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">Delete Chat</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
