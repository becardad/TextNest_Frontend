import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Zap, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import TextNestLogo from "@/components/TextNestLogo";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Force dark mode on login page
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.add("dark");
    return () => {
      if (!wasDark) document.documentElement.classList.remove("dark");
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      toast.success("Welcome back!");
      navigate("/chat");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed check credentials");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, title: "Instant delivery", desc: "Messages arrive before you blink" },
    { icon: Shield, title: "Private by default", desc: "End-to-end encryption, always" },
    { icon: Users, title: "Built for teams", desc: "Groups, threads, and channels" },
  ];

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden p-4 md:p-8">
      {/* Background decoration */}
      <div
        className="absolute inset-0 animate-gradient-shift opacity-[0.15]"
        style={{
          background: "linear-gradient(135deg, hsl(20, 22%, 14%), hsl(16, 55%, 28%), hsl(24, 45%, 22%), hsl(350, 35%, 22%))",
          backgroundSize: "300% 300%",
        }}
      />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(16,65%,52%,0.08)] blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(35,60%,55%,0.06)] blur-[100px]" />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="flex flex-col items-center gap-1 mb-8 animate-fade-in text-center pt-12">
          <div className="animate-float">
            <TextNestLogo className="-mb-4 scale-110" />
          </div>
          <div className="space-y-2 mt-4">
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Welcome Back</h1>
            <p className="text-muted-foreground/60 text-sm font-medium">Enter your credentials to access the nest</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2.5 animate-fade-in" style={{ animationDelay: "150ms", animationFillMode: "backwards" }}>
            <label className="text-[11px] font-bold text-foreground/40 uppercase tracking-[0.25em] ml-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="name@example.com"
              className={cn(
                "w-full h-14 px-6 rounded-[22px] bg-secondary/20 backdrop-blur-xl text-foreground text-sm border outline-none transition-all duration-500 placeholder:text-muted-foreground/30",
                focused === "email"
                  ? "border-primary/50 shadow-[0_0_25px_rgba(var(--primary),0.15)] bg-secondary/40"
                  : "border-border/30 hover:border-border/60 hover:bg-secondary/30"
              )}
            />
          </div>

          <div className="space-y-2.5 animate-fade-in" style={{ animationDelay: "250ms", animationFillMode: "backwards" }}>
            <div className="flex items-center justify-between ml-2">
              <label className="text-[11px] font-bold text-foreground/40 uppercase tracking-[0.25em]">Password</label>
              <button type="button" className="text-[11px] text-primary hover:text-primary-foreground font-black uppercase tracking-wider transition-colors">
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                className={cn(
                  "w-full h-14 px-6 pr-14 rounded-[22px] bg-secondary/20 backdrop-blur-xl text-foreground text-sm border outline-none transition-all duration-500 placeholder:text-muted-foreground/30",
                  focused === "password"
                    ? "border-primary/50 shadow-[0_0_25px_rgba(var(--primary),0.15)] bg-secondary/40"
                    : "border-border/30 hover:border-border/60 hover:bg-secondary/30"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1.5"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-14 rounded-[22px] font-black text-sm text-primary-foreground gradient-primary mt-6 flex items-center justify-center gap-3",
              "shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.03] hover:-translate-y-0.5",
              "active:scale-[0.97] active:translate-y-0.5",
              "transition-all duration-500 animate-fade-in disabled:opacity-70 disabled:hover:scale-100",
            )}
            style={{ animationDelay: "350ms", animationFillMode: "backwards" }}
          >
            {loading ? (
              <div className="h-6 w-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Sign In to TextNest
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
          New to the nest?{" "}
          <Link to="/signup" className="text-primary font-black hover:text-primary-foreground transition-all inline-flex items-center gap-1.5 group">
            Create account
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </p>

      </div>
    </div>
  );
}
