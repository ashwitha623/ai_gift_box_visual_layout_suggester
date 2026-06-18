import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Send, ChevronDown, Sparkles, Calendar, Package, Users, ShieldAlert, Briefcase, Archive, LayoutGrid, LogOut, Key, Bell, FileText, ClipboardList, Truck, Twitter, Instagram, Linkedin, Facebook, User, Mail, BookOpen, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout() {
  const { pathname } = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalSubject, setModalSubject] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const { toast } = useToast();

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!modalName.trim() || !modalEmail.trim() || !modalSubject.trim() || !modalMessage.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    setModalLoading(true);
    setTimeout(() => {
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for reaching out. We will contact you soon.",
      });
      setModalName("");
      setModalEmail("");
      setModalSubject("");
      setModalMessage("");
      setModalLoading(false);
      setContactOpen(false);
    }, 1200);
  };

  useEffect(() => {
    // Read session on page load
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, [pathname]); // Refresh on navigation

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("dataAccessUnlocked");
    setCurrentUser(null);
    window.location.href = "/";
  };

  const isAdmin = currentUser?.role === "admin";
  const isCorporate = currentUser?.role === "corporate";

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      {/* Premium Luxury Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 border border-[#C5A880]/30">
              <Send className="w-4 h-4 text-accent" />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-primary">
              Paper Plane
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/">
              <Button
                variant="ghost"
                className={`rounded-full text-xs font-semibold ${
                  pathname === "/" ? "text-accent bg-secondary/30" : "text-primary hover:text-accent"
                }`}
              >
                Home
              </Button>
            </Link>

            <Link to="/create">
              <Button
                variant="ghost"
                className={`rounded-full text-xs font-semibold ${
                  pathname === "/create" ? "text-accent bg-secondary/30" : "text-primary hover:text-accent"
                }`}
              >
                Gift Builder
              </Button>
            </Link>

            {/* Gifting Tools Dropdown (Available to Customers/Corporate) */}
            {currentUser && (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => { setToolsOpen(!toolsOpen); setAdminOpen(false); }}
                  className="rounded-full text-xs font-semibold text-primary hover:text-accent flex items-center gap-1"
                >
                  Gifting Tools <ChevronDown className="w-3.5 h-3.5" />
                </Button>
                {toolsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <Link 
                      to="/crm" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Calendar className="w-4 h-4" /> CRM Calendar
                    </Link>
                    <Link 
                      to="/ai-assistant" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Sparkles className="w-4 h-4" /> AI Assistant
                    </Link>
                    <Link 
                      to="/design-approvals" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <FileText className="w-4 h-4" /> Design Approvals
                    </Link>
                    <Link 
                      to="/fulfillment" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Truck className="w-4 h-4" /> Order Flow Steps
                    </Link>
                    <Link 
                      to="/orders" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Package className="w-4 h-4" /> Track Orders
                    </Link>
                    <Link 
                      to="/returns" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <ShieldAlert className="w-4 h-4" /> Return Request
                    </Link>
                    <Link 
                      to="/notifications" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Bell className="w-4 h-4" /> Notifications
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Admin Portals Dropdown (Strictly restricted to role === 'admin') */}
            {isAdmin && (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => { setAdminOpen(!adminOpen); setToolsOpen(false); }}
                  className="rounded-full text-xs font-semibold text-primary hover:text-accent flex items-center gap-1 bg-accent/10 text-accent border border-accent/20"
                >
                  Admin Portals <ChevronDown className="w-3.5 h-3.5" />
                </Button>
                {adminOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <Link 
                      to="/dashboard" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <LayoutGrid className="w-4 h-4" /> Orders Center
                    </Link>
                    <Link 
                      to="/inventory" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Package className="w-4 h-4" /> Stock Inventory
                    </Link>
                    <Link 
                      to="/design-approvals" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <FileText className="w-4 h-4" /> Design Approvals
                    </Link>
                    <Link 
                      to="/production" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <ClipboardList className="w-4 h-4" /> Kanban Board
                    </Link>
                    <Link 
                      to="/crm/customer/2" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Users className="w-4 h-4" /> CRM Records
                    </Link>
                    <Link 
                      to="/corporate" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Briefcase className="w-4 h-4" /> Corporate Enquiries
                    </Link>
                    <Link 
                      to="/packaging" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Archive className="w-4 h-4" /> Packaging Styles
                    </Link>
                    <Link 
                      to="/reports" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <FileText className="w-4 h-4" /> Reports & Exports
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Corporate Enquiries shortcut if logged in as Corporate client */}
            {isCorporate && (
              <Link to="/corporate">
                <Button variant="ghost" className="rounded-full text-xs font-semibold text-primary hover:text-accent">
                  Corporate Enquiries 💼
                </Button>
              </Link>
            )}

            {/* Auth Session State Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
                <span className="text-xs font-bold text-primary bg-secondary px-3 py-1.5 rounded-full border border-border">
                  👤 {currentUser.username}
                </span>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full h-8 w-8 text-rose-600 hover:bg-rose-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="rounded-full text-xs font-semibold border hover:bg-slate-50 flex items-center gap-1.5 px-4">
                  <Key className="w-3.5 h-3.5" /> Sign In
                </Button>
              </Link>
            )}

            <Link to="/create" className="hidden sm:block">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-accent font-semibold text-xs shadow-md border border-[#C5A880]/30 px-5">
                Build A Box
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="min-h-[calc(100vh-140px)]">
        <Outlet />
      </main>

      {/* Premium Dark Footer */}
      <footer className="bg-[#09152b] text-slate-300 border-t border-slate-900 pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
            {/* COLUMN 1 */}
            <div>
              <h4 className="text-[10px] font-extrabold tracking-widest text-[#C5A880] uppercase mb-5">Company</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li>
                  <Link 
                    to="/" 
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    onClick={() => {
                      const el = document.getElementById("contact-form-container");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            {/* COLUMN 2 */}
            <div>
              <h4 className="text-[10px] font-extrabold tracking-widest text-[#C5A880] uppercase mb-5">Product</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><Link to="/create" className="hover:text-white transition-colors">Gift Builder</Link></li>
                <li><Link to="/layouts" className="hover:text-white transition-colors">Layout History</Link></li>
                <li><Link to="/design-approvals" className="hover:text-white transition-colors">Design Approvals</Link></li>
              </ul>
            </div>
            {/* COLUMN 3 */}
            <div>
              <h4 className="text-[10px] font-extrabold tracking-widest text-[#C5A880] uppercase mb-5">Business</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><Link to="/corporate" className="hover:text-white transition-colors">Corporate Enquiries</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
                <li><Link to="/crm/customer/2" className="hover:text-white transition-colors">CRM Records</Link></li>
              </ul>
            </div>
            {/* COLUMN 4 */}
            <div>
              <h4 className="text-[10px] font-extrabold tracking-widest text-[#C5A880] uppercase mb-5">Support</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li>
                  <button 
                    onClick={() => setContactOpen(true)} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/notifications" className="hover:text-white transition-colors">Notifications</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-xs text-slate-500 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center border border-[#C5A880]/30 shadow-md">
                <Send className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="font-heading font-extrabold text-sm tracking-tight text-white">
                Paper Plane
              </span>
            </Link>
            
            {/* Copyright */}
            <div className="text-slate-400/80">
              © 2026 Paper Plane. All Rights Reserved.
            </div>
            
            {/* Location/Language and Socials */}
            <div className="flex items-center gap-6">
              <div className="text-slate-400/60 font-medium">
                IN India | English
              </div>
              <div className="flex items-center gap-3.5 text-slate-400/80">
                <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {contactOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContactOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-card border border-border rounded-[24px] p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setContactOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-extrabold font-heading text-primary tracking-tight">Contact Support</h2>
                  <p className="text-muted-foreground text-xs mt-2">
                    Fill out the form below, you will be contacted soon
                  </p>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-semibold text-[10px] text-primary uppercase tracking-wider">Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Name"
                          value={modalName}
                          onChange={(e) => setModalName(e.target.value)}
                          className="pl-9 rounded-xl h-10 bg-background text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-semibold text-[10px] text-primary uppercase tracking-wider">Email address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={modalEmail}
                          onChange={(e) => setModalEmail(e.target.value)}
                          className="pl-9 rounded-xl h-10 bg-background text-xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-semibold text-[10px] text-primary uppercase tracking-wider">Subject *</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Subject"
                        value={modalSubject}
                        onChange={(e) => setModalSubject(e.target.value)}
                        className="pl-9 rounded-xl h-10 bg-background text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-semibold text-[10px] text-primary uppercase tracking-wider">Message *</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Message"
                        value={modalMessage}
                        onChange={(e) => setModalMessage(e.target.value)}
                        className="pl-9 rounded-xl min-h-[100px] bg-background pt-2 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold h-10 mt-2 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 text-xs"
                    disabled={modalLoading}
                  >
                    {modalLoading ? "Sending..." : "Send Message"}
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}