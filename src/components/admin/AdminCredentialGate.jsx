import { useState } from "react";
import axios from "axios";
import { ShieldAlert, Key, Lock, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function AdminCredentialGate({ onAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ 
        title: "Validation Error", 
        description: "Please enter both administrator username and password.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login", { username, password });
      if (res.data.success) {
        const user = res.data.user;
        if (user.role === "admin") {
          localStorage.setItem("currentUser", JSON.stringify(user));
          toast({ 
            title: "Access Granted", 
            description: `Welcome to the Enterprise Admin Center, ${user.username}.` 
          });
          if (onAuthenticated) {
            onAuthenticated(user);
          } else {
            window.location.reload();
          }
        } else {
          toast({ 
            title: "Access Denied", 
            description: "The credentials provided do not have administrator permissions.", 
            variant: "destructive" 
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Authentication Failed", 
        description: err.response?.data?.message || "Invalid username or password.", 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-card border border-border rounded-[30px] p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header logo */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 border border-[#C5A880]/30 mx-auto mb-4 animate-pulse">
            <ShieldAlert className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-primary tracking-tight">
            Administrator Gateway
          </h2>
          <p className="text-muted-foreground text-xs mt-2 max-w-xs mx-auto">
            This workspace contains client details, inventory logs, and system metrics. Please authenticate to continue.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10 text-left">
          <div className="space-y-1">
            <Label className="font-semibold text-xs text-primary">Admin Username</Label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="e.g. admin" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="pl-10 rounded-xl h-11 bg-white border border-border/80 text-sm focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="font-semibold text-xs text-primary">Admin Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input 
                type="password"
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="pl-10 rounded-xl h-11 bg-white border border-border/80 text-sm focus:border-accent"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold h-11 mt-4 shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? "Authenticating Admin..." : "Authenticate Access"}
          </Button>
        </form>

        <div className="mt-6 text-center border-t border-border pt-4 text-[10px] text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C5A880]" />
            Secure Enterprise Encryption Node
          </p>
        </div>
      </div>
    </div>
  );
}
