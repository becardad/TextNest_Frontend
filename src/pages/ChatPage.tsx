import { useState, useEffect, useRef } from "react";
import SideNav, { NavTab } from "@/components/chat/SideNav";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyState from "@/components/chat/EmptyState";
import SkeletonChat from "@/components/chat/SkeletonChat";
import SettingsPanel from "@/components/chat/SettingsPanel";
import StatusView from "@/components/chat/StatusView";
import StarredMessages from "@/components/chat/StarredMessages";
import CallsSidebar, { CallLog } from "@/components/chat/CallsSidebar";
import ProfileViewer from "@/components/chat/ProfileViewer";
import CallScreen from "@/components/chat/CallScreen";
import GeminiChat from "@/components/chat/GeminiChat";
import { cn } from "@/lib/utils";
import type { Chat, User, Message } from "@/data/mockData";
import { encryptMessage, decryptMessage } from "@/lib/encryption";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { socket, atomicEmit } from "@/lib/socket";
import { toast } from "sonner";


export default function ChatPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("chats");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [starredMessages, setStarredMessages] = useState<{msg: Message; chatName: string}[]>([]);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(() => {
    return user?.archived ? new Set(user.archived) : new Set<string>();
  });
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    return user?.pinned ? new Set(user.pinned) : new Set<string>();
  });
  const [activeCall, setActiveCall] = useState<{user: User, type: "voice" | "video", incoming?: boolean, offer?: any} | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    return user?.favorites ? new Set((user.favorites as any).map((f: any) => typeof f === 'string' ? f : f._id)) : new Set<string>();
  });
  const activeChat = allChats.find((c) => c.user.id === activeChatId) ?? null;
  
  // Refs to avoid circular dependencies in socket listeners
  const allChatsRef = useRef(allChats);
  const activeChatIdRef = useRef(activeChatId);
  const userRef = useRef(user);
  const hasJoinedRef = useRef(false);

  useEffect(() => { allChatsRef.current = allChats; }, [allChats]);
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  useEffect(() => { userRef.current = user; }, [user]);

  const totalUnread = allChats.reduce((acc, chat) => acc + (chat.unread || 0), 0);

  // Derive panel states from activeTab
  // Only status remains as a mainPanel view, or none
  const showStatus = activeTab === "status";
  const mainPanel = showStatus ? "status" : null;

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab !== "chats") {
      setActiveChatId(null);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const [convRes, groupRes] = await Promise.all([
          api.get('/chat/conversations'),
          api.get('/chat/groups')
        ]);

        // convRes.data = [{ user, lastMessage }]
        const userChats: Chat[] = convRes.data.map((conv: any) => {
          const u = conv.user;
          const last = conv.lastMessage;
          return {
            user: { ...u, id: u._id, online: onlineUserIds.includes(u._id) },
            messages: [],
            lastMessage: last?.text ? decryptMessage(last.text) : (last?.type === 'image' ? '📷 Photo' : last?.type === 'voice' ? '🎙️ Voice note' : last?.type === 'document' ? '📎 Media' : 'Start chatting'),
            lastMessageTime: last ? new Date(last.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
            unread: conv.unread || 0,
          };
        });

        const groupChats: Chat[] = groupRes.data.map((g: any) => {
          return {
            user: {
              id: g._id,
              name: g.name,
              online: true,
              admin: g.admin,
              avatar: '',
              bio: `${g.members.length} members`,
              profilePicture: g.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(g.name) + '&background=random'
            },
            messages: [],
            lastMessage: 'Start chatting in this group',
            lastMessageTime: '',
            unread: 0,
          };
        });

        setAllChats([...userChats, ...groupChats]);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSyncData = async () => {
      try {
        const [starredRes, callsRes] = await Promise.all([
          api.get('/chat/messages/starred'),
          api.get('/chat/calls')
        ]);
        
        setStarredMessages(starredRes.data.map((m: any) => ({
          msg: { ...m, id: m._id },
          chatName: m.senderId?.name || 'Unknown'
        })));
        setStarredIds(new Set(starredRes.data.map((m: any) => m._id)));
        setCallLogs(callsRes.data.map((c: any) => ({
          id: c._id,
          user: (c.caller._id === user?.id ? c.receiver : c.caller) as any,
          type: c.type,
          direction: c.caller._id === user?.id ? 'outgoing' : 'incoming',
          status: c.status,
          time: new Date(c.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        })));
      } catch (err) {
        console.error('Failed to fetch sync data', err);
      }
    };

    fetchConversations();
    fetchSyncData();
  }, [user?.id]);

  // Update chats live whenever online users change
  useEffect(() => {
    setAllChats(prev => prev.map(c => ({
      ...c,
      user: { ...c.user, online: onlineUserIds.includes(c.user.id) }
    })));
  }, [onlineUserIds]);

  // Set up global socket listener so the Sidebar updates dynamically
  useEffect(() => {
    console.log("Socket Effect Running - user?.id changed:", user?.id);
    const onIncomingMessage = (msg: any) => {
      const currentAllChats = allChatsRef.current;
      const currentActiveChatId = activeChatIdRef.current;
      const currentUser = userRef.current;

      // Auto-log calls to the Sidebar when a call starts
      if (msg.type === "system" && msg.text.includes("started")) {
        const isVoice = msg.text.includes("Voice");
        const isOutgoing = String(msg.senderId) === String(currentUser?.id); 
        const contactId = isOutgoing ? msg.receiverId : msg.senderId;
        
        // Persist to DB
        api.post('/chat/calls', {
          receiver: contactId,
          type: isVoice ? "voice" : "video",
          status: "answered",
          duration: 0
        }).catch(console.error);

        setCallLogs(prev => {
          if (prev.some(log => String(log.id) === String(msg._id))) return prev;
          const contactUser = currentAllChats.find(c => String(c.user.id) === String(contactId))?.user || { id: contactId, name: "Unknown", online: false, avatar: "", profilePicture: "" };
          
          return [{
            id: msg._id,
            user: contactUser as any,
            type: isVoice ? "voice" : "video",
            direction: isOutgoing ? "outgoing" : "incoming",
            status: "answered",
            time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          }, ...prev];
        });
      }

      setAllChats((prev) => 
        prev.map((c) => {
          const chatId = String(c.user.id);
          const msgSenderId = String(msg.senderId);
          const msgReceiverId = String(msg.receiverId);
          const msgGroupId = msg.groupId ? String(msg.groupId) : null;
          const myId = String(currentUser?.id);

          if (chatId === msgSenderId || chatId === msgReceiverId || (msgGroupId && chatId === msgGroupId)) {
            return {
              ...c,
              lastMessage: msg.text ? decryptMessage(msg.text) : (msg.type === "image" ? "📷 Photo" : msg.type === "voice" ? "🎙️ Voice note" : "📎 Media"),
              lastMessageTime: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              unread: (String(currentActiveChatId) === chatId || msgSenderId === myId || msg.type === "system") ? 0 : (c.unread || 0) + 1
            };
          }
          return c;
        })
      );
    };

    const onlineListener = (ids: string[]) => {
      setOnlineUserIds(ids);
    };

    const handleConnect = () => {
      if (!socket.connected || hasJoinedRef.current) return;
      
      const currentUser = userRef.current;
      const currentAllChats = allChatsRef.current;
      
      if (currentUser?.id) {
        console.log("Performing atomic socket join for:", currentUser.id);
        atomicEmit('join', currentUser.id);
        // Rejoin group chats
        currentAllChats.forEach(c => {
          if (c.user.admin || c.user.bio?.includes('members')) {
            atomicEmit('join_group', c.user.id);
          }
        });
        hasJoinedRef.current = true;
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected - resetting join guard");
      hasJoinedRef.current = false;
    };

    const handleIncomingCall = (data: { from: string, fromName: string, callType: "voice" | "video", offer: any }) => {
      const currentAllChats = allChatsRef.current;
      const callerUser = currentAllChats.find(c => String(c.user.id) === String(data.from))?.user || {
        id: data.from,
        name: data.fromName,
        online: true,
        avatar: "",
        profilePicture: ""
      };
      
      toast.info(`Incoming ${data.callType} call from ${data.fromName}`, {
        duration: 10000,
        action: {
          label: "Answer",
          onClick: () => setActiveCall({
            user: callerUser as User,
            type: data.callType,
            incoming: true,
            offer: data.offer,
          })
        },
        cancel: {
          label: "Decline",
          onClick: () => socket.emit("call_rejected", { to: data.from })
        }
      });

      setActiveCall({
        user: callerUser as User,
        type: data.callType,
        incoming: true,
        offer: data.offer,
      });
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', onIncomingMessage);
    socket.on('online_users', onlineListener);
    socket.on('call_request', handleIncomingCall);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', onIncomingMessage);
      socket.off('online_users', onlineListener);
      socket.off('call_request', handleIncomingCall);
    };
  }, [user?.id]);

  // Sync document title with unread count
  useEffect(() => {
    const unread = allChats.reduce((acc, c) => acc + (c.unread || 0), 0);
    document.title = unread > 0 ? `(${unread}) TextNest` : "TextNest";
  }, [allChats]);

  // Reset unread when opening a chat
  useEffect(() => {
    if (activeChatId) {
      setAllChats(prev => prev.map(c => String(c.user.id) === String(activeChatId) ? { ...c, unread: 0 } : c));
    }
  }, [activeChatId]);

  // Removed localStorage sync effects
  // Persisted state is now managed via API calls in handlers below

  const handleToggleStar = async (message: Message, chatName: string) => {
    try {
      await api.put(`/chat/messages/${message.id}/star`);
      setStarredIds(prev => {
        const next = new Set(prev);
        if (next.has(message.id)) {
          next.delete(message.id);
          setStarredMessages(s => s.filter(x => x.msg.id !== message.id));
        } else {
          next.add(message.id);
          setStarredMessages(s => [...s, { msg: message, chatName }]);
        }
        return next;
      });
    } catch (err) { console.error(err); }
  };

  const handleToggleArchive = async (chatId: string) => {
    try {
      await api.put(`/chat/archive/${chatId}`);
      setArchivedIds(prev => {
        const next = new Set(prev);
        if (next.has(chatId)) next.delete(chatId);
        else next.add(chatId);
        // Sync back to auth context
        updateUser({ archived: [...next] });
        return next;
      });
    } catch (err) { console.error(err); }
  };

  const handleTogglePin = async (chatId: string) => {
    try {
      await api.put(`/chat/pin/${chatId}`);
      setPinnedIds(prev => {
        const next = new Set(prev);
        if (next.has(chatId)) next.delete(chatId);
        else next.add(chatId);
        // Sync back to auth context
        updateUser({ pinned: [...next] });
        return next;
      });
    } catch (err) { console.error(err); }
  };

  const handleToggleFavorite = async (chatId: string) => {
    try {
      await api.put(`/chat/favorites/${chatId}`);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(chatId)) next.delete(chatId);
        else next.add(chatId);
        // Sync back to auth context
        updateUser({ favorites: [...next] });
        return next;
      });
    } catch (err) { console.error(err); }
  };


  const handleCreateGroup = async (name: string, members: User[]) => {
    try {
      const res = await api.post('/chat/groups', { name, members: members.map(m => m.id) });
      const newGroup = res.data;
      const newGroupChat: Chat = {
        user: { 
          id: newGroup._id, 
          name: newGroup.name, 
          online: true, 
          admin: newGroup.admin,
          avatar: "", 
          bio: `${newGroup.members.length} members`,
          profilePicture: "https://ui-avatars.com/api/?name=" + encodeURIComponent(newGroup.name) + "&background=random" 
        },
        messages: [],
        lastMessage: "Group created",
        lastMessageTime: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        unread: 0
      };
      setAllChats(prev => [newGroupChat, ...prev]);
      socket.emit('join_group', newGroup._id);
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

  // Add a searched user to the chat list temporarily (they stay after first message via socket)
  const handleAddChat = (newUser: User) => {
    setAllChats(prev => {
      if (prev.some(c => c.user.id === newUser.id)) return prev;
      return [{
        user: { ...newUser, id: newUser.id, online: onlineUserIds.includes(newUser.id) },
        messages: [],
        lastMessage: 'Start a conversation',
        lastMessageTime: '',
        unread: 0,
      }, ...prev];
    });
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden font-sans">
      {/* Far Left Nav Rail - Desktop & Tablet */}
      <div className="hidden md:flex">
        <SideNav activeTab={activeTab} onTabChange={handleTabChange} unreadCount={totalUnread} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar / Calls Sidebar */}
        <div className={cn(
          "shrink-0 transition-all duration-300",
          activeChatId || mainPanel || activeTab === "gemini" ? "hidden md:flex md:w-[380px] lg:w-[420px]" : "flex w-full md:w-[380px] lg:w-[420px]"
        )}>
          {activeTab === "calls" ? (
            <CallsSidebar 
              callLogs={callLogs} 
              onStartCall={(u, type) => setActiveCall({ user: u, type })} 
            />
          ) : activeTab === "starred" ? (
            <StarredMessages starredMessages={starredMessages} onClose={() => setActiveTab("chats")} />
          ) : activeTab === "settings" ? (
            <SettingsPanel onClose={() => setActiveTab("chats")} />
          ) : activeTab === "profile" ? (
            <div className="w-full h-full border-r border-border">
              <ProfileViewer user={user!} isOwnProfile onClose={() => setActiveTab("chats")} />
            </div>
          ) : (
            <ChatSidebar
              chats={allChats}
              activeChatId={activeChatId}
              isArchivedView={activeTab === "archived"}
              archivedIds={archivedIds}
              onToggleArchive={handleToggleArchive}
              pinnedIds={pinnedIds}
              onTogglePin={handleTogglePin}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onSelectChat={(id) => { setActiveChatId(id); setActiveTab("chats"); }}
              onOpenSettings={() => handleTabChange("settings")}
              onOpenStatus={() => handleTabChange("status")}
              onOpenStarred={() => handleTabChange("starred")}
              onCreateGroup={handleCreateGroup}
              onAddChat={handleAddChat}
            />
          )}
        </div>

        {/* Main Panel (Chat Window / Empty State / Gemini) */}
        <div className={cn(
          "flex-1 flex min-w-0 transition-all duration-300",
          activeChatId || mainPanel || activeTab === "gemini" ? "flex" : "hidden md:flex"
        )}>
          {activeTab === "gemini" ? (
             <div className="flex-1">
               <GeminiChat />
             </div>
          ) : showStatus ? (
            <div className="flex-1 animate-fade-in">
              <StatusView onClose={() => setActiveTab("chats")} />
            </div>
          ) : loading ? (
            <div className="flex-1">
              <SkeletonChat />
            </div>
          ) : activeChat ? (
            <div className="flex-1" key={activeChat.user.id}>
              <ChatWindow 
                chat={activeChat} 
                onBack={() => setActiveChatId(null)} 
                starredIds={starredIds} 
                onToggleStar={(msg) => handleToggleStar(msg, activeChat.user.name)} 
                onStartCall={(type) => setActiveCall({ user: activeChat.user, type })}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                onBlockUser={(id) => setAllChats(prev => prev.filter(c => c.user.id !== id))}
                onDeleteChat={(id) => setAllChats(prev => prev.filter(c => c.user.id !== id))}
              />
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      
      {activeCall && (
        <CallScreen 
          user={activeCall.user} 
          type={activeCall.type} 
          incoming={activeCall.incoming}
          offer={activeCall.offer}
          onEnd={() => setActiveCall(null)} 
          onReject={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
