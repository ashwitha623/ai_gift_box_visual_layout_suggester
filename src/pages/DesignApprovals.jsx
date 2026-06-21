import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Clock, FileText, CheckCircle, XCircle, Send, CornerDownRight, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import GiftBoxVisual from "@/components/giftbox/GiftBoxVisual";
import { Label } from "@/components/ui/label";
import { PRODUCTS } from "@/lib/giftdata";

function inferOccasion(order) {
  if (!order) return "just_because";
  const msg = (order.recipient?.message || "").toLowerCase();
  const txt = (order.recipient?.customText || "").toLowerCase();
  
  if (msg.includes("anniversary") || txt.includes("forever")) return "anniversary";
  if (msg.includes("birthday") || msg.includes("bday")) return "birthday";
  if (msg.includes("wedding") || msg.includes("marriage")) return "wedding";
  if (msg.includes("graduate") || msg.includes("graduation")) return "graduation";
  if (msg.includes("corp") || msg.includes("company") || msg.includes("business") || msg.includes("partnership") || txt.includes("corp")) return "corporate";
  if (msg.includes("baby") || msg.includes("shower")) return "baby_shower";
  if (msg.includes("friend")) return "friendship";
  if (msg.includes("farewell") || msg.includes("goodbye")) return "farewell";
  if (msg.includes("festival") || msg.includes("diwali") || msg.includes("eid") || msg.includes("christmas")) return "festival";
  
  return "just_because";
}

export default function DesignApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/design-approvals");
      setApprovals(res.data);
      if (res.data.length > 0) {
        setSelectedApproval(res.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load design approvals.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, notes) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/design-approvals/${id}/status`, {
        status,
        revisionNotes: notes
      });
      if (res.data.success) {
        toast({ title: `Design ${status}`, description: `Status successfully saved to database.` });
        setRevisionNotes("");
        // Reload all
        const resList = await axios.get("http://localhost:5000/api/design-approvals");
        setApprovals(resList.data);
        const updated = resList.data.find(a => a.id === id);
        setSelectedApproval(updated);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit decision.", variant: "destructive" });
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const filtered = approvals.filter(a => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return a.status === "Awaiting Customer Approval" || a.status === "Draft Created";
    if (activeTab === "approved") return a.status === "Approved" || a.status === "Final Approved";
    if (activeTab === "revision") return a.status === "Revision Requested";
    return true;
  });

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Design Approval Center</h1>
            <p className="text-muted-foreground mt-2">Preview 3D/top-down hamper mockup layouts, submit client approvals, or request design revisions.</p>
          </div>
          <Button onClick={loadApprovals} variant="outline" className="rounded-full border hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reload Reviews
          </Button>
        </div>

        {/* View Layout Split */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* List Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" /> Design Reviews Log
                </h3>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-1.5 border-b pb-3">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "approved", label: "Approved" },
                  { id: "revision", label: "Revisions" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                      activeTab === t.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-10 text-xs">Loading design reviews...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No designs match the selected tab filter.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filtered.map(a => {
                    const isSelected = selectedApproval?.id === a.id;
                    const itemsList = a.order?.items || [];
                    const recipientName = a.order?.recipient?.name || "None";
                    
                    return (
                      <div
                        key={a.id}
                        onClick={() => { setSelectedApproval(a); setRevisionNotes(""); }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary/40 bg-secondary/15"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-primary text-xs block">Order {a.order?.trackingId || `#${a.orderId}`}</span>
                            <span className="text-[10px] text-slate-400">Recipient: <strong>{recipientName}</strong></span>
                          </div>
                          <Badge className={`text-[9px] font-bold ${
                            a.status.includes("Approved") ? "bg-emerald-100 text-emerald-800" :
                            a.status.includes("Revision") ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {a.status}
                          </Badge>
                        </div>
                        <div className="mt-2.5 flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2.5">
                          <span>Items Count: {itemsList.length}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated: {new Date(a.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Preview & Action Center */}
          <div className="lg:col-span-7">
            {selectedApproval ? (
              <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Header details */}
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-primary text-xl">Reviewing Layout Order {selectedApproval.order?.trackingId}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Client: <strong>{selectedApproval.order?.user?.username || "Guest"}</strong> · Ribbon Color: <span className="font-semibold" style={{ color: selectedApproval.order?.ribbonColor }}>{selectedApproval.order?.ribbonColor || "None"}</span></p>
                  </div>
                  <Badge className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selectedApproval.status.includes("Approved") ? "bg-emerald-100 text-emerald-800" :
                    selectedApproval.status.includes("Revision") ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedApproval.status}
                  </Badge>
                </div>

                {/* 3D/Visualizer Preview Box */}
                <div className="bg-secondary/20 rounded-2xl p-4 border border-border/60">
                  <div className="text-center font-bold text-[10px] text-slate-400 mb-3 tracking-widest uppercase">Top-Down STUDIO Hamper Mockup</div>
                  <GiftBoxVisual
                    products={(selectedApproval.order?.items || []).map(i => {
                      const dbProd = i.product;
                      if (!dbProd) return null;
                      const catalogProd = PRODUCTS.find(p => p.name.toLowerCase() === dbProd.name.toLowerCase());
                      return catalogProd ? { ...dbProd, ...catalogProd, id: dbProd.id } : dbProd;
                    }).filter(Boolean)}
                    ribbonHex={selectedApproval.order?.ribbonColor || "#D4AF37"}
                    customizations={{
                      name: selectedApproval.order?.recipient?.name,
                      message: selectedApproval.order?.recipient?.message,
                      photoUrl: selectedApproval.order?.recipient?.photoUrl,
                      logoUrl: selectedApproval.order?.recipient?.logoUrl,
                      customText: selectedApproval.order?.recipient?.customText,
                      occasion: inferOccasion(selectedApproval.order)
                    }}
                    size="lg"
                  />
                </div>

                {/* Decision Action forms */}
                {selectedApproval.status !== "Approved" && selectedApproval.status !== "Final Approved" && (
                  <div className="bg-secondary/10 border rounded-2xl p-4 space-y-4">
                    <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Design Decision Center</h4>
                    
                    {/* Notes */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">Revision Notes / Feedback</Label>
                      <Textarea
                        placeholder="Provide details if you require rearrangement of products, alternative ribbon colors, or custom message edits..."
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        className="h-20 bg-white text-xs"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateStatus(selectedApproval.id, isAdmin ? "Final Approved" : "Approved", revisionNotes)}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Design
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(selectedApproval.id, "Revision Requested", revisionNotes)}
                        variant="destructive"
                        className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-750 text-white font-semibold text-xs h-10 flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Request Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Timeline / Action History Logs */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Approval Audit Timeline</h4>
                  <div className="space-y-3">
                    {JSON.parse(selectedApproval.history || "[]").map((log, lIdx) => (
                      <div key={lIdx} className="flex gap-3 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-primary block">{log.action}</span>
                          <span className="text-[10px] text-slate-400 block">{new Date(log.timestamp).toLocaleString()} · Actor: {log.actor || "System"}</span>
                          <p className="text-slate-600 mt-1 italic">"{log.note}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-card border rounded-3xl p-16 text-center shadow-sm text-muted-foreground text-xs">
                Select a design review from the list to launch the studio mockup visualizer.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
