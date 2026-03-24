import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MessageCircle, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import TextNestLogo from "@/components/TextNestLogo";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Force dark mode on signup page
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.add("dark");
    return () => {
      if (!wasDark) document.documentElement.classList.remove("dark");
    };
  }, []);

  const passwordChecks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^\+?\d{7,15}$/.test(phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/signup", { name, email, password, phone });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden p-4 md:p-8">
      {/* Background decoration */}
      <div
        className="absolute inset-0 animate-gradient-shift opacity-[0.15]"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.15) 0%, transparent 50%)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(16,65%,52%,0.08)] blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(35,60%,55%,0.06)] blur-[100px]" />

      <div className="w-full max-w-[400px] relative z-10 pt-16">
        <div className="flex flex-col items-center gap-1 mb-10 animate-fade-in text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Create Account</h1>
            <p className="text-muted-foreground/60 text-sm font-medium">Join the TextNest community today</p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1 animate-fade-in" style={{ animationDelay: "150ms", animationFillMode: "backwards" }}>
            <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.25em] ml-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              placeholder="John Doe"
              className={cn(
                "w-full h-12 px-6 rounded-[22px] bg-secondary/20 backdrop-blur-xl text-foreground text-sm border outline-none transition-all duration-500 placeholder:text-muted-foreground/30",
                focused === "name" ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)] bg-secondary/40" : "border-border/30 hover:border-border/60"
              )}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.25em] ml-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="name@example.com"
                className={cn(
                  "w-full h-12 px-6 rounded-[22px] bg-secondary/20 backdrop-blur-xl text-foreground text-sm border outline-none transition-all duration-500 placeholder:text-muted-foreground/30",
                  focused === "email" ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)] bg-secondary/40" : "border-border/30 hover:border-border/60"
                )}
              />
            </div>

            <div className="flex-1 space-y-1 animate-fade-in" style={{ animationDelay: "250ms", animationFillMode: "backwards" }}>
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.25em] ml-2">Mobile</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
                placeholder="+1 234..."
                className={cn(
                  "w-full h-12 px-6 rounded-[22px] bg-secondary/20 backdrop-blur-xl text-foreground text-sm border outline-none transition-all duration-500 placeholder:text-muted-foreground/30",
                  focused === "phone" ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)] bg-secondary/40" : "border-border/30 hover:border-border/60"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.25em] ml-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-12 px-6 pr-12 rounded-[22px] bg-secondary/20 backdrop-blur-xl text-foreground text-sm border outline-none transition-all duration-500 placeholder:text-muted-foreground/30",
                    focused === "password" ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)] bg-secondary/40" : "border-border/30 hover:border-border/60"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1 animate-fade-in" style={{ animationDelay: "350ms", animationFillMode: "backwards" }}>
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.25em] ml-2">Confirm</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocused("confirmPassword")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-12 px-6 pr-12 rounded-[22px] bg-secondary/20 backdrop-blur-xl text-foreground text-sm border outline-none transition-all duration-500 placeholder:text-muted-foreground/30",
                    focused === "confirmPassword" ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)] bg-secondary/40" : "border-border/30 hover:border-border/60"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {password && (
            <div className="px-2 py-1 space-y-3 animate-fade-in-fast">
              <div className="flex gap-2.5 h-1.5">
                {passwordChecks.map((check, i) => (
                  <div key={i} className={cn("flex-1 rounded-full transition-all duration-700 shadow-sm", check.met ? "gradient-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-muted/30")} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2.5 group/check">
                    <div className={cn("rounded-full p-0.5 transition-all duration-300", check.met ? "bg-primary/20 scale-110" : "bg-muted/10")}>
                      <Check className={cn("h-3.5 w-3.5 transition-colors", check.met ? "text-primary" : "text-muted-foreground/20")} />
                    </div>
                    <span className={cn("text-[11px] font-black transition-colors tracking-tight", check.met ? "text-foreground" : "text-muted-foreground/40")}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-14 rounded-[22px] font-black text-sm text-primary-foreground gradient-primary mt-4 flex items-center justify-center gap-3",
              "shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.03] hover:-translate-y-0.5",
              "active:scale-[0.97] active:translate-y-0.5",
              "transition-all duration-500 animate-fade-in disabled:opacity-70 disabled:hover:scale-100",
            )}
            style={{ animationDelay: "450ms", animationFillMode: "backwards" }}
          >
            {loading ? (
              <div className="h-6 w-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-10 animate-fade-in" style={{ animationDelay: "550ms", animationFillMode: "backwards" }}>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-black hover:text-primary-foreground transition-all inline-flex items-center gap-1.5 group">
            Sign in
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </p>
      </div>
    </div>
  );
}
