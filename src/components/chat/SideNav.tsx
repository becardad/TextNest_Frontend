import { MessageSquare, Phone, Settings, Circle, Star, Archive, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/hooks/useAuth";

// Gemini AI sparkle icon (renders as a nav-compatible component)
function GeminiNavIcon({ className, strokeWidth: _sw, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#EA4335" />
          <stop offset="100%" stopColor="#FBBC05" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 9.5 8.5 2 12C9.5 15.5 12 22 12 22C12 22 14.5 15.5 22 12C14.5 8.5 12 2 12 2Z"
        fill="url(#gemGrad)"
      />
    </svg>
  );
}


export type NavTab = "chats" | "calls" | "status" | "gemini" | "starred" | "archived" | "settings" | "profile";

interface SideNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: number;
}

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  badge?: number | string;
  onClick?: () => void;
  className?: string;
}

function NavItem({ icon: Icon, label, active, badge, onClick, className }: NavItemProps) {
  return (
    <div className="relative w-full flex items-center justify-center py-1">
      <div 
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-primary rounded-r-full z-10 transition-all duration-300",
          active ? "h-6 opacity-100" : "h-0 opacity-0"
        )} 
      />
      <button
        onClick={onClick}
        className={cn(
          "relative group flex items-center justify-center p-2.5 rounded-lg transition-all duration-300",
          active 
            ? "text-primary bg-black/5 dark:bg-white/5" 
            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground",
          className
        )}
        title={label}
      >
        <Icon className={cn("h-6 w-6")} strokeWidth={1.5} />
        
        {badge ? (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-primary-foreground bg-primary rounded-full border border-background shadow-sm">
            {badge}
          </span>
        ) : null}
        
        <div className="absolute left-[calc(100%+16px)] px-2 py-1 rounded bg-[#233138] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none shadow-lg z-50">
          {label}
        </div>
      </button>
    </div>
  );
}

export default function SideNav({ activeTab, onTabChange, unreadCount }: SideNavProps) {
  const { user } = useAuth();

  return (
    <div className="w-[64px] h-full flex flex-col items-center py-2 bg-background border-r border-border/20 shrink-0 select-none z-30 transition-colors duration-300">
      {/* Menu Icon at the very top */}
      <div className="w-full flex items-center justify-center mb-2">
        <button className="p-3 text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Top Group */}
      <div className="flex flex-col w-full">
        <NavItem 
          icon={MessageSquare} 
          label="Chats" 
          active={activeTab === "chats"} 
          onClick={() => onTabChange("chats")}
          badge={unreadCount && unreadCount > 0 ? unreadCount : undefined} 
        />
        <NavItem 
          icon={Phone} 
          label="Calls" 
          active={activeTab === "calls"} 
          onClick={() => onTabChange("calls")}
        />
        <NavItem 
          icon={Circle} 
          label="Status" 
          active={activeTab === "status"} 
          onClick={() => onTabChange("status")}
        />
        <NavItem
          icon={GeminiNavIcon}
          label="Ask Gemini AI"
          active={activeTab === "gemini"}
          onClick={() => onTabChange("gemini")}
        />
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Bottom Group */}
      <div className="flex flex-col w-full mt-auto">
        <NavItem 
          icon={Star} 
          label="Starred" 
          active={activeTab === "starred"} 
          onClick={() => onTabChange("starred")}
        />
        <NavItem 
          icon={Archive} 
          label="Archived" 
          active={activeTab === "archived"} 
          onClick={() => onTabChange("archived")}
        />

        <div className="w-8 h-[1px] bg-border/10 my-2 shrink-0 mx-auto" />

        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={activeTab === "settings"} 
          onClick={() => onTabChange("settings")}
        />
        
        <div className="w-full flex items-center justify-center py-2">
          <button 
            onClick={() => onTabChange("profile")}
            className={cn(
              "relative group p-0.5 rounded-full ring-2 transition-all active:scale-95",
              activeTab === "profile" ? "ring-primary" : "ring-transparent hover:ring-primary/40"
            )}
          >
            <UserAvatar 
               name={user?.name || "User"} 
               profilePicture={user?.profilePicture} 
               size="sm"
            />
            <div className="absolute left-[calc(100%+16px)] px-2 py-1 rounded bg-[#233138] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none shadow-lg z-50">
              Profile
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
