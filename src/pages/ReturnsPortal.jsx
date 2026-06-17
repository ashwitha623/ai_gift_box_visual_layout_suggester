import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldAlert, Send, CheckCircle2, XCircle, Clock, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ReturnsPortal() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Return Form State
  const [orderId, setOrderId] = useState("");
  const [type, setType] = useState("Refund");
  const [reason, setReason] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/returns");
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleFileReturn = async (e) => {
    e.preventDefault();
    if (!orderId || !reason) {
      toast({ title: "Validation Error", description: "Please enter Order ID and Reason.", variant: "destructive" });
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/returns", {
        orderId: parseInt(orderId),
        type,
        reason
      });

      toast({ title: "Request Filed", description: "Your return request has been submitted to admin approval." });
      setOrderId("");
      setReason("");
      loadReturns();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to file request.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Returns & Refund Manager</h1>
            <p className="text-muted-foreground mt-2">Submit and monitor requests for returns, replacements, or payment refunds.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-full border border-border flex items-center gap-3 shadow-sm">
            <ArrowLeftRight className="text-accent w-5 h-5" />
            <span className="font-semibold text-sm text-primary">Active Claims: {requests.length}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* File a request form */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md h-fit">
            <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2 text-primary">
              <ShieldAlert className="w-5 h-5 text-accent" /> File Return Claim
            </h2>
            <form onSubmit={handleFileReturn} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Order ID</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 1" 
                  value={orderId} 
                  onChange={(e) => setOrderId(e.target.value)} 
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Claim Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="rounded-xl h-11 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Return">Standard Return 📦</SelectItem>
                    <SelectItem value="Replacement">Item Replacement 🔄</SelectItem>
                    <SelectItem value="Refund">Full Payment Refund 💰</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Reason for Claim</Label>
                <Textarea 
                  placeholder="Explain why you wish to return or refund this order..." 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  className="rounded-xl h-24 bg-white"
                />
              </div>

              <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold h-11 shadow-lg shadow-primary/10">
                <Send className="w-4 h-4 mr-2" /> Submit Claim Request
              </Button>
            </form>
          </div>

          {/* Requests Lists */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md">
              <h2 className="text-2xl font-bold font-heading mb-6 text-primary">Claims History & Tracking</h2>

              {loading ? (
                <div className="text-center py-10">Loading returns...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldAlert className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No return or refund requests logged. Enter details to submit a claim.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req, index) => {
                    const isPending = req.status === "Pending";
                    const isApproved = req.status === "Approved";
                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-secondary rounded-2xl p-5 border border-border space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-border">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary text-sm">Order #{req.orderId}</span>
                            <Badge className="bg-white border text-primary text-[10px] uppercase font-bold tracking-wider">
                              {req.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> PENDING
                              </Badge>
                            ) : isApproved ? (
                              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> REJECTED
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-slate-700">
                          <strong className="text-primary text-xs uppercase block mb-1">Reason</strong>
                          <p className="italic text-xs">"{req.reason}"</p>
                        </div>

                        {req.adminNotes && (
                          <div className="text-xs text-slate-500 bg-white/70 p-2.5 rounded-xl border">
                            <strong>Feedback:</strong> {req.adminNotes}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
