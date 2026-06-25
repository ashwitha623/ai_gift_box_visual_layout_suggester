import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Package, Clock, FileText, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { parseMessageMetadata } from "@/lib/utils";

const TRACKING_STAGES = [
  "Order Placed",
  "Customization",
  "Packaging",
  "Quality Check",
  "Dispatch",
  "Delivered"
];

export default function OrderTracking() {
  const [searchTrackingId, setSearchTrackingId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackedItems, setTrackedItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!searchTrackingId) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/orders/track/${searchTrackingId}`);
      if (res.data.success) {
        setTrackedOrder(res.data.order);
        setTrackedItems(res.data.items);
      } else {
        toast({ title: "Order Not Found", description: "No matching tracking records found.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Order Not Found", description: "Check your tracking ID and try again.", variant: "destructive" });
    }
  };

  const getStageIndex = (status) => {
    if (!status) return -1;
    if (status === "Production") return TRACKING_STAGES.indexOf("Customization");
    return TRACKING_STAGES.indexOf(status);
  };

  const currentStageIndex = trackedOrder ? getStageIndex(trackedOrder.status) : -1;

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {trackedOrder ? (
          /* Tracked Order Details View */
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => setTrackedOrder(null)} className="rounded-full pl-2 pr-4 text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to History
            </Button>

            <div id="invoice-printable-area" className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-border">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ORDER TRACKING</span>
                  <h2 className="text-3xl font-extrabold font-heading text-primary">{trackedOrder.trackingId}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Order Value</span>
                  <span className="text-xl font-extrabold text-primary">₹{trackedOrder.totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Fulfillment visual timeline */}
              <div className="py-8 border-b border-border">
                <h3 className="font-bold text-sm text-primary uppercase tracking-wide mb-8">Fulfillment Progress</h3>
                
                {/* Horizontal Progress Bar */}
                <div className="relative flex justify-between items-center w-full">
                  {/* Line Background */}
                  <div className="absolute left-[8%] right-[8%] h-1 bg-border rounded" />
                  
                  {/* Line Progress Fill */}
                  <div 
                    className="absolute left-[8%] h-1 bg-[#C5A880] rounded transition-all duration-500" 
                    style={{ width: `${currentStageIndex >= 0 ? (currentStageIndex / (TRACKING_STAGES.length - 1)) * 84 : 0}%` }}
                  />

                  {TRACKING_STAGES.map((stage, i) => {
                    const isCompleted = i <= currentStageIndex;
                    const isActive = i === currentStageIndex;
                    return (
                      <div key={stage} className="relative z-10 flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isActive ? "bg-[#C5A880] border-[#C5A880] text-white scale-110 shadow-lg shadow-accent/20" :
                          isCompleted ? "bg-primary border-primary text-white" :
                          "bg-white border-border text-muted-foreground"
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <span className={`text-[10px] font-bold mt-2.5 text-center hidden sm:block ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>{stage}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between w-full sm:hidden text-[9px] font-bold text-muted-foreground mt-4 px-2">
                  <span>Placed</span>
                  <span>QC</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Order Info & Personalizations */}
              <div className="grid md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-primary">Order Metadata</h4>
                  <div className="text-xs text-slate-700 space-y-2">
                    <p>Box Size: <strong>{trackedOrder.boxSize}</strong></p>
                    <p>Ribbon Accent: <strong>{trackedOrder.ribbonColor || "None"}</strong></p>
                    <p>Payment Status: <strong>{trackedOrder.paymentStatus}</strong></p>
                    <p>Payment Method: <strong>{trackedOrder.paymentMethod}</strong></p>
                  </div>
                </div>

                <div className="bg-secondary rounded-2xl p-5 border">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-primary mb-3">Customization Card</h4>
                  <div className="text-xs space-y-2 text-slate-600">
                    <p>Recipient: <strong>{trackedOrder.recipient?.name}</strong></p>
                    {trackedOrder.recipient?.phone && <p>Phone: <strong>{trackedOrder.recipient.phone}</strong></p>}
                    {trackedOrder.recipient?.message && (() => {
                      const { message: cleanMessage } = parseMessageMetadata(trackedOrder.recipient.message);
                      return cleanMessage ? (
                        <p className="italic bg-white p-3 rounded-xl border">"{cleanMessage}"</p>
                      ) : null;
                    })()}
                    {trackedOrder.recipient?.customText && <p>Box Lid Text: <strong>{trackedOrder.recipient.customText}</strong></p>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed flex justify-between">
                    <a href="/returns" className="text-xs text-[#C5A880] font-semibold hover:underline flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Return / Refund Claim
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Orders List and Tracking Search View */
          <div className="space-y-10">
            {/* Tracking Search Card */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold font-heading mb-2 text-primary">Track Your Gift Box</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter your Paper Plane order tracking code to view progress timeline.</p>
              
              <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. PP-123456" 
                    value={searchTrackingId} 
                    onChange={(e) => setSearchTrackingId(e.target.value)} 
                    className="pl-10 rounded-full h-11"
                  />
                </div>
                <Button type="submit" className="rounded-full bg-primary hover:bg-primary/95 text-white px-5 h-11 font-semibold">
                  Track
                </Button>
              </form>
            </div>

            {/* Orders History Table */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md">
              <h2 className="text-2xl font-bold font-heading mb-6 text-primary flex items-center gap-2">
                <Package className="w-5.5 h-5.5 text-accent" /> Order History & Invoices
              </h2>

              {loading ? (
                <div className="text-center py-10">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No orders placed yet. Create and customize a gift box!</div>
              ) : (
                <div className="space-y-4">
                  {orders.slice().reverse().map((order) => (
                    <div
                      key={order.id}
                      className="bg-secondary rounded-2xl p-5 border border-border flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#C5A880]/30 flex items-center justify-center flex-shrink-0">
                          <Package className="text-primary w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-primary text-base">{order.trackingId}</h4>
                            <Badge className="bg-white border text-primary text-[10px] uppercase font-bold tracking-wider">
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Total Value: <strong className="text-slate-700">₹{order.totalPrice.toLocaleString("en-IN")}</strong> · Placed: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setTrackedOrder(order); setTrackedItems([]); setSearchTrackingId(order.trackingId); }}
                          className="rounded-full text-xs font-semibold hover:bg-white text-muted-foreground border px-4 py-2"
                        >
                          Fulfillment Stages
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
