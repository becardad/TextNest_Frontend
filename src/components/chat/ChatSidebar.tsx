import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, MessageSquare, X, Pin, PinOff, BellOff, Archive, Plus, Settings, ArrowLeft, CircleDot, Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import NewGroupDialog from "./NewGroupDialog";
import TextNestLogo from "../TextNestLogo";
import type { Chat, User } from "@/data/mockData";
import api from "@/lib/api";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (userId: string) => void;
  onOpenSettings: () => void;
  onOpenStatus?: () => void;
  onOpenStarred?: () => void;
  onCreateGroup?: (name: string, members: User[]) => void;
  isArchivedView?: boolean;
  archivedIds: Set<string>;
  onToggleArchive: (chatId: string) => void;
  pinnedIds: Set<string>;
  onTogglePin: (chatId: string) => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (chatId: string) => void;
  onAddChat?: (user: User) => void; // called when a brand-new user is selected from search
}

type Tab = "all" | "favorites" | "unread" | "groups";

export default function ChatSidebar({ chats, activeChatId, onSelectChat, onOpenSettings, onOpenStatus, onOpenStarred, onCreateGroup, isArchivedView, archivedIds, onToggleArchive, pinnedIds, onTogglePin, favoriteIds, onToggleFavorite, onAddChat }: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [contextMenu, setContextMenu] = useState<{ chatId: string; x: number; y: number } | null>(null);
  const [localChats, setLocalChats] = useState(chats);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync localChats when parent chats prop changes
  useEffect(() => {
    setLocalChats(chats);
  }, [chats]);

  // Search backend when query changes
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!search.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/chat/search?q=${encodeURIComponent(search.trim())}`);
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [search]);

  // Clear search when going back to all chats (e.g. after deleting/blocking a user)
  useEffect(() => {
    if (!activeChatId) {
      setSearch("");
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [activeChatId]);

  // When search is active, show backend results; otherwise show local chats
  const archivedChats = localChats.filter((c) => archivedIds.has(c.user.id));
  const activeChats = localChats.filter((c) => !archivedIds.has(c.user.id));
  const pinnedChats = activeChats.filter((c) => pinnedIds.has(c.user.id) && (activeTab !== "all" || !favoriteIds.has(c.user.id)));
  const unpinnedChats = activeChats.filter((c) => !pinnedIds.has(c.user.id) && (activeTab !== "all" || !favoriteIds.has(c.user.id)));
  const onlineChats = activeChats.filter((c) => c.user.online && (activeTab !== "all" || !favoriteIds.has(c.user.id)));
  const favoriteChats = activeChats.filter((c) => favoriteIds.has(c.user.id));
  const archivedCount = localChats.filter((c) => (c as any).archived).length;

  const tabFiltered = activeTab === "favorites"
    ? activeChats.filter(c => favoriteIds.has(c.user.id))
    : activeTab === "unread"
    ? activeChats.filter(c => c.unread > 0)
    : activeTab === "groups"
    ? activeChats.filter(c => c.user.bio?.includes("members"))
    : activeChats;

  const tabs: { id: Tab; label: string; count?: number; icon?: React.ReactNode }[] = [
    { id: "all", label: "All" },
    { id: "favorites", label: "Favorites", count: activeChats.filter(c => favoriteIds.has(c.user.id) && c.unread > 0).reduce((sum, c) => sum + c.unread, 0) },
    { id: "unread", label: "Unread", count: activeChats.filter(c => c.unread > 0).length },
    { id: "groups", label: "Groups" },
  ];

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, chatId: string) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ chatId, x: rect.left + 100, y: rect.top });
  };

  const togglePin = (chatId: string) => {
    onTogglePin(chatId);
    setContextMenu(null);
  };

  const toggleArchive = (chatId: string) => {
    onToggleArchive(chatId);
    setContextMenu(null);
  };

  const renderChatItem = (chat: Chat, i: number) => (
    <button
      key={chat.user.id}
      onClick={() => onSelectChat(chat.user.id)}
      onContextMenu={(e) => handleContextMenu(e, chat.user.id)}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-300 group relative",
        "hover:bg-accent/40 active:scale-[0.99] border-b border-border/30 last:border-transparent",
        activeChatId === chat.user.id && "bg-accent/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] backdrop-blur-md border-transparent"
      )}
    >
      {activeChatId === chat.user.id && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full gradient-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]" />
      )}
      <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105">
        <UserAvatar name={chat.user.name} online={chat.user.online} size="lg" profilePicture={chat.user.profilePicture} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-[15px] text-foreground truncate tracking-tight">{chat.user.name}</span>
            {favoriteIds.has(chat.user.id) && <Heart className="h-3.5 w-3.5 text-primary/80 shrink-0 fill-primary/40" />}
            {chat.pinned && <Pin className="h-3 w-3 text-primary/70 shrink-0 rotate-45" />}
            {chat.muted && <BellOff className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
          </div>
          <span className={cn(
            "text-[10px] uppercase tracking-wider font-bold shrink-0 ml-2 transition-colors",
            chat.unread > 0 ? "text-primary" : "text-muted-foreground/60"
          )}>
            {chat.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 gap-3">
          <p className={cn(
            "text-[13.5px] truncate leading-tight tracking-tight",
            chat.unread > 0 && activeChatId !== chat.user.id ? "text-foreground font-bold" : "text-muted-foreground underline-offset-4 decoration-primary/30 group-hover:text-foreground/80"
          )}>
            {chat.typing ? (
              <span className="text-primary font-black italic animate-pulse-soft">typing…</span>
            ) : (
              chat.lastMessage
            )}
          </p>
          {chat.unread > 0 && activeChatId !== chat.user.id && (
            <span className="shrink-0 h-5 min-w-5 px-1.5 rounded-full gradient-primary text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-primary/40 ring-2 ring-background">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );

  const renderContextMenu = () => {
    if (!contextMenu) return null;
    const chat = localChats.find(c => c.user.id === contextMenu.chatId);
    if (!chat) return null;
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
        <div
          className="fixed z-50 w-44 py-1.5 rounded-xl bg-card border border-border shadow-elevated animate-fade-in"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: contextMenu.y }}
        >
          <button
            onClick={() => { onToggleFavorite(contextMenu.chatId); setContextMenu(null); }}
            className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent text-left flex items-center gap-2.5 transition-colors"
          >
            <Heart className={cn("h-3.5 w-3.5", favoriteIds.has(contextMenu.chatId) && "fill-current text-primary")} />
            {favoriteIds.has(contextMenu.chatId) ? "Unfavorite" : "Favorite"}
          </button>
          <button
            onClick={() => togglePin(contextMenu.chatId)}
            className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent text-left flex items-center gap-2.5 transition-colors"
          >
            {chat.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5 rotate-45" />}
            {chat.pinned ? "Unpin" : "Pin"}
          </button>
          <button
            onClick={() => toggleArchive(contextMenu.chatId)}
            className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent text-left flex items-center gap-2.5 transition-colors"
          >
            <Archive className="h-3.5 w-3.5" />
            {archivedIds.has(contextMenu.chatId) ? "Unarchive" : "Archive"}
          </button>
        </div>
      </>
    );
  };

  // Archived chats view
  if (isArchivedView) {
    return (
      <aside className="flex flex-col h-full bg-background w-full shrink-0 border-r border-border">
        <div className="p-5 pb-3 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Archived Chats</h1>
          </div>
        </div>
        <div className="mx-5 border-t border-border/60" />
        <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
          {archivedChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2 animate-fade-in">
              <Archive className="h-8 w-8 text-muted-foreground/40" />
              <p>No archived chats</p>
            </div>
          ) : (
            archivedChats.map((chat, i) => renderChatItem(chat, i))
          )}
        </div>
        {renderContextMenu()}
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full bg-background w-full shrink-0 border-r border-border">
      {/* Search Header */}
      <div className="p-5 pb-3 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Chats</h1>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setShowNewGroup(true)}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
              title="New group"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

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
            placeholder="Search conversations…"
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

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 active:scale-90 flex items-center gap-1.5 shrink-0",
                activeTab === tab.id
                  ? "bg-primary/15 text-primary shadow-[0_4px_12px_hsl(var(--primary)/0.15)] ring-1 ring-primary/20 backdrop-blur-md"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/40"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn("ml-1 tabular-nums", activeTab === tab.id ? "text-primary" : "text-muted-foreground")}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>



      {/* Online now strip */}
      {onlineChats.length > 0 && !search && activeTab === "all" && (
        <div className="px-5 pb-3 shrink-0">
          <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1">
            {onlineChats.map((chat, i) => (
              <button
                key={chat.user.id}
                onClick={() => onSelectChat(chat.user.id)}
                className="flex flex-col items-center gap-1.5 group animate-fade-in shrink-0"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
              >
                <div className="relative">
                  <div className={cn(
                    "rounded-full p-[2.5px] transition-all duration-700 shadow-sm",
                    activeChatId === chat.user.id
                      ? "bg-gradient-to-br from-[hsl(16,65%,52%)] to-[hsl(24,70%,46%)] ring-2 ring-primary/10"
                      : "bg-border/30 group-hover:bg-gradient-to-br group-hover:from-[hsl(16,65%,52%,0.4)] group-hover:to-[hsl(24,70%,46%,0.4)]"
                  )}>
                    <div className="bg-card rounded-full p-0.5">
                      <UserAvatar name={chat.user.name} online size="md" profilePicture={chat.user.profilePicture} />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[52px]">
                  {chat.user.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-5 border-t border-border/60" />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {search ? (
          // Show backend search results
          isSearching ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
              Searching…
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
              <Search className="h-8 w-8 text-muted-foreground/40" />
              <p>No users found</p>
            </div>
          ) : (
            <>
              <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">People</p>
              {searchResults.map((u: any) => {
                const id = u._id || u.id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      onAddChat?.({ ...u, id });
                      onSelectChat(id);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-300 hover:bg-accent/40 border-b border-border/30 last:border-transparent"
                  >
                    <UserAvatar name={u.name} online={u.online} size="lg" profilePicture={u.profilePicture} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] text-foreground truncate">{u.name}</p>
                      <p className="text-[13px] text-muted-foreground truncate">{u.bio || u.email || ""}</p>
                    </div>
                  </button>
                );
              })}
            </>
          )
        ) : tabFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2 animate-fade-in">
            <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
            <p>No conversations yet</p>
            <p className="text-xs text-muted-foreground/50">Search for someone to start chatting</p>
          </div>
        ) : (
          <>
            {pinnedChats.length > 0 && activeTab === "all" && (
              <>
                <div className="flex items-center gap-1.5 px-5 py-2">
                  <Pin className="h-3 w-3 text-muted-foreground/60 rotate-45" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Pinned</p>
                </div>
                {pinnedChats.map((chat, i) => renderChatItem(chat, i))}
                <div className="mx-5 my-1 border-t border-border/40" />
              </>
            )}
            {(activeTab === "all" ? unpinnedChats : tabFiltered).map((chat, i) => renderChatItem(chat, i))}
          </>
        )}
      </div>

      {/* Context menu */}
      {renderContextMenu()}

      {/* New Group Dialog */}
      {showNewGroup && (
        <NewGroupDialog
          contacts={chats.map(c => c.user)}
          onClose={() => setShowNewGroup(false)}
          onCreateGroup={(name, members) => {
            onCreateGroup?.(name, members);
            setShowNewGroup(false);
          }}
        />
      )}
    </aside>
  );
}
