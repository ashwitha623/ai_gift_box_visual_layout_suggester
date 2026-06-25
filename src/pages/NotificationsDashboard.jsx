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
        // Dispatch event to refresh layout badge count instantly
        window.dispatchEvent(new Event("refresh-notifications"));
        loadNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await axios.delete("http://localhost:5000/api/notifications");
      if (res.data.success) {
        toast({ title: "Cleared", description: "All notifications cleared successfully." });
        setNotifications([]);
        // Dispatch event to refresh layout badge count instantly
        window.dispatchEvent(new Event("refresh-notifications"));
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to clear notifications.", variant: "destructive" });
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
          <div className="flex gap-2.5">
            <Button onClick={handleClearAll} variant="destructive" className="rounded-full flex items-center gap-2 text-xs font-semibold px-5">
              Clear All Logs
            </Button>
            <Button onClick={loadNotifications} variant="outline" className="rounded-full border hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold px-5">
              <RefreshCw className="w-4 h-4" /> Sync Alerts
            </Button>
          </div>
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
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200/60 bg-slate-50/30 flex flex-col sm:flex-row justify-between sm:items-center gap-3 h-20 sm:h-16">
                  <div className="space-y-2 w-3/4">
                    <div className="h-4 w-1/4 bg-slate-200 rounded" />
                    <div className="h-3.5 w-full bg-slate-100 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full self-start sm:self-center" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200/80 rounded-[28px] bg-slate-50/20 my-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-primary">
                <Bell className="w-7 h-7 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-primary font-heading">All clear! No alerts</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  No notifications match the selected status filter at the moment.
                </p>
              </div>
              <Button 
                onClick={loadNotifications}
                variant="outline" 
                className="rounded-full border hover:bg-slate-50 text-xs font-semibold px-5 h-9"
              >
                Sync Notification Stream
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(n => {
                const isUnread = n.status === "Unread";

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
