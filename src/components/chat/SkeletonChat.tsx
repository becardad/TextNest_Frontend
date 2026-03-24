import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
}

export default function SkeletonChat() {
  return (
    <div className="flex flex-col h-full bg-card/50">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <Shimmer className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Shimmer className="h-3.5 w-28 rounded-md" />
          <Shimmer className="h-2.5 w-16 rounded-md" />
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-5 space-y-4">
        {[false, true, false, true, false].map((mine, i) => (
          <div key={i} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <Shimmer
              className={cn(
                "h-12 rounded-2xl",
                mine ? "w-[55%] rounded-br-md" : "w-[45%] rounded-bl-md"
              )}
            />
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="px-5 py-4 border-t border-border flex gap-2">
        <Shimmer className="h-10 flex-1 rounded-xl" />
        <Shimmer className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}
