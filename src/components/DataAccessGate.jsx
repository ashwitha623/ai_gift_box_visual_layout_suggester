import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const LOCK_PASSWORD = "PAPERPLANE_DATA_LOCK_2026";

export default function DataAccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if session has already been verified
    const isUnlocked = sessionStorage.getItem("dataAccessUnlocked") === "true";
    setUnlocked(isUnlocked);
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    if (password === LOCK_PASSWORD) {
      sessionStorage.setItem("dataAccessUnlocked", "true");
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password. Please enter the correct password.");
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-card border border-border rounded-[32px] p-8 shadow-xl shadow-primary/5 relative overflow-hidden"
      >
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Logo / Lock Emblem */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center border border-[#C5A880]/30 shadow-lg shadow-primary/10">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center border border-white animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold font-heading text-primary tracking-tight">Verify Data Access</h2>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              This module contains sensitive business records. Please enter the Data Access Lock Password to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="w-full space-y-4 pt-2">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="lock-password" className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Access Password
              </Label>
              <div className="relative">
                <Input
                  id="lock-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-11 pr-10 border border-border focus:border-accent text-xs font-medium bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2 text-[11px] text-rose-600 font-semibold"
                >
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <Button
              type="submit"
              className="w-full rounded-xl h-11 bg-primary hover:bg-primary/95 text-accent font-bold text-xs tracking-wider uppercase border border-[#C5A880]/30 shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5"
            >
              Unlock Module <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
