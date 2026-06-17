import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckSquare, Sparkles, Mail, MessageSquare, PhoneCall, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'
  
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load notifications.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      if (res.data.success) {
        toast({ title: "Alert Read", description: "Notification marked as read." });
        loadNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };



  const filtered = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return n.status === "Unread";
    if (filter === "read") return n.status === "Read";
    return true;
  });

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Notification Center</h1>
            <p className="text-muted-foreground mt-2">Manage customer alerts and live read/unread notification logs.</p>
          </div>
          <Button onClick={loadNotifications} variant="outline" className="rounded-full border hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sync Alerts
          </Button>
        </div>



        {/* Alert Logs Cards */}
        <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3.5">
            <h3 className="font-bold text-primary text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" /> Alert Broadcast Log
            </h3>
            
            <div className="flex gap-1">
              {[
                { id: "all", label: "All Logs" },
                { id: "unread", label: "Unread" },
                { id: "read", label: "Read" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                    filter === t.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs">Loading alerts history...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">No alerts match the selected status filter.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(n => {
                const isUnread = n.status === "Unread";
                const isEmail = n.channel === "Email";
                const isWhatsApp = n.channel === "WhatsApp";
                const isSms = n.channel === "SMS";

                return (
                  <motion.div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                      isUnread ? "border-accent/30 bg-accent/5 shadow-sm" : "border-border bg-secondary/10"
                    }`}
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-primary">{n.type}</span>
                        <Badge className={`text-[8px] font-extrabold tracking-wider ${
                          isEmail ? "bg-amber-100 text-amber-800" :
                          isWhatsApp ? "bg-emerald-100 text-emerald-800" :
                          isSms ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"
                        }`}>
                          {n.channel}
                        </Badge>
                      </div>
                      <p className="text-slate-600 font-medium text-xs mt-1">"{n.message}"</p>
                      <span className="text-[10px] text-slate-400 block pt-1">Timestamp: {new Date(n.createdAt).toLocaleString()} · User: {n.user?.username || "customer"}</span>
                    </div>

                    {isUnread && (
                      <Button
                        onClick={() => handleMarkAsRead(n.id)}
                        size="sm"
                        variant="outline"
                        className="rounded-full text-[10px] font-bold border h-7 bg-white hover:bg-slate-50 flex items-center gap-1.5 px-3 flex-shrink-0"
                      >
                        <CheckSquare className="w-3 h-3 text-accent" /> Mark Read
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
