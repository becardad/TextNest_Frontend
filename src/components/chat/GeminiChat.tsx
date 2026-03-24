import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    console.log("Gemini SDK Initialized");
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
      if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
        throw new Error("Missing API Key. Check your .env file!");
      }

      // Re-initialize genAI inside to ensure latest .env state
      const activeGenAI = new GoogleGenerativeAI(GEMINI_API_KEY);

      // Model Fallback Logic: Try flash, then pro, then legacy
      const modelsToTry = [
        { id: "gemini-1.5-flash", systemSupport: true },
        { id: "gemini-1.5-pro", systemSupport: true },
        { id: "gemini-pro", systemSupport: false }
      ];

      let lastError: any = null;
      let success = false;
      let reply = "";

      for (const modelConfig of modelsToTry) {
        try {
          console.log(`Gemini Attempt: Trying ${modelConfig.id}...`);
          
          // Construct model options
          const modelOptions: any = { model: modelConfig.id };
          if (modelConfig.systemSupport) {
            modelOptions.systemInstruction = SYSTEM_PROMPT;
          }

          const model = activeGenAI.getGenerativeModel(modelOptions);

          const chatHistory = messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          }));

          const chat = model.startChat({ history: chatHistory });

          // If legacy model and first message, prepend system instruction to the prompt
          let messageToSend = trimmed;
          if (!modelConfig.systemSupport && chatHistory.length === 0) {
            messageToSend = `Instruction: ${SYSTEM_PROMPT}\n\nUser: ${trimmed}`;
          }

          const result = await chat.sendMessage(messageToSend);
          // Note: If we prepended, we already sent the first message.
          // But startChat + sendMessage is cleaner.
          
          const response = await result.response;
          reply = response.text();
          success = true;
          console.log(`Gemini Success: Responded using ${modelConfig.id}`);
          break; 
        } catch (err: any) {
          console.warn(`Gemini Warning: ${modelConfig.id} failed:`, err.message);
          lastError = err;
          // Continue if 404/NotFound or if the model just didn't support the config
          const isNotFoundError = err.message?.toLowerCase().includes("404") || err.message?.toLowerCase().includes("not found");
          const isModelError = err.message?.toLowerCase().includes("model");
          
          if (!isNotFoundError && !isModelError) {
            break; // Stop on 401/403/429
          }
        }
      }

      if (!success) throw lastError;

      const modelMsg: GeminiMessage = {
        id: `m-${Date.now()}`,
        role: "model",
        text: reply || "Sorry, I couldn't generate a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error("Gemini SDK Fatal Error:", err);
      const errorText = err.message || "";
      const isRateLimit = errorText.includes("429");
      const isForbidden = errorText.includes("403");
      const isConfigError = errorText.includes("404") || errorText.includes("not found");
      
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: isRateLimit 
            ? "⚠️ Rate limit exceeded (Error 429). Please wait 1 minute!"
            : isForbidden
            ? `⚠️ Access Forbidden (Error 403).\n\n1. Check if your API key is correct in .env.\n2. Ensure the 'Generative Language API' is enabled in your Google Cloud Console.\n3. Make sure you are in a supported region.`
            : isConfigError
            ? `⚠️ Model Not Found (Error 404).\n\nAttempted models: gemini-1.5-flash, gemini-1.5-pro, gemini-pro.\nPlease check your AI Studio project permissions.`
            : `⚠️ Connection failed: ${errorText}`,
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
      <div className="flex items-center gap-3 px-4 py-3 glass border-b border-border/50 shrink-0">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] flex items-center justify-center shadow-lg">
            <GeminiIcon className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">Gemini AI</h2>
          <p className="text-[10px] text-green-500 font-medium">Always available · Powered by Google</p>
        </div>
        <button
          onClick={() => setMessages([])}
          title="Clear conversation"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] flex items-center justify-center shadow-xl">
              <GeminiIcon className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-foreground mb-1">Chat with Gemini</h3>
              <p className="text-xs text-muted-foreground max-w-[220px]">Ask questions, get creative ideas, have fun conversations — all powered by Google Gemini AI.</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] flex items-center justify-center shrink-0 mt-1 shadow-md">
                <GeminiIcon className="w-3.5 h-3.5 text-white" />
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
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] flex items-center justify-center shrink-0 mt-1">
              <GeminiIcon className="w-3.5 h-3.5 text-white" />
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
          placeholder="Ask Gemini anything..."
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
