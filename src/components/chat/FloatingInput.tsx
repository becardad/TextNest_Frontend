import { cn } from "@/lib/utils";

interface FloatingInputProps {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  delay: number;
  focused: string | null;
  onFocus: (id: string) => void;
  onBlur: () => void;
  children?: React.ReactNode;
}

export default function FloatingInput({
  id,
  type = "text",
  value,
  onChange,
  label,
  delay,
  focused,
  onFocus,
  onBlur,
  children,
}: FloatingInputProps) {
  return (
    <div className="relative animate-fade-in" style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus(id)}
        onBlur={onBlur}
        className={cn(
          "w-full h-13 px-4 pt-5 pb-2 rounded-xl bg-secondary text-foreground text-sm border-2 outline-none transition-all duration-300",
          children && "pr-12",
          focused === id ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" : "border-transparent"
        )}
        placeholder=" "
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none text-muted-foreground",
          value || focused === id
            ? "top-2 text-[10px] font-medium text-primary"
            : "top-1/2 -translate-y-1/2 text-sm"
        )}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
