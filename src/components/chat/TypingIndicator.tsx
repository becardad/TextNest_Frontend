interface TypingIndicatorProps {
  name?: string;
}

export default function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 px-4 py-2 animate-fade-in">
      <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 shadow-elevated">
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-typing-dot-1" />
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-typing-dot-2" />
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-typing-dot-3" />
      </div>
      {name && (
        <span className="text-[10px] text-muted-foreground pb-1">{name.split(" ")[0]}</span>
      )}
    </div>
  );
}
