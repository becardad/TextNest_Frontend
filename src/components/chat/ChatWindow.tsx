import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Smile, ArrowLeft, Paperclip, Mic, Phone, Video, MoreVertical, Image as ImageIcon, MapPin, File, Camera, X, Ban, Trash2, Eye, Wallpaper, Download, Search } from "lucide-react";
import { encryptMessage, decryptMessage } from "@/lib/encryption";
import ForwardMessageDialog from "./ForwardMessageDialog";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import DateSeparator from "./DateSeparator";
import ProfileViewer from "./ProfileViewer";
import ViewOnceMedia from "./ViewOnceMedia";
import ChatBackgroundPicker from "./ChatBackgroundPicker";
import MessageRequestBanner from "./MessageRequestBanner";
import type { Chat, Message } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { socket } from "@/lib/socket";

function MenuButton({ label, icon, onClick, destructive }: { label: string; icon?: React.ReactNode; onClick: () => void; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center gap-2.5",
        destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
  textSize?: number;
  starredIds?: Set<string>;
  onToggleStar?: (msg: Message) => void;
  onCallLogged?: (log: any) => void;
  onStartCall?: (type: "voice" | "video") => void;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (chatId: string) => void;
  onBlockUser?: (userId: string) => void;
  onDeleteChat?: (userId: string) => void;
}

export default function ChatWindow({ chat, onBack, textSize = 16, starredIds, onToggleStar, onCallLogged, onStartCall, favoriteIds, onToggleFavorite, onBlockUser, onDeleteChat }: ChatWindowProps) {
  const { user, updateUser } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTypingRemote, setIsTypingRemote] = useState<string | boolean>(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [forwardMsg, setForwardMsg] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleExportChat = () => {
    const textBlob = messages.map(m => `[${m.timestamp}] ${m.senderId === "me" ? "You" : chat.user.name}: ${m.text || (m.type === 'image' ? '[Image]' : '[Media]')}`).join("\n");
    const blob = new Blob([textBlob], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chat.user.name}_chat_export.txt`;
    a.click();
    setShowMenu(false);
  };
  

  const [chatBg, setChatBg] = useState(() => user?.chatBackgrounds?.[chat.user.id] || "");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [viewOnceMode, setViewOnceMode] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [isMessageRequest, setIsMessageRequest] = useState<boolean | null>(null); // null = loading
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTypeRef = useRef<"media" | "document">("media");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setChatBg(user?.chatBackgrounds?.[chat.user.id] || "");
  }, [chat.user.id, user?.chatBackgrounds]);

  useEffect(() => {
    if (chatBg !== (user?.chatBackgrounds?.[chat.user.id] || "")) {
      api.put(`/chat/background/${chat.user.id}`, { background: chatBg })
        .then(() => updateUser({ chatBackgrounds: { ...user?.chatBackgrounds, [chat.user.id]: chatBg } }))
        .catch(console.error);
    }
  }, [chatBg, chat.user.id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${chat.user.id}`);
        const deletedForMe = JSON.parse(localStorage.getItem('deletedForMe') || "[]");
        const mapped = res.data.map((m: any) => {
          // Resolve reply name: if the replyTo sender is us, show "You", otherwise the chatted user name
          const isMine = m.senderId?.toString() === user?.id;
          let replyToMapped = undefined;
          if (m.replyTo) {
            const replyIsMine = m.replyTo.senderId?._id?.toString() === user?.id ||
                                m.replyTo.senderId?.toString() === user?.id;
            replyToMapped = {
              name: replyIsMine ? "You" : (m.replyTo.senderId?.name || chat.user.name),
              text: m.replyTo.text ? decryptMessage(m.replyTo.text) : "[Media]"
            };
          }
          return {
            ...m,
            text: decryptMessage(m.text),
            replyTo: replyToMapped,
            id: m._id,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            senderId: m.type === "system" ? "system" : (isMine ? "me" : m.senderId)
          };
        }).filter((m: any) => !deletedForMe.includes(m.id));
        setMessages(mapped);
      } catch (err) {
        console.error("Failed to fetch messages");
      }
    };
    
    fetchMessages();
    setInput("");
    setShowEmoji(false);
    setShowAttach(false);
    setShowProfile(false);
    setShowMenu(false);
    setIsTypingRemote(false);
    setIsMessageRequest(null);

    // Check if this is a first-time message (only relevant if we have existing messages to receive)
    api.get(`/chat/first-message/${chat.user.id}`)
      .then(res => {
        // Only show request banner if there ARE incoming messages (i.e. sender sent us something but we haven't replied)
        // We rely on messages loaded above — if messages exist and all are from them, it's a request
        setIsMessageRequest(res.data.isFirst === false ? null : null); // Will refine below after messages load
      })
      .catch(() => setIsMessageRequest(null));
  }, [chat.user.id, user]);

  // After messages load, determine if this is a pending request
  // A "request" = messages exist, all are from the other person (we never replied), and it's a group chat or DM
  useEffect(() => {
    if (messages.length === 0) { setIsMessageRequest(false); return; }
    const hasReplied = messages.some(m => m.senderId === 'me');
    const hasIncoming = messages.some(m => m.senderId !== 'me' && m.senderId !== 'system');
    if (!hasReplied && hasIncoming) {
      setIsMessageRequest(true);
    } else {
      setIsMessageRequest(false);
    }
  }, [messages.length]);

  useEffect(() => {
    const messageListener = (msg: any) => {
      const myId = String(user?.id);
      const msgSenderId = String(msg.senderId);
      const msgId = String(msg._id);

      // 1. Prevent duplicate if this message was sent by current user (already added optimistically)
      if (msgSenderId === myId) return;

      // 2. Prevent duplicate if this exact message is already in state (useful for multi-tab sync)
      // Note: we check both .id and ._id for compatibility
      if (messages.some(m => String(m.id) === msgId || String((m as any)._id) === msgId)) return;

      // For groups, msg.receiverId is the group ID (chat.user.id). 
      // For personal, msg.senderId is the peer (chat.user.id).
      const chatId = String(chat.user.id);
      const msgReceiverId = String(msg.receiverId);

      if (msgSenderId === chatId || msgReceiverId === chatId) {
        setMessages((prev) => {
          if (prev.some(m => String(m.id) === msgId || String((m as any)._id) === msgId)) return prev;
          
          const deletedForMe = JSON.parse(localStorage.getItem('deletedForMe') || "[]");
          if (deletedForMe.includes(msgId)) return prev;

          return [...prev, {
            ...msg,
            text: decryptMessage(msg.text),
            replyTo: msg.replyToResolved || (msg.replyTo?.text ? { name: msg.replyTo.senderId?.name || chat.user.name, text: decryptMessage(msg.replyTo.text) } : undefined),
            isForwarded: msg.isForwarded || false,
            id: msg._id,
            timestamp: msg.timestamp || new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            senderId: msg.type === "system" ? "system" : (msgSenderId === myId ? "me" : msg.senderId)
          }];
        });
        // Immediately mark as read if we are looking at this chat
        api.put(`/chat/messages/read/${chat.user.id}`).then(() => {
          socket.emit('messages_read', { readerId: user?.id, senderId: chat.user.id });
        }).catch(() => {});
      }
    };

    const typingListener = ({ senderId, senderName }: any) => {
      if (senderId === chat.user.id) setIsTypingRemote(true);
      else if ((chat as any).type === "group" && (chat as any).groupMembers?.some((m: any) => m.id === senderId)) {
        setIsTypingRemote(senderName || "Member");
      }
    };

    const stopTypingListener = ({ senderId }: any) => {
      if (senderId === chat.user.id) setIsTypingRemote(false);
    };

    const readListener = ({ readerId }: any) => {
      if (readerId === chat.user.id) {
        setMessages((prev) => prev.map(m => m.senderId === "me" ? { ...m, status: "read" } : m));
      }
    };

    const deleteListener = ({ messageId }: any) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, deleted: true, text: "This message was deleted", imageUrl: "" } : m));
    };

    const viewOnceListener = ({ messageId }: any) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, viewed: true } : m));
    };

    socket.on('receive_message', messageListener);
    socket.on('typing', typingListener);
    socket.on('stop_typing', stopTypingListener);
    socket.on('messages_read', readListener);
    socket.on('message_deleted', deleteListener);
    socket.on('view_once_opened', viewOnceListener);

    const editedListener = ({ messageId, newText }: any) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: decryptMessage(newText), edited: true } : m));
    };

    const reactedListener = ({ messageId, emoji, userId }: any) => {
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m;
        const existing = (m.reactions || []).find((r: any) => r.emoji === emoji && r.byMe === false);
        if (existing) return { ...m, reactions: (m.reactions || []).filter((r: any) => !(r.emoji === emoji)) };
        const reactions = [...(m.reactions || []), { emoji, count: 1, byMe: false }];
        return { ...m, reactions };
      }));
    };

    return () => {
      socket.off('receive_message', messageListener);
      socket.off('typing', typingListener);
      socket.off('stop_typing', stopTypingListener);
      socket.off('messages_read', readListener);
      socket.off('message_deleted', deleteListener);
      socket.off('view_once_opened', viewOnceListener);
      socket.off('message_edited', editedListener);
      socket.off('message_reacted', reactedListener);
    };
  }, [chat.user.id, user]);

  // Mark messages as read only when this component first mounts (i.e. user opens the chat)
  useEffect(() => {
    api.put(`/chat/messages/read/${chat.user.id}`).then(() => {
      socket.emit('messages_read', { readerId: user?.id, senderId: chat.user.id });
      setMessages((prev) => prev.map(m => m.senderId !== "me" ? { ...m, status: "read" } : m));
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.user.id]);

  // Track first load per chat to snap scroll instantly
  const isInitialLoad = useRef(true);
  useEffect(() => {
    isInitialLoad.current = true;
  }, [chat.user.id]);

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: isInitialLoad.current ? "auto" : "smooth" });
    isInitialLoad.current = false;
  }, [messages]);

  const handleTyping = () => {
    
    // Typing indicator logic
    socket.emit('typing', { senderId: user?.id, receiverId: chat.user.id, senderName: user?.name });
    if (typingTimer) clearTimeout(typingTimer);
    
    const newTimer = setTimeout(() => {
      socket.emit('stop_typing', { senderId: user?.id, receiverId: chat.user.id });
    }, 2000);
    setTypingTimer(newTimer);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !editingMsg) return;
    setInput("");
    setShowEmoji(false);
    setShowAttach(false);
    if (typingTimer) clearTimeout(typingTimer);
    socket.emit('stop_typing', { senderId: user?.id, receiverId: chat.user.id });

    // EDIT MODE
    if (editingMsg) {
      const msgId = editingMsg.id;
      setEditingMsg(null);
      try {
        await api.put(`/chat/messages/${msgId}/edit`, { text: encryptMessage(text) });
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text, edited: true } : m));
        socket.emit('message_edit', { messageId: msgId, newText: encryptMessage(text), receiverId: chat.user.id });
        toast.success("Message edited");
      } catch { toast.error("Failed to edit message"); }
      return;
    }

    const textToSend = text;
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      senderId: "me",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "sent",
      replyTo: replyTo ? {
        name: replyTo.senderId === "me" ? "You" : chat.user.name,
        text: replyTo.type === "image" ? "📷 Photo" :
              replyTo.type === "video" ? "🎥 Video" :
              replyTo.type === "voice" ? "🎙️ Voice note" :
              replyTo.type === "document" ? `📎 ${replyTo.fileName || "Document"}` :
              replyTo.text || "[Message]"
      } : undefined,
    };
    setMessages(prev => [...prev, tempMsg]);
    const replySnap = replyTo;
    setReplyTo(null);

    try {
      const res = await api.post(`/chat/messages/${chat.user.id}`, { text: encryptMessage(textToSend), replyTo: replySnap?.id });
      const newMsg = res.data;
      const formattedMsg: Message = {
        ...newMsg,
        text: textToSend,
        id: newMsg._id,
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        senderId: "me",
        status: "delivered",
        replyTo: tempMsg.replyTo,
      };
      setMessages(prev => prev.map(m => m.id === tempId ? formattedMsg : m));
      // Pass resolved replyTo so receiver can display it correctly
      socket.emit('send_message', { ...newMsg, replyToResolved: tempMsg.replyTo });
    } catch (err) {
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleReact = async (msgId: string, emoji: string) => {
    try {
      await api.post(`/chat/messages/${msgId}/react`, { emoji });
      setMessages(prev => prev.map(m => {
        if (m.id !== msgId) return m;
        const existing = (m.reactions || []).find((r: any) => r.emoji === emoji && r.byMe);
        if (existing) {
          return { ...m, reactions: (m.reactions || []).filter((r: any) => !(r.emoji === emoji && r.byMe)) };
        }
        return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, byMe: true }] };
      }));
      socket.emit('message_react', { messageId: msgId, emoji, userId: user?.id, receiverId: chat.user.id });
    } catch { toast.error("Failed to react"); }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await api.delete(`/chat/messages/${msgId}`);
      setMessages((prev) => prev.map(m => m.id === msgId ? { ...m, deleted: true, text: "This message was deleted", imageUrl: "" } : m));
      socket.emit('delete_message', { messageId: msgId, receiverId: chat.user.id });
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const handleDeleteForMe = (msgId: string) => {
    const deletedForMe = JSON.parse(localStorage.getItem('deletedForMe') || "[]");
    if (!deletedForMe.includes(msgId)) {
      deletedForMe.push(msgId);
      localStorage.setItem('deletedForMe', JSON.stringify(deletedForMe));
    }
    setMessages(prev => prev.filter(m => m.id !== msgId));
    toast.success("Message deleted for you");
  };

  const handleSendViewOnce = async () => {
    const tempId = `vo-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      senderId: "me",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "sent",
      type: "view-once",
      viewOnce: true,
      viewed: false,
      imageUrl: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=400&h=300&fit=crop",
    };
    setMessages((prev) => [...prev, tempMsg]);
    setViewOnceMode(false);
    setShowAttach(false);
    toast.success("View once photo sent");

    try {
      const res = await api.post(`/chat/messages/${chat.user.id}`, { 
        text: "", type: "view-once", viewOnce: true, imageUrl: tempMsg.imageUrl 
      });
      const newMsg = res.data;
      const formattedMsg: Message = {
        ...newMsg,
        id: newMsg._id,
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        senderId: "me",
        status: "delivered"
      };
      
      setMessages((prev) => prev.map(m => m.id === tempId ? formattedMsg : m));
      socket.emit('send_message', newMsg);
    } catch (err) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter(m => m.id !== tempId)); 
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    event.target.value = '';
    setShowAttach(false);

    const tempId = `file-${Date.now()}`;
    const isDocRequest = uploadTypeRef.current === "document";
    
    let fileType = "document";
    if (!isDocRequest) {
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';
      else fileType = 'document'; // Fallback if they select a random file in the media picker
    }

    const tempUrl = URL.createObjectURL(file);
    
    const tempMsg: Message = {
      id: tempId,
      senderId: "me",
      text: file.name,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "sent",
      type: fileType as any,
      imageUrl: tempUrl,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB"
    };
    
    setMessages(prev => [...prev, tempMsg]);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const finalUrl = uploadRes.data.url;
      const res = await api.post(`/chat/messages/${chat.user.id}`, { 
        text: fileType === 'document' ? file.name : "", 
        type: fileType, 
        imageUrl: finalUrl,
        fileName: file.name,
        fileSize: tempMsg.fileSize
      });
      const newMsg = res.data;
      const formattedMsg: Message = {
        ...newMsg,
        id: newMsg._id,
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        senderId: "me",
        status: "delivered"
      };
      
      setMessages((prev) => prev.map(m => m.id === tempId ? formattedMsg : m));
      socket.emit('send_message', newMsg);
    } catch (err) {
      toast.error("Failed to upload file");
      setMessages((prev) => prev.filter(m => m.id !== tempId)); 
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        audioBitsPerSecond: 128000 // 128kbps for 'original' quality
      });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        const tempId = `voice-${Date.now()}`;
        const tempUrl = URL.createObjectURL(audioBlob);
        
        const tempMsg: Message = {
          id: tempId,
          senderId: "me",
          text: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          status: "sent",
          type: "voice",
          imageUrl: tempUrl,
          voiceDuration: "0:05"
        };
        setMessages(prev => [...prev, tempMsg]);

        const formData = new FormData();
        formData.append('file', audioBlob, `voice-${Date.now()}.webm`);
        
        try {
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const finalUrl = uploadRes.data.url;
          const res = await api.post(`/chat/messages/${chat.user.id}`, { 
            text: "", type: "voice", imageUrl: finalUrl, voiceDuration: "0:05"
          });
          
          const newMsg = res.data;
          const formattedMsg = { ...newMsg, id: newMsg._id, senderId: "me", status: "delivered", timestamp: new Date(newMsg.createdAt).toLocaleTimeString() };
          setMessages(prev => prev.map(m => m.id === tempId ? formattedMsg : m));
          socket.emit('send_message', newMsg);
        } catch (err) {
          toast.error("Failed to send voice message");
          setMessages(prev => prev.filter(m => m.id !== tempId));
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const emojis = ["😊", "😂", "❤️", "👍", "🔥", "🎉", "😎", "🤔", "💯", "✨", "👋", "🙌", "🥰", "😤", "🫡", "💀", "🥲", "😈", "🤝", "💪", "🎯", "⚡", "🌟", "🫶"];

  const attachOptions = [
    { icon: ImageIcon, label: "Photo / Video", color: "text-amber-500", action: () => { if(fileInputRef.current) { uploadTypeRef.current = "media"; fileInputRef.current.accept = "image/*,video/*"; fileInputRef.current.click(); } } },
    { icon: File, label: "Document", color: "text-sky-500", action: () => { if(fileInputRef.current) { uploadTypeRef.current = "document"; fileInputRef.current.accept = "*/*"; fileInputRef.current.click(); } } },
    { icon: MapPin, label: "Location", color: "text-teal-500", action: () => toast.info("Location sharing — requires backend") },
    { icon: Eye, label: "View Once", color: "text-primary", action: () => handleSendViewOnce() },
  ];

  const handleInitiateCall = async (type: "voice" | "video") => {
    if (onStartCall) onStartCall(type);
    const typeLabel = type === "voice" ? "Voice call" : "Video call";
    try {
      const res = await api.post(`/chat/messages/${chat.user.id}`, { 
        text: `${typeLabel} started`, 
        type: "system" 
      });
      const newMsg = res.data;
      const formatted: Message = { 
        ...newMsg, 
        id: newMsg._id, 
        senderId: "system", 
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) 
      };
      setMessages(prev => [...prev, formatted]);
      socket.emit('send_message', newMsg);
    } catch (err) {
      console.error("Failed to log call start");
    }
  };



  const handleBlockUser = async () => {
    try {
      await api.put(`/chat/block/${chat.user.id}`);
      toast.success(`${chat.user.name} has been blocked`);
      setShowMenu(false);
      onBlockUser?.(chat.user.id);
      if (onBack) onBack();
    } catch {
      toast.error('Failed to block user');
    }
  };

  const handleClearChat = async () => {
    try {
      await api.delete(`/chat/conversations/${chat.user.id}`);
      setMessages([]);
      toast.success("Chat cleared");
      setShowMenu(false);
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  const handleDeleteChat = async () => {
    try {
      await api.delete(`/chat/conversations/${chat.user.id}`);
      toast.success("Chat deleted");
      setShowMenu(false);
      onDeleteChat?.(chat.user.id);
      if (onBack) onBack();
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleAcceptRequest = () => {
    setIsMessageRequest(false);
    toast.success(`You can now chat with ${chat.user.name}`);
  };

  const handleBlockRequest = async () => {
    try {
      await api.put(`/chat/block/${chat.user.id}`);
      toast.success(`${chat.user.name} has been blocked`);
      onBlockUser?.(chat.user.id);
      if (onBack) onBack();
    } catch {
      toast.error('Failed to block user');
    }
  };



  // Profile viewer
  if (showProfile) {
    return (
      <ProfileViewer
        user={chat.user}
        chat={chat}
        onClose={() => setShowProfile(false)}
        onCall={(type) => { setShowProfile(false); handleInitiateCall(type); }}
        onMessage={() => setShowProfile(false)}
        isFavorite={favoriteIds?.has(chat.user.id)}
        onToggleFavorite={() => onToggleFavorite?.(chat.user.id)}
        isGroupAdmin={chat.user.admin === user?.id}
        groupId={(chat as any).type === "group" || chat.user.admin ? chat.user.id : undefined}
      />
    );
  }

  // Background picker
  if (showBgPicker) {
    return (
      <ChatBackgroundPicker
        currentBg={chatBg}
        onSelect={(bg) => { setChatBg(bg); setShowBgPicker(false); toast.success("Wallpaper updated"); }}
        onClose={() => setShowBgPicker(false)}
      />
    );
  }

  const bgStyle: React.CSSProperties = chatBg
    ? chatBg.startsWith("url(")
      ? { backgroundImage: chatBg, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: chatBg }
    : { background: "hsl(var(--chat-surface))" };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 glass border-b border-border/50 shrink-0 z-10">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-1 -ml-1 rounded-lg hover:bg-accent transition-all active:scale-95">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <button onClick={() => setShowProfile(true)} className="relative cursor-pointer group">
            <UserAvatar name={chat.user.name} online={chat.user.online} profilePicture={chat.user.profilePicture} />
          </button>
          <button onClick={() => setShowProfile(true)} className="flex-1 min-w-0 text-left">
            <h2 className="text-sm font-semibold text-foreground truncate">{chat.user.name}</h2>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {isTypingRemote ? (
                <span className="text-primary font-medium animate-pulse-soft">typing…</span>
              ) : chat.user.online ? (
                <span className="text-primary">online</span>
              ) : (
                `Last seen ${chat.user.lastSeen || "recently"}`
              )}
            </p>
          </button>
        </div>
        <div className="flex items-center gap-0 relative">
          <button onClick={() => setShowSearch(!showSearch)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-95">
            <Search className="h-4 w-4" />
          </button>
          <button onClick={() => handleInitiateCall("voice")} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-95">
            <Phone className="h-4 w-4" />
          </button>
          <button onClick={() => handleInitiateCall("video")} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-95">
            <Video className="h-4 w-4" />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-95">
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-30 w-52 py-1.5 rounded-xl bg-card border border-border shadow-elevated animate-fade-in">
                <MenuButton label="Contact Info" onClick={() => { setShowProfile(true); setShowMenu(false); }} />
                <MenuButton label="Export Chat" icon={<Download className="h-3.5 w-3.5" />} onClick={handleExportChat} />
                <MenuButton label="Wallpaper" icon={<Wallpaper className="h-3.5 w-3.5" />} onClick={() => { setShowBgPicker(true); setShowMenu(false); }} />
                <MenuButton label="Mute Notifications" onClick={() => { toast.success("Notifications muted"); setShowMenu(false); }} />
                <MenuButton label="Clear Chat" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClearChat} destructive />
                <MenuButton label="Delete Chat" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleDeleteChat} destructive />
                <MenuButton label="Block User" icon={<Ban className="h-3.5 w-3.5" />} onClick={handleBlockUser} destructive />
              </div>
            </>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="px-4 py-2 glass border-b border-border/50 shrink-0 z-10 animate-slide-in-right">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search in chat..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full bg-secondary/80 rounded-full pl-9 pr-8 py-1.5 text-xs border-none focus:ring-1 focus:ring-primary/30 outline-none transition-colors" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message Request Banner */}
      {isMessageRequest && (
        <MessageRequestBanner
          sender={chat.user}
          onAccept={handleAcceptRequest}
          onBlock={handleBlockRequest}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-3 space-y-0.5 relative" style={{ ...bgStyle, fontSize: `${textSize}px` }}>
        {chatBg && chatBg.startsWith("url(") && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}
        <DateSeparator date="Today" />
        {messages.filter(m => !searchQuery || (m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase()))).map((msg, i) => (
          msg.type === "view-once" && msg.viewOnce ? (
            <div key={msg.id} className={cn("flex px-4 mb-2", msg.senderId === "me" ? "justify-end" : "justify-start")}>
              <div className="max-w-[70%]">
                <ViewOnceMedia
                  imageUrl={msg.imageUrl || ""}
                  isMine={msg.senderId === "me"}
                  viewed={!!msg.viewed}
                  onView={() => {
                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, viewed: true } : m));
                    if (msg.senderId !== "me") {
                      api.put(`/chat/messages/view-once/${msg.id}`).catch(() => {});
                      socket.emit('view_once_opened', { messageId: msg.id, senderId: chat.user.id });
                    }
                  }}
                />
                <span className={cn(
                  "flex items-center gap-1 justify-end mt-0.5 text-[10px]",
                  msg.senderId === "me" ? "text-muted-foreground" : "text-muted-foreground"
                )}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ) : (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isMine={msg.senderId === "me"} 
              index={i} 
              isStarred={starredIds?.has(msg.id)} 
              onToggleStar={onToggleStar ? (msgId) => {
                const m = messages.find(x => x.id === msgId);
                if (m) onToggleStar(m);
              } : undefined} 
              onDelete={handleDeleteMessage}
              onDeleteForMe={handleDeleteForMe}
              onReply={() => setReplyTo(msg)}
              onEdit={msg.senderId === "me" ? () => { setEditingMsg(msg); setInput(msg.text); } : undefined}
              onReact={(emoji) => handleReact(msg.id, emoji)}
              onForward={() => setForwardMsg(msg)}
            />
          )
        ))}
        {isTypingRemote && <TypingIndicator name={typeof isTypingRemote === 'string' ? isTypingRemote : chat.user.name} />}
        <div ref={bottomRef} />
      </div>
      <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />

      {/* Attachment picker */}
      {showAttach && (
        <div className="px-4 py-2.5 border-t border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up">
          <div className="flex items-center justify-around max-w-sm mx-auto">
            {attachOptions.map((opt, i) => (
              <button
                key={opt.label}
                onClick={opt.action}
                className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-accent transition-all active:scale-95 animate-fade-in-scale"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
              >
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <opt.icon className={cn("h-4.5 w-4.5", opt.color)} />
                </div>
                <span className="text-[9px] text-muted-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 py-2.5 border-t border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up">
          <div className="flex flex-wrap gap-0.5">
            {emojis.map((e, i) => (
              <button
                key={e}
                onClick={() => setInput((prev) => prev + e)}
                className="text-lg hover:scale-125 transition-transform active:scale-95 p-1 rounded-lg hover:bg-accent animate-fade-in-scale"
                style={{ animationDelay: `${i * 20}ms`, animationFillMode: "backwards" }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply / Edit preview bar */}
      {(replyTo || editingMsg) && (
        <div className="px-3 py-1.5 border-t border-primary/20 bg-primary/5 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary">{editingMsg ? "Editing message" : `Reply to ${replyTo?.senderId === "me" ? "yourself" : chat.user.name}`}</p>
            <p className="text-[10px] text-muted-foreground truncate">{editingMsg ? editingMsg.text : replyTo?.text}</p>
          </div>
          <button onClick={() => { setReplyTo(null); setEditingMsg(null); setInput(""); }} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Desktop style input bar */}
      <div className="bg-card border-t border-border/50 py-2 px-3 flex items-center gap-2 shrink-0 relative z-20">
        {isRecording ? (
          <div className="flex-1 flex items-center gap-3 px-4 py-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-bold text-destructive uppercase tracking-widest leading-none">Recording</span>
            </div>
            <div className="flex-1 h-1.5 bg-destructive/10 rounded-full overflow-hidden">
              <div className="h-full bg-destructive animate-shimmer" style={{ width: '100%' }} />
            </div>
            <button onClick={stopRecording} className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors">
              <X className="h-5.5 w-5.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  showEmoji ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"
                )}
                title="Emoji picker"
              >
                <Smile className="h-6 w-6" />
              </button>
              <button
                onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  showAttach ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"
                )}
                title="Attach file"
              >
                <Paperclip className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 relative mx-2">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Type a message"
                value={input}
                onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-secondary border-0 rounded-lg py-2.5 px-4 text-[15px] focus:ring-0 placeholder:text-muted-foreground/30 resize-none max-h-32 scrollbar-none leading-relaxed"
              />
            </div>

            <div className="shrink-0 flex items-center justify-center min-w-[48px]">
              {input.trim() ? (
                <button 
                  onClick={handleSend} 
                  className="p-2.5 text-primary hover:text-primary/80 transition-all active:scale-95"
                >
                  <Send className="h-6 w-6" />
                </button>
              ) : (
                <button 
                  onClick={startRecording} 
                  className="p-2.5 text-muted-foreground/60 hover:text-foreground transition-all active:scale-90" 
                  title="Record voice"
                >
                  <Mic className="h-6 w-6" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {forwardMsg && (
        <ForwardMessageDialog
          message={forwardMsg}
          onClose={() => setForwardMsg(null)}
          onForward={async (userId) => {
            try {
              const res = await api.post(`/chat/messages/${userId}`, { text: encryptMessage(forwardMsg.text), type: forwardMsg.type, imageUrl: forwardMsg.imageUrl, isForwarded: true });
              setForwardMsg(null);
              toast.success("Message forwarded");
              if (userId === chat.user.id) {
                const newMsg = res.data;
                const formattedMsg: Message = { ...newMsg, text: decryptMessage(newMsg.text), id: newMsg._id, timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), senderId: "me", status: "delivered", isForwarded: true };
                setMessages(prev => [...prev, formattedMsg]);
                socket.emit('send_message', { ...newMsg, isForwarded: true });
              }
            } catch { toast.error("Failed to forward"); }
          }}
        />
      )}
    </div>
  );
}
