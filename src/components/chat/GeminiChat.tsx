import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Trash2, Copy, Check, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import TextNestLogo from "../TextNestLogo";

interface GeminiMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

interface GeminiChatProps {
  onBack?: () => void;
}

const SYSTEM_PROMPT = `You are a friendly, helpful AI assistant embedded in TextNest — a modern chat app. 
You love casual conversation, answering questions, brainstorming ideas, telling jokes, and helping with everyday tasks.
Keep responses concise and conversational. Use emojis occasionally to be more friendly.`;

const SUGGESTIONS = [
  "Tell me a fun fact 🌍",
  "Write a short poem about friendship",
  "What's a good movie to watch tonight?",
  "Give me a productivity tip",
  "Tell me a joke 😄",
];

export default function GeminiChat() {
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState("gemini-1.5-flash");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg: GeminiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const api_url = import.meta.env.VITE_API_URL || "http://localhost:5001";
      
      // Determine provider based on modelId
      const provider = selectedModelId.startsWith('hf-') ? 'huggingface' : 'gemini';
      const cleanModelId = selectedModelId.replace('hf-', '');

      const response = await fetch(`${api_url}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMsg),
          provider,
          modelId: cleanModelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();

      const modelMsg: GeminiMessage = {
        id: `m-${Date.now()}`,
        role: "model",
        text: data.text || "Sorry, I couldn't generate a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: `⚠️ Error: ${err.message || "Connection failed"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex flex-col shrink-0 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-[#121212]/90 flex items-center justify-center shadow-lg border border-white/5">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground">TextNest AI</h2>
            <p className="text-[10px] text-green-500 font-medium">Online · Ready to help</p>
          </div>
          <button
            onClick={() => setMessages([])}
            title="Clear conversation"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-4 animate-fade-in -mt-12">
            <div className="w-20 h-20 rounded-3xl bg-[#121212]/90 flex items-center justify-center shadow-xl shadow-black/20 border border-white/5 transition-transform duration-500 hover:scale-105">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-2 mt-2">
              <h3 className="font-black text-2xl tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Chat with TextNest AI</h3>
              <p className="text-[13px] text-muted-foreground max-w-[280px] leading-relaxed">
                Your intelligent companion for creative ideas, 
                quick answers, and meaningful conversations.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-2.5 rounded-xl bg-accent/50 hover:bg-accent text-xs text-foreground/80 hover:text-foreground transition-all border border-border/30 hover:border-primary/30"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "model" && (
              <div className="w-8 h-8 rounded-lg bg-[#121212]/90 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-white/5">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn("group relative max-w-[80%] flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap break-words shadow-sm",
                  msg.role === "user"
                    ? "gradient-sent text-white rounded-br-[6px]"
                    : "bg-card border border-border/40 text-foreground rounded-bl-[6px]"
                )}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground/60">{msg.timestamp}</span>
                {msg.role === "model" && (
                  <button
                    onClick={() => copyText(msg.id, msg.text)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground transition-all"
                    title="Copy"
                  >
                    {copiedId === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-lg bg-[#121212]/90 flex items-center justify-center shrink-0 mt-1 border border-white/5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-[6px] bg-card border border-border/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border/50 py-2 px-3 flex items-center gap-2 shrink-0">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Ask TextNest AI anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          className="flex-1 bg-secondary border-0 rounded-lg py-2.5 px-4 text-[14px] focus:ring-0 placeholder:text-muted-foreground/40 resize-none max-h-32 scrollbar-none leading-relaxed"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="p-2.5 text-primary hover:text-primary/80 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Inline Gemini logo SVG (the spark/diamond shape)
function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 9.5 8.5 2 12C9.5 15.5 12 22 12 22C12 22 14.5 15.5 22 12C14.5 8.5 12 2 12 2Z" />
    </svg>
  );
}
