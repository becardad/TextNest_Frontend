import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  online?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  profilePicture?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-xl",
};

const imgSizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

const dotSizeMap = {
  sm: "h-2.5 w-2.5 border-[1.5px]",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

const gradients = [
  "from-amber-600 to-orange-700",
  "from-sky-600 to-blue-700",
  "from-rose-500 to-red-600",
  "from-stone-500 to-stone-700",
  "from-teal-500 to-emerald-600",
  "from-slate-500 to-slate-700",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserAvatar({ name, online, size = "md", className, profilePicture }: UserAvatarProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={name}
          className={cn(
            "rounded-full object-cover shadow-md shadow-black/10",
            imgSizeMap[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white select-none",
            "shadow-md shadow-black/10",
            sizeMap[size],
            getGradient(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-card transition-all duration-300",
            dotSizeMap[size],
            online
              ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
              : "bg-muted-foreground/40"
          )}
        />
      )}
    </div>
  );
}
