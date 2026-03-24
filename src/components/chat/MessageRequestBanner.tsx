import { ShieldAlert, Check, X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import type { User } from "@/data/mockData";

interface MessageRequestBannerProps {
  sender: User;
  onAccept: () => void;
  onBlock: () => void;
}

export default function MessageRequestBanner({ sender, onAccept, onBlock }: MessageRequestBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-8 mx-4 my-4 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md animate-fade-in text-center shadow-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <UserAvatar name={sender.name} size="lg" profilePicture={sender.profilePicture} />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-background">
            <ShieldAlert className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
        <div>
          <p className="font-bold text-[17px] text-foreground">{sender.name}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">wants to send you a message</p>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground/80 max-w-[260px] leading-relaxed">
        You haven't chatted with this person before. Do you want to accept or block this message request?
      </p>

      <div className="flex gap-3 w-full max-w-[280px]">
        <button
          onClick={onBlock}
          className="flex-1 h-11 rounded-xl border border-destructive/40 text-destructive font-bold text-sm hover:bg-destructive/10 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Block
        </button>
        <button
          onClick={onAccept}
          className="flex-1 h-11 rounded-xl gradient-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Accept
        </button>
      </div>
    </div>
  );
}
