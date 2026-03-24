import { useState, useEffect } from "react";
import { ArrowLeft, Moon, Sun, Type, Timer, Palette, LogOut, ChevronRight, User, Camera, Pencil, Shield, MessageSquare, Bell, Monitor, HelpCircle, Ban, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { ImageEditor } from "./ImageEditor";

interface SettingsPanelProps {
  onClose: () => void;
}

const DISAPPEAR_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "24 hours", value: 24 },
  { label: "7 days", value: 168 },
  { label: "90 days", value: 2160 },
];

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { user, updateUser } = useAuth();
  const [view, setView] = useState<"menu" | "profile" | "appearance" | "chat" | "account">("menu");
  const [textSize, setTextSize] = useState(user?.settings?.textSize || 16);
  const [disappearTime, setDisappearTime] = useState(user?.settings?.disappearTime || 0);
  const [isDark, setIsDark] = useState(user?.settings?.theme === "dark");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileBio, setProfileBio] = useState(user?.bio || "Available");
  const [editingProfile, setEditingProfile] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const handleThemeToggle = async () => {
    const next = !isDark;
    setIsDark(next);
    const themeStr = next ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next);
    try {
      await api.put('/chat/settings', { theme: themeStr });
      updateUser({ settings: { ...user?.settings!, theme: themeStr } });
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    onClose();
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    try {
      await api.put("/chat/profile", { bio: profileBio, name: profileName });
      updateUser({ bio: profileBio, name: profileName });
      setEditingProfile(false);
      toast.success("Profile updated");
    } catch(err) {
      toast.error("Failed to update profile");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const handleEditedImage = async (file: File) => {
    setIsUploading(true);
    setSelectedImage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const imageUrl = uploadRes.data.url;
      await api.put("/chat/profile", { profilePicture: imageUrl });
      updateUser({ profilePicture: imageUrl });
      
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const initials = profileName
    ? profileName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const menuItems = [
    { icon: User, label: "Account", onClick: () => { setView("account"); fetchBlockedUsers(); } },
    { icon: Shield, label: "Privacy", onClick: () => toast.info("Coming soon") },
    { icon: MessageSquare, label: "Chats", onClick: () => setView("chat") },
    { icon: Bell, label: "Notifications", onClick: () => toast.info("Coming soon") },
    { icon: Sun, label: "Personalization", onClick: () => setView("appearance") },
    { icon: Monitor, label: "Keyboard shortcuts", onClick: () => toast.info("Coming soon") },
    { icon: HelpCircle, label: "Help", onClick: () => toast.info("Coming soon") },
  ];

  const fetchBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const res = await api.get('/chat/blocked');
      setBlockedUsers(res.data);
    } catch { /* ignore */ } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await api.put(`/chat/unblock/${userId}`);
      setBlockedUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
      toast.success('User unblocked');
    } catch {
      toast.error('Failed to unblock user');
    }
  };

  if (selectedImage) {
    return (
      <ImageEditor 
        imageUrl={selectedImage} 
        onCancel={() => setSelectedImage(null)} 
        onComplete={handleEditedImage} 
      />
    );
  }

  return (
    <aside className="flex flex-col h-full bg-background w-full shrink-0 border-r border-border overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0 bg-card/30">
        <button
          onClick={view === "menu" ? onClose : () => setView("menu")}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-base font-semibold text-foreground">
          {view === "menu" && "Settings"}
          {view === "profile" && "Profile"}
          {view === "appearance" && "Personalization"}
          {view === "chat" && "Chat"}
          {view === "account" && "Account"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {view === "menu" && (
          <div className="flex flex-col">
            {/* Search Settings */}
            <div className="px-5 py-3 border-b border-border/40">
               <input
                 type="text"
                 placeholder="Search settings"
                 className="w-full h-9 px-4 rounded-xl bg-secondary/80 text-sm text-foreground placeholder:text-muted-foreground border-transparent outline-none transition-colors"
               />
            </div>
            
            {/* Profile Header Block */}
            <div 
              onClick={() => setView("profile")}
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-accent/40 transition-colors border-b border-border/40"
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="h-14 w-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-semibold text-foreground truncate">{user?.name || "User"}</p>
                <p className="text-[13px] text-muted-foreground truncate">{user?.bio || "Available"}</p>
              </div>
            </div>

            {/* Menu List */}
            <div className="flex flex-col py-2">
              {menuItems.map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-5 px-5 py-3 hover:bg-accent/40 transition-colors group"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-[15px] font-medium text-foreground">{item.label}</span>
                </button>
              ))}
              
              <div className="w-full h-[1px] bg-border/40 my-2" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-5 px-5 py-3 hover:bg-destructive/10 text-destructive transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-[15px] font-medium">Log out</span>
              </button>
            </div>
          </div>
        )}

        {view === "profile" && (
          <div className="px-5 py-6 space-y-6 animate-fade-in-right">
            <div className="flex flex-col items-center justify-center gap-4">
              <label className="relative group cursor-pointer block">
                {isUploading ? (
                  <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium border-2 border-border/50">
                    ...
                  </div>
                ) : user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="h-32 w-32 rounded-full object-cover transition-all group-hover:brightness-90" />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary/15 flex items-center justify-center text-primary text-4xl font-bold transition-all group-hover:brightness-90">
                    {initials}
                  </div>
                )}
                
                <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white mb-1" />
                  <span className="text-[10px] uppercase font-bold text-white text-center px-2">Change Photo</span>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileSelect} 
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary uppercase tracking-widest">Your Name</label>
                <div className="flex items-center gap-2">
                  <input
                    value={profileName}
                    onChange={(e) => { setProfileName(e.target.value); setEditingProfile(true); }}
                    className="w-full h-10 px-0 bg-transparent text-sm text-foreground border-b-2 border-primary/40 focus:border-primary outline-none transition-colors"
                  />
                  <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
                <p className="text-[11px] text-muted-foreground">This is not your username or pin. This name will be visible to your contacts.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary uppercase tracking-widest mt-4">About</label>
                <div className="flex items-center gap-2">
                  <input
                    value={profileBio}
                    onChange={(e) => { setProfileBio(e.target.value); setEditingProfile(true); }}
                    className="w-full h-10 px-0 bg-transparent text-sm text-foreground border-b-2 border-primary/40 focus:border-primary outline-none transition-colors"
                  />
                  <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </div>
              
              {editingProfile && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full mt-6 py-2.5 rounded-xl gradient-primary text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        )}

        {view === "appearance" && (
          <div className="px-5 py-4 space-y-6 animate-fade-in-right">
            {/* Theme */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-primary">Theme</label>
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="text-[15px] font-medium text-foreground">Dark Mode</p>
                    <p className="text-[13px] text-muted-foreground">Sleek and easy on the eyes</p>
                  </div>
                </div>
                <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
              </div>
            </div>

            {/* Text size */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-primary">Text Size</label>
              <div className="flex items-center gap-4 px-1 py-2 border-b border-border/40">
                <span className="text-xs text-muted-foreground font-medium">A</span>
                <Slider
                  value={[textSize]}
                  onValueChange={(v) => setTextSize(v[0])}
                  onValueCommit={async (v) => {
                    try {
                      await api.put('/chat/settings', { textSize: v[0] });
                      updateUser({ settings: { ...user?.settings!, textSize: v[0] } });
                    } catch (err) { console.error(err); }
                  }}
                  min={12}
                  max={22}
                  step={1}
                  className="flex-1"
                />
                <span className="text-lg text-muted-foreground font-medium">A</span>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/50 px-4 py-4 border border-border/20">
              <p style={{ fontSize: `${textSize}px` }} className="text-foreground leading-relaxed">
                Preview: Your messages will look like this.
              </p>
            </div>
          </div>
        )}

        {view === "chat" && (
          <div className="px-5 py-4 space-y-6 animate-fade-in-right">
            {/* Disappearing messages */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-primary">Message Timer</label>
              <p className="text-[13px] text-muted-foreground leading-snug">
                Make new messages in this chat disappear after the selected duration.
              </p>
              
              <div className="space-y-1 mt-2">
                {DISAPPEAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={async () => {
                      setDisappearTime(opt.value);
                      try {
                        await api.put('/chat/settings', { disappearTime: opt.value });
                        updateUser({ settings: { ...user?.settings!, disappearTime: opt.value } });
                      } catch (err) { console.error(err); }
                    }}
                    className="w-full flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent/40 transition-colors"
                  >
                    <span className="text-[15px] text-foreground">{opt.label}</span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      disappearTime === opt.value ? "border-primary" : "border-muted-foreground/50"
                    )}>
                      {disappearTime === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {view === "account" && (
          <div className="px-5 py-4 space-y-4 animate-fade-in-right">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Blocked Accounts</p>
              {loadingBlocked ? (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                  <Ban className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm">No blocked accounts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((u: any) => {
                    const id = u._id || u.id;
                    return (
                      <div key={id} className="flex items-center gap-3 py-3 border-b border-border/40">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.bio || ""}</p>
                        </div>
                        <button
                          onClick={() => handleUnblock(id)}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 transition-colors active:scale-95"
                        >
                          Unblock
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
