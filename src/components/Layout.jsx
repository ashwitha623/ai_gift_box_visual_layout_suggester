import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Send, ChevronDown, Sparkles, Calendar, Package, Users, ShieldAlert, Briefcase, Archive, LayoutGrid, LogOut, Key, Bell, FileText, ClipboardList, Truck, Twitter, Instagram, Linkedin, Facebook, User, Mail, BookOpen, MessageSquare, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthAction, ProtectedAction } from "./AuthModalContext";
import logoImg from "@/assets/images/paper_plane_logo.png";

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { withAuth } = useAuthAction();
  const [adminOpen, setAdminOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalSubject, setModalSubject] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErrors, setModalErrors] = useState({});
  const { toast } = useToast();
  const toolsRef = useRef(null);
  const adminRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const triggerBrowserNotification = (n) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const title = "🎁 Paper Plane Reminder";
    const body = n.message || "Demo Notification Successfully Triggered";

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: title,
        body: body,
        icon: '/paper_plane_logo.png',
        badge: '/paper_plane_logo.png',
        data: { id: n.id }
      });
    } else {
      new Notification(title, {
        body: body,
        icon: '/paper_plane_logo.png',
        badge: '/paper_plane_logo.png'
      });
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications");
        const notifications = res.data;
        const unread = notifications.filter(n => n.status === "Unread");
        setUnreadCount(unread.length);

        const displayedStr = localStorage.getItem("displayed_notifications");
        const displayed = displayedStr ? JSON.parse(displayedStr) : [];
        let updatedDisplayed = [...displayed];
        let hasNew = false;

        for (const n of unread) {
          if (!displayed.includes(n.id)) {
            triggerBrowserNotification(n);
            updatedDisplayed.push(n.id);
            hasNew = true;
          }
        }

        if (hasNew) {
          localStorage.setItem("displayed_notifications", JSON.stringify(updatedDisplayed));
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    window.addEventListener("refresh-notifications", fetchNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-notifications", fetchNotifications);
    };
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setToolsOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!modalName.trim()) newErrors.name = "* Name is required.";
    if (!modalEmail.trim()) newErrors.email = "* Email address is required.";
    if (!modalSubject.trim()) newErrors.subject = "* Subject is required.";
    if (!modalMessage.trim()) newErrors.message = "* Message is required.";

    if (Object.keys(newErrors).length > 0) {
      setModalErrors(newErrors);
      return;
    }
    setModalErrors({});
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
      setModalErrors({});
      setModalLoading(false);
      setContactOpen(false);
    }, 1200);
  };

  const protectedRoutes = [
    "/crm",
    "/ai-assistant",
    "/design-approvals",
    "/orders",
    "/returns",
    "/notifications",
    "/layouts",
    "/reports"
  ];

  useEffect(() => {
    // Read session on page load
    const userStr = localStorage.getItem("currentUser");
    const user = userStr ? JSON.parse(userStr) : null;
    if (userStr) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }

    // Intercept direct page access by guest
    if (!user && protectedRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
      navigate("/create");
      setTimeout(() => {
        if (window.openAuthModal) {
          window.openAuthModal(pathname);
        }
      }, 100);
    }
  }, [pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("dataAccessUnlocked");
    setCurrentUser(null);
    window.location.href = "/";
  };

  const handleProtectedNavigate = (path) => {
    setToolsOpen(false);
    withAuth(() => {
      navigate(path);
    }, path);
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
            <img 
              src={logoImg} 
              alt="Paper Plane Logo" 
              className="w-9 h-9 rounded-xl shadow-lg border border-[#C5A880]/30 object-cover" 
            />
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



            {/* Gifting Tools Dropdown (Available to Customers/Corporate) */}
            <div ref={toolsRef} className="relative">
              <Button
                variant="ghost"
                onClick={() => { setToolsOpen(!toolsOpen); setAdminOpen(false); }}
                className="rounded-full text-xs font-semibold text-primary hover:text-accent flex items-center gap-1"
              >
                Gifting Tools <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              {toolsOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-2xl shadow-xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                  
                  {/* CRM Calendar - Protected */}
                  <button
                    onClick={() => handleProtectedNavigate("/crm")}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> CRM Calendar
                    </span>
                    {!currentUser && <Lock className="w-3.5 h-3.5 text-[#C5A880]" />}
                  </button>

                  {/* AI Assistant - Protected */}
                  <button
                    onClick={() => handleProtectedNavigate("/ai-assistant")}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> AI Assistant
                    </span>
                    {!currentUser && <Lock className="w-3.5 h-3.5 text-[#C5A880]" />}
                  </button>

                  {/* Design Approvals - Protected */}
                  <button
                    onClick={() => handleProtectedNavigate("/design-approvals")}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Design Approvals
                    </span>
                    {!currentUser && <Lock className="w-3.5 h-3.5 text-[#C5A880]" />}
                  </button>



                  {/* Track Orders - Protected */}
                  <button
                    onClick={() => handleProtectedNavigate("/orders")}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" /> Track Orders
                    </span>
                    {!currentUser && <Lock className="w-3.5 h-3.5 text-[#C5A880]" />}
                  </button>

                  {/* Return Requests - Protected */}
                  <button
                    onClick={() => handleProtectedNavigate("/returns")}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-primary" /> Return Requests
                    </span>
                    {!currentUser && <Lock className="w-3.5 h-3.5 text-[#C5A880]" />}
                  </button>



                  {/* Layout History - Protected */}
                  <button
                    onClick={() => handleProtectedNavigate("/layouts")}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-primary" /> Layout History
                    </span>
                    {!currentUser && <Lock className="w-3.5 h-3.5 text-[#C5A880]" />}
                  </button>

                </div>
              )}
            </div>

            {/* Admin Portals Dropdown (Strictly restricted to role === 'admin') */}
            {isAdmin && (
              <div ref={adminRef} className="relative">
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
                      <LayoutGrid className="w-4 h-4" /> Gifting & Stock Center
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
                      <ClipboardList className="w-4 h-4" /> Production Board
                    </Link>
                    <Link 
                      to="/crm/customer/2" 
                      onClick={() => setAdminOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 hover:text-accent"
                    >
                      <Users className="w-4 h-4" /> CRM Records
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



            {/* Auth Session State Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
                {/* Navbar Bell Icon Badge */}
                <Link to="/notifications" className="relative mr-1.5 flex items-center">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-primary hover:text-accent p-0">
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>

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

            <Link to="/create" onClick={() => {
              sessionStorage.removeItem("paperplane_builder_state");
              if (pathname === "/create") {
                window.location.reload();
              }
            }} className="hidden sm:block">
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
                <li><Link to="/create" onClick={() => sessionStorage.removeItem("paperplane_builder_state")} className="hover:text-white transition-colors">Gift Builder</Link></li>
                <li>
                  <ProtectedAction action={() => navigate("/layouts")} redirectTarget="/layouts" className="hover:text-white transition-colors">
                    Layout History
                  </ProtectedAction>
                </li>
                <li>
                  <ProtectedAction action={() => navigate("/design-approvals")} redirectTarget="/design-approvals" className="hover:text-white transition-colors">
                    Design Approvals
                  </ProtectedAction>
                </li>
              </ul>
            </div>
            {/* COLUMN 3 */}
            <div>
              <h4 className="text-[10px] font-extrabold tracking-widest text-[#C5A880] uppercase mb-5">Business</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li>
                  <ProtectedAction action={() => navigate("/orders")} redirectTarget="/orders" className="hover:text-white transition-colors">
                    Order Tracking
                  </ProtectedAction>
                </li>
                <li>
                  <ProtectedAction action={() => navigate("/crm/customer/2")} redirectTarget="/crm/customer/2" className="hover:text-white transition-colors">
                    CRM Records
                  </ProtectedAction>
                </li>
              </ul>
            </div>
            {/* COLUMN 4 */}
            <div>
              <h4 className="text-[10px] font-extrabold tracking-widest text-[#C5A880] uppercase mb-5">Support</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li>
                  <button 
                    onClick={() => {
                      setContactOpen(true);
                      setModalErrors({});
                    }} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                <li>
                  <ProtectedAction action={() => navigate("/notifications")} redirectTarget="/notifications" className="hover:text-white transition-colors">
                    Notifications
                  </ProtectedAction>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-xs text-slate-500 gap-4">
            {/* Logo */}
             <Link to="/" className="flex items-center gap-2.5">
              <img 
                src={logoImg} 
                alt="Paper Plane Logo" 
                className="w-8 h-8 rounded-lg border border-[#C5A880]/30 shadow-md object-cover" 
              />
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
              onClick={() => {
                setContactOpen(false);
                setModalErrors({});
              }}
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
                onClick={() => {
                  setContactOpen(false);
                  setModalErrors({});
                }}
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
                          onChange={(e) => {
                            setModalName(e.target.value);
                            setModalErrors(prev => ({ ...prev, name: "" }));
                          }}
                          className="pl-9 rounded-xl h-10 bg-background text-xs"
                        />
                      </div>
                      {modalErrors.name && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{modalErrors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="font-semibold text-[10px] text-primary uppercase tracking-wider">Email address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={modalEmail}
                          onChange={(e) => {
                            setModalEmail(e.target.value);
                            setModalErrors(prev => ({ ...prev, email: "" }));
                          }}
                          className="pl-9 rounded-xl h-10 bg-background text-xs"
                        />
                      </div>
                      {modalErrors.email && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{modalErrors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-semibold text-[10px] text-primary uppercase tracking-wider">Subject *</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Subject"
                        value={modalSubject}
                        onChange={(e) => {
                          setModalSubject(e.target.value);
                          setModalErrors(prev => ({ ...prev, subject: "" }));
                        }}
                        className="pl-9 rounded-xl h-10 bg-background text-xs"
                      />
                    </div>
                    {modalErrors.subject && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{modalErrors.subject}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label className="font-semibold text-[10px] text-primary uppercase tracking-wider">Message *</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Message"
                        value={modalMessage}
                        onChange={(e) => {
                          setModalMessage(e.target.value);
                          setModalErrors(prev => ({ ...prev, message: "" }));
                        }}
                        className="pl-9 rounded-xl min-h-[100px] bg-background pt-2 text-xs"
                      />
                    </div>
                    {modalErrors.message && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{modalErrors.message}</p>}
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