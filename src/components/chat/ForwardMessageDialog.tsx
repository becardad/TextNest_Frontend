import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import UserAvatar from "./UserAvatar";
import api from "@/lib/api";

interface ForwardMessageDialogProps {
  message: any;
  onClose: () => void;
  onForward: (userId: string) => void;
}

export default function ForwardMessageDialog({ message, onClose, onForward }: ForwardMessageDialogProps) {
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([api.get('/chat/users'), api.get('/chat/groups')]).then(([uRes, gRes]) => {
      const combined = [...uRes.data, ...gRes.data];
      setChats(combined.map(c => ({ id: c._id, name: c.name, profilePicture: c.profilePicture })));
    });
  }, []);

  const filtered = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-elevated border border-border flex flex-col max-h-[80vh] overflow-hidden animate-fade-in-scale">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="font-bold">Forward Message</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-secondary/80 rounded-xl pl-9 pr-4 py-2 text-sm border-none focus:ring-1 focus:ring-primary/30 outline-none transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No contacts found</p>
          ) : (
            filtered.map(c => (
              <button key={c.id} onClick={() => onForward(c.id)} className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-xl transition-colors text-left group">
                <UserAvatar name={c.name} profilePicture={c.profilePicture} />
                <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{c.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
