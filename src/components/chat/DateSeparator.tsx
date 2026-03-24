interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-3 animate-fade-in">
      <span className="px-4 py-1 rounded-full text-[11px] font-medium text-muted-foreground bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm">
        {date}
      </span>
    </div>
  );
}
