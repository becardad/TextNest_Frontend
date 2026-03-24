import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight, Eye, Heart, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { mockStatuses, currentUser } from "@/data/mockData";
import { ImageEditor } from "./ImageEditor";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Status, StatusItem as BaseStatusItem } from "@/data/mockData";

type StatusItem = BaseStatusItem & {
  likes?: { _id: string; name: string; profilePicture?: string }[];
  views?: { user: { _id: string; name: string; profilePicture?: string }; seenAt: string }[];
};

interface StatusViewProps {
  onClose: () => void;
}

function StatusViewer({ status, onClose }: { status: Status; onClose: () => void }) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const item = status.items[currentIndex] as StatusItem;
  
  const isMine = status.userId === user?.id;
  const isLiked = item.likes?.some(l => l._id === user?.id || (l as any) === user?.id);

  useEffect(() => {
    if (!isMine && item) {
      // Mark as seen
      api.put(`/chat/status/${item.id}/seen`).catch(console.error);
    }
  }, [item.id, isMine]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/chat/status/${item.id}/like`);
      // Optimistically update
      if (isLiked) {
        item.likes = item.likes?.filter(l => (l._id || (l as any)) !== user?.id) || [];
      } else {
        item.likes = [...(item.likes || []), { _id: user?.id || "", name: user?.name || "", profilePicture: user?.profilePicture } as any];
      }
      // Force rerender
      setCurrentIndex(currentIndex);
    } catch(err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/status/${item.id}`);
      toast.success("Status deleted");
      onClose();
    } catch (err) {
      toast.error("Failed to delete status");
    }
  };

  const goNext = () => {
    if (currentIndex < status.items.length - 1) setCurrentIndex(currentIndex + 1);
    else onClose();
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3 shrink-0">
        {status.items.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full bg-white transition-all duration-[5000ms]",
                i < currentIndex ? "w-full" : i === currentIndex ? "w-full" : "w-0"
              )}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <button onClick={onClose} className="p-1 text-white/80 hover:text-white active:scale-95 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {status.userAvatar ? (
          <img src={status.userAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <UserAvatar name={status.userName} size="sm" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{status.userName}</p>
          <p className="text-[10px] text-white/60">{item.timestamp}</p>
        </div>
        
        {isMine && (
          <div className="relative z-50">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
              className="p-1 text-white/80 hover:text-white active:scale-95 transition-all outline-none"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-popover rounded-xl border border-border shadow-xl overflow-hidden py-1 animate-fade-in z-50">
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative px-4" onClick={goNext}>
        {item.type === "image" ? (
          <div className="relative w-full max-w-lg">
            <img src={item.content} alt="" className="w-full max-h-[70vh] object-contain rounded-xl" />
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl">
                <p className="text-white text-sm">{item.caption}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={cn(
            "w-full max-w-lg aspect-[9/16] max-h-[70vh] rounded-xl bg-gradient-to-br flex items-center justify-center p-8",
            item.backgroundColor || "from-primary to-[hsl(24,70%,46%)]"
          )}>
            <p className="text-white text-xl font-semibold text-center leading-relaxed">{item.content}</p>
          </div>
        )}

        {/* Nav arrows */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 active:scale-95 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {currentIndex < status.items.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 active:scale-95 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Footer controls: Views and Likes */}
      <div className="px-4 py-4 flex flex-col gap-2 shrink-0 z-10 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          {isMine ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowViewers(!showViewers); }}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors p-2 -ml-2 rounded-lg relative z-50 px-3 hover:bg-white/10"
            >
              <Eye className="h-5 w-5" />
              <span className="text-sm font-medium">
                {item.views?.filter(v => !!v.user?._id && v.user._id !== status.userId).length || 0} views
              </span>
            </button>
          ) : (
            <div className="flex-1" /> // spacer
          )}

          {/* Like button for everyone */}
          <button
            onClick={handleToggleLike}
            className="flex items-center gap-1.5 p-2 rounded-full active:scale-95 transition-all"
          >
            <Heart 
              className={cn("h-6 w-6 transition-colors", isLiked ? "fill-primary text-primary" : "text-white/80 hover:text-white")} 
            />
            {isMine && item.likes && item.likes.length > 0 && (
              <span className={cn("text-sm font-semibold", isLiked ? "text-primary" : "text-white/80")}>
                {item.likes.length}
              </span>
            )}
          </button>
        </div>

        {/* Viewers Dropdown List (Only for Owner) */}
        {isMine && showViewers && item.views && item.views.filter(v => !!v.user?._id && v.user._id !== status.userId).length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto scrollbar-thin bg-black/40 rounded-xl rounded-b-none border-t border-white/10 p-2 space-y-2 animate-slide-up">
            {item.views.filter(v => !!v.user?._id && v.user._id !== status.userId).map((v, i) => {
              const hasLiked = item.likes?.some(l => (l._id || (l as any)) === (v.user._id || (v.user as any)));
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    {v.user.profilePicture ? (
                      <img src={v.user.profilePicture} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <UserAvatar name={v.user.name} size="sm" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white flex items-center gap-1.5">
                        {v.user.name}
                        {hasLiked && <Heart className="h-3 w-3 fill-primary text-primary" />}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(v.seenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AddStatusDialog({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"text" | null>(null);
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("from-primary to-[hsl(24,70%,46%)]");
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleEditedImage = async (file: File) => {
    setIsUploading(true);
    setSelectedImage(null); // Close editor
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const imageUrl = uploadRes.data.url;
      await api.post("/chat/status", {
        type: "image",
        content: imageUrl,
      });
      
      toast.success("Status updated!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post status");
    } finally {
      setIsUploading(false);
    }
  };

  const submitTextStatus = async () => {
    setIsUploading(true);
    try {
      await api.post("/chat/status", {
        type: "text",
        content: text,
        backgroundColor: bgColor
      });
      toast.success("Status updated!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post status");
    } finally {
      setIsUploading(false);
    }
  };

  const bgOptions = [
    "from-primary to-[hsl(24,70%,46%)]",
    "from-emerald-600 to-teal-700",
    "from-sky-600 to-blue-700",
    "from-rose-500 to-pink-600",
    "from-violet-600 to-purple-700",
    "from-amber-500 to-orange-600",
  ];

  if (selectedImage) {
    return (
      <ImageEditor 
        imageUrl={selectedImage} 
        onCancel={() => setSelectedImage(null)} 
        onComplete={handleEditedImage} 
      />
    );
  }

  if (!type) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
          <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent active:scale-95 transition-all">
            <X className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-base font-semibold text-foreground">Add Status</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <button
            onClick={() => setType("text")}
            className="w-full py-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(24,70%,46%)] flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <Type className="h-8 w-8 text-white" />
            <span className="text-white font-semibold">Text Status</span>
            <span className="text-white/60 text-xs">Share what's on your mind</span>
          </button>
          <label className="w-full relative py-12 rounded-2xl bg-secondary flex flex-col items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileSelect}
            />
            {isUploading ? (
              <span className="text-foreground font-semibold py-4">Uploading...</span>
            ) : (
              <>
                <ImagePlaceholder className="h-8 w-8 text-foreground" />
                <span className="text-foreground font-semibold">Photo Status</span>
                <span className="text-muted-foreground text-xs">Crop & Filter your image</span>
              </>
            )}
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in">
      <div className={cn("flex-1 bg-gradient-to-br flex flex-col", bgColor)}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setType(null)} className="p-1.5 rounded-lg text-white/80 hover:text-white active:scale-95 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {bgOptions.map((bg) => (
              <button
                key={bg}
                onClick={() => setBgColor(bg)}
                className={cn(
                  "h-6 w-6 rounded-full bg-gradient-to-br border-2 transition-all active:scale-95",
                  bg,
                  bgColor === bg ? "border-white scale-110" : "border-white/30"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a status…"
            className="w-full text-center text-xl font-semibold text-white placeholder:text-white/40 bg-transparent outline-none resize-none"
            rows={4}
            autoFocus
          />
        </div>
        <div className="px-4 py-4 flex justify-end">
          <button
            onClick={submitTextStatus}
            disabled={!text.trim() || isUploading}
            className="h-12 w-12 rounded-full gradient-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-40"
          >
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Type({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export default function StatusView({ onClose }: StatusViewProps) {
  const { user } = useAuth();
  const [viewingStatus, setViewingStatus] = useState<Status | null>(null);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      const res = await api.get('/chat/status');
      const rawStatuses = res.data;
      
      // Group by user
      const grouped = new Map<string, Status>();
      
      rawStatuses.forEach((s: any) => {
        const uid = s.userId._id;
        if (!grouped.has(uid)) {
          grouped.set(uid, {
            id: uid, // using userId as the group ID
            userId: uid,
            userName: s.userId.name,
            userAvatar: s.userId.profilePicture,
            items: [],
            seen: true, // will be false if any item is unseen
            timestamp: new Date(s.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          });
        }
        
        const group = grouped.get(uid)!;
        
        // Has current user seen this specific status item?
        const iSeenThis = s.views?.some((v: any) => v.user._id === user?.id || v.user === user?.id) || false;
        if (!iSeenThis && uid !== user?.id) {
          group.seen = false;
        }

        group.items.push({
          id: s._id,
          type: s.type,
          content: s.content,
          caption: s.caption,
          backgroundColor: s.backgroundColor,
          timestamp: new Date(s.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          views: s.views || [],
          likes: s.likes || [],
        } as any);
      });

      // Sort items within each group
      grouped.forEach(g => g.items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));

      setStatuses(Array.from(grouped.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [showAddStatus]); // refetch when add dialog closes

  const unseenStatuses = statuses.filter(s => !s.seen && s.userId !== user?.id);
  const seenStatuses = statuses.filter(s => s.seen && s.userId !== user?.id);
  const myStatus = statuses.find(s => s.userId === user?.id);

  if (showAddStatus) return <AddStatusDialog onClose={() => setShowAddStatus(false)} />;
  if (viewingStatus) return <StatusViewer status={viewingStatus} onClose={() => { setViewingStatus(null); fetchStatuses(); }} />;

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
        <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent active:scale-95 transition-all">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-base font-semibold text-foreground">Status</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* My status */}
        <div className="px-5 py-4 flex items-center justify-between group">
          <button
            onClick={() => myStatus ? setViewingStatus(myStatus) : setShowAddStatus(true)}
            className="flex-1 flex items-center gap-3 text-left"
          >
            <div className="relative">
              {myStatus && myStatus.items.length > 0 ? (
                <div className="rounded-full p-0.5 border-2 border-primary">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center text-primary text-lg font-bold">
                      {user?.name?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center text-primary text-lg font-bold">
                  {user?.name?.substring(0, 2).toUpperCase() || "U"}
                </div>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); setShowAddStatus(true); }}
                className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full gradient-primary flex items-center justify-center border-2 border-background hover:scale-110 transition-transform shadow-md"
              >
                <Plus className="h-3 w-3 text-white" />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">My Status</p>
              <p className="text-xs text-muted-foreground">{myStatus ? `${myStatus.items.length} updates` : "Tap to add status update"}</p>
            </div>
          </button>
        </div>

        <div className="mx-5 border-t border-border/40" />

        {/* Recent updates */}
        {unseenStatuses.length > 0 && (
          <div className="px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Recent updates</p>
            <div className="space-y-1">
              {unseenStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setViewingStatus(status)}
                  className="w-full flex items-center gap-3 py-2.5 rounded-xl hover:bg-accent/50 px-2 -mx-2 transition-colors active:scale-[0.99]"
                >
                  <div className="relative">
                    <div className="rounded-full p-0.5 bg-gradient-to-br from-primary to-[hsl(24,70%,46%)]">
                      <div className="bg-background rounded-full p-0.5">
                        {status.userAvatar ? (
                          <img src={status.userAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                        ) : (
                          <UserAvatar name={status.userName} size="lg" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{status.userName}</p>
                    <p className="text-xs text-muted-foreground">{status.timestamp}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Viewed updates */}
        {seenStatuses.length > 0 && (
          <div className="px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Viewed updates</p>
            <div className="space-y-1">
              {seenStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setViewingStatus(status)}
                  className="w-full flex items-center gap-3 py-2.5 rounded-xl hover:bg-accent/50 px-2 -mx-2 transition-colors active:scale-[0.99]"
                >
                  <div className="rounded-full p-0.5 border-2 border-muted-foreground/30">
                    {status.userAvatar ? (
                      <img src={status.userAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <UserAvatar name={status.userName} size="lg" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{status.userName}</p>
                    <p className="text-xs text-muted-foreground">{status.timestamp}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
