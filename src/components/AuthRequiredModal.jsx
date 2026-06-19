import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthRequiredModal({ isOpen, onClose, redirectTarget }) {
  const handleSignIn = () => {
    onClose();
    const redirectUrl = redirectTarget ? encodeURIComponent(redirectTarget) : "";
    window.location.href = `/auth?redirect=${redirectUrl}`;
  };

  const handleCreateAccount = () => {
    onClose();
    const redirectUrl = redirectTarget ? encodeURIComponent(redirectTarget) : "";
    window.location.href = `/auth?redirect=${redirectUrl}&signup=true`;
  };

  const benefits = [
    "Place Orders",
    "Track Orders",
    "Save AI Layouts",
    "Download Optimization Reports",
    "View Order History",
    "Access AI Assistant",
    "Receive Notifications",
    "Faster Checkout Experience"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dark glassmorphism overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09152b]/60 backdrop-blur-md"
          />

          {/* White Premium Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
            className="relative w-full max-w-md bg-white border border-slate-100 rounded-[28px] p-8 shadow-[0_20px_50px_rgba(9,21,43,0.15)] overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#C5A880]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#09152b]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col items-center">
              {/* Luxury Paper Plane Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#09152b] flex items-center justify-center shadow-lg shadow-slate-900/10 border border-[#C5A880]/30 mb-5">
                <Send className="w-6 h-6 text-[#C5A880]" />
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-extrabold font-heading text-[#09152b] tracking-tight text-center">
                Unlock Your Paper Plane Experience
              </h2>
              <p className="text-slate-500 text-xs text-center mt-2.5 max-w-sm leading-relaxed">
                Sign in to access advanced gifting tools and personalized services.
              </p>

              {/* Benefits Checklist */}
              <div className="w-full bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50 my-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((b) => (
                    <div key={b} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#C5A880]/15 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#C5A880] stroke-[3]" />
                      </div>
                      <span className="text-[11px] font-bold text-[#09152b]">
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="w-full space-y-3">
                <Button
                  onClick={handleSignIn}
                  className="w-full rounded-full bg-[#09152b] hover:bg-[#09152b]/90 text-white font-semibold h-11 shadow-md shadow-[#09152b]/10 border border-[#C5A880]/20 flex items-center justify-center gap-2 text-xs"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleCreateAccount}
                  variant="outline"
                  className="w-full rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold h-11 text-xs"
                >
                  Create Account
                </Button>
                <div className="text-center pt-2">
                  <button
                    onClick={onClose}
                    className="text-xs font-bold text-[#C5A880] hover:underline transition-all"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
