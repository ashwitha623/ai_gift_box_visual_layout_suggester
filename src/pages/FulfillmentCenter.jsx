import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ClipboardList, Calendar, Users, ShieldCheck, MapPin, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const TIMELINE_STAGES = [
  { label: "Order Received", statusKey: "Order Placed" },
  { label: "Design Approved", statusKey: "Customization" },
  { label: "Production Started", statusKey: "Production" },
  { label: "Packaging", statusKey: "Packaging" },
  { label: "Quality Check", statusKey: "Quality Check" },
  { label: "Shipped", statusKey: "Dispatch" },
  { label: "Delivered", statusKey: "Delivered" }
];

const STAGE_TEAM = {
  "Order Received": "Admin Desk",
  "Design Approved": "Design Team",
  "Production Started": "Production Team",
  "Packaging": "Packaging Team",
  "Quality Check": "Quality Audit Team",
  "Shipped": "Logistics Dispatch",
  "Delivered": "Delivery Ops"
};

export default function FulfillmentCenter() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFulfillmentData();
  }, []);

  const loadFulfillmentData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data);
      if (res.data.length > 0) {
        setSelectedOrder(res.data[res.data.length - 1]); // Default to latest order
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load order deliveries.", variant: "destructive" });
      setLoading(false);
    }
  };

  const getActiveStageIndex = (status) => {
    if (status === "Order Placed") return 0;
    if (status === "Customization") return 1;
    if (status === "Production") return 2;
    if (status === "Packaging") return 3;
    if (status === "Quality Check") return 4;
    if (status === "Dispatch") return 5;
    if (status === "Delivered") return 6;
    return 0; // Default
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Order Fulfillment Center</h1>
            <p className="text-muted-foreground mt-2">Track real-time gift processing flows, assigned logistics teams, and live delivery milestones.</p>
          </div>
          <Button onClick={loadFulfillmentData} variant="outline" className="rounded-full border hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Statuses
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Order list sidebar */}
          <div className="lg:col-span-5 bg-card border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-primary text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" /> Active Deliveries List
            </h3>
            
            {loading ? (
              <div className="text-center py-10 text-xs">Loading active orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No orders tracked. Placed a custom order first!</div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {orders.slice().reverse().map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  const activeIdx = getActiveStageIndex(order.status);
                  const activeStageLabel = TIMELINE_STAGES[activeIdx].label;

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary/40 bg-secondary/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-primary text-xs block">{order.trackingId}</span>
                          <span className="text-[10px] text-slate-400">Client: <strong>{order.user?.username || "Guest"}</strong></span>
                        </div>
                        <Badge className="bg-white border text-primary text-[9px] font-bold uppercase tracking-wider">
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2.5">
                        <span>Team: <strong className="text-slate-700">{STAGE_TEAM[activeStageLabel]}</strong></span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline visualization */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                
                {/* Header details */}
                <div className="border-b pb-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-primary text-xl">Tracking Order {selectedOrder.trackingId}</h3>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-250 font-bold text-xs uppercase px-3.5 py-1 rounded-full">
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Recipient Name: <strong>{selectedOrder.recipient?.name || "Guest"}</strong> · Box Size Style: <strong>{selectedOrder.boxSize}</strong> · Value: <strong>₹{selectedOrder.totalPrice}</strong></p>
                </div>

                {/* Timeline Visualization Card */}
                <div className="bg-secondary/20 rounded-2xl p-6 border border-border/60">
                  <div className="text-center font-bold text-[10px] text-slate-400 mb-6 tracking-widest uppercase">Order Fulfillment Timeline Flow</div>
                  
                  {/* Step Progress Line */}
                  <div className="relative flex justify-between items-center">
                    
                    {/* Background Progress bar line */}
                    <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                    
                    {/* Active completed progress bar line */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(getActiveStageIndex(selectedOrder.status) / 6) * 90}%` }}
                      className="absolute left-[5%] top-1/2 -translate-y-1/2 h-1 bg-accent z-0"
                    />

                    {TIMELINE_STAGES.map((stage, idx) => {
                      const activeIdx = getActiveStageIndex(selectedOrder.status);
                      const isCompleted = idx < activeIdx;
                      const isActive = idx === activeIdx;

                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border shadow transition-all ${
                            isCompleted ? "bg-accent text-white border-accent" :
                            isActive ? "bg-primary text-white border-primary ring-4 ring-primary/15 scale-110" :
                            "bg-white text-slate-400 border-slate-200"
                          }`}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span className={`text-[8px] font-bold tracking-tight mt-2 text-center absolute top-8 w-16 ${
                            isActive ? "text-primary scale-105" : "text-muted-foreground"
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}

                  </div>

                  <div className="h-10" /> {/* Spacing */}
                </div>

                {/* Operations Assignment Stats */}
                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  <div className="bg-secondary/15 rounded-2xl p-4 border text-xs space-y-2">
                    <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">Active Operations Assignment</span>
                    <div className="space-y-1">
                      <div>Assigned Team: <strong className="text-slate-700">{STAGE_TEAM[TIMELINE_STAGES[getActiveStageIndex(selectedOrder.status)].label]}</strong></div>
                      <div>Logistics Partner: <strong className="text-slate-700">Paper Plane Premium Express</strong></div>
                    </div>
                  </div>
                  <div className="bg-secondary/15 rounded-2xl p-4 border text-xs space-y-2">
                    <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">Occasion Greeting Cards</span>
                    <div className="space-y-1 line-clamp-2">
                      <span className="italic text-slate-500">"{selectedOrder.recipient?.message || "No card greeting specified."}"</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-card border rounded-3xl p-16 text-center shadow-sm text-muted-foreground text-xs">
                Select a gift order from the active deliveries to visualize the horizontal status flow timeline.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
