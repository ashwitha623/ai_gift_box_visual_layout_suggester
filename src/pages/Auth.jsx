import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus, Lock, Key, Mail, Sparkles, Send, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password || (!isLogin && !email)) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login Flow
        const res = await axios.post("http://localhost:5000/api/login", { username, password });
        if (res.data.success) {
          localStorage.setItem("currentUser", JSON.stringify(res.data.user));
          toast({ title: "Welcome back!", description: `Logged in successfully as ${res.data.user.username}.` });
          // Redirect
          window.location.href = res.data.user.role === "admin" ? "/dashboard" : "/";
        }
      } else {
        // Signup Flow
        const res = await axios.post("http://localhost:5000/api/signup", { username, email, password, role });
        if (res.data.success) {
          toast({ title: "Account Created", description: "You can now log in with your credentials." });
          setIsLogin(true);
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Invalid username or password. Please enter the correct password.";
      setError(errMsg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
        {/* Header logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 border border-[#C5A880]/30 mx-auto mb-4">
            <Send className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-primary tracking-tight">
            {isLogin ? "Welcome to Paper Plane" : "Create Gifting Account"}
          </h2>
          <p className="text-muted-foreground text-xs mt-2">
            {isLogin ? "Access your dashboard, calendar, and AI layouts" : "Register corporate campaigns or standard accounts"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="font-semibold text-xs text-primary">Username</Label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="e.g. admin, priyah123" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="pl-10 rounded-xl h-11"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <Label className="font-semibold text-xs text-primary">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email"
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-10 rounded-xl h-11"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label className="font-semibold text-xs text-primary">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="pl-10 pr-10 rounded-xl h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-primary transition-all"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <Label className="font-semibold text-xs text-primary">Account Type</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="rounded-xl h-11 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Individual Customer 🎁</SelectItem>
                  <SelectItem value="corporate">Corporate Client 💼</SelectItem>
                  <SelectItem value="vendor">Material Vendor 🤝</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-600 font-semibold mt-2">
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold h-11 mt-4 shadow-lg shadow-primary/10" disabled={loading}>
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center border-t border-border pt-4 text-xs text-muted-foreground">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setIsLogin(false)} className="text-[#C5A880] font-bold hover:underline">
                Create account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button onClick={() => setIsLogin(true)} className="text-[#C5A880] font-bold hover:underline">
                Sign in instead
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
