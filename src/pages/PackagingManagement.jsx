import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Archive, Plus, Sparkles, Layers, RefreshCw, Scissors, Heart, Award, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const STYLES_DETAILS = [
  { name: "Luxury Hamper", icon: Award, desc: "Navy blue box with embossed double gold rims, gold satin bow, and shaded wood-wool crinkle paper.", tag: "Default Premium" },
  { name: "Romantic Florals", icon: Heart, desc: "Crimson red box with pink satin ribbon draping, red roses bouquet, and pale rose shreds.", tag: "Anniversary & Love" },
  { name: "Corporate Engage", icon: Layers, desc: "Minimalist black box with sleek silver engraving plate, navy blue ribbon, and brown Kraft filler.", tag: "B2B Professional" },
  { name: "Festive Splendor", icon: Sparkles, desc: "Bright gold box, scarlet ribbons, mixed colorful flowers, and rich multi-color crinkles.", tag: "Holidays & Festivals" }
];

export default function PackagingManagement() {
  const [packaging, setPackaging] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPackagingData();
  }, []);

  const loadPackagingData = async () => {
    try {
      setLoading(true);
      const invRes = await axios.get("http://localhost:5000/api/inventory");
      const ordersRes = await axios.get("http://localhost:5000/api/orders");
      
      setPackaging((invRes.data.packaging || []).filter(item => item.type === "Box" || item.type === "Ribbon" || item.type === "Paper"));
      setOrders(ordersRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load packaging details.", variant: "destructive" });
      setLoading(false);
    }
  };

  // Group by type
  const boxes = packaging.filter(p => p.type === "Box");
  const ribbons = packaging.filter(p => p.type === "Ribbon");
  const papers = packaging.filter(p => p.type === "Paper");

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Packaging & Styles Manager</h1>
            <p className="text-muted-foreground mt-2">Manage physical boxes stock counts, satin ribbon colors, packaging styling guides, and track material usage per order.</p>
          </div>
          <Button onClick={loadPackagingData} variant="outline" className="rounded-full border hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sync Stocks
          </Button>
        </div>

        {/* Outer Split layouts */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Packaging Stocks inventory */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Box Sizes Inventory Card */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-base flex items-center gap-2 border-b pb-2">
                <Archive className="w-5 h-5 text-accent" /> Rigid Gift Boxes Stock (Small, Medium, Large)
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {boxes.map(box => (
                  <div key={box.id} className="bg-secondary/15 border rounded-2xl p-4 space-y-2">
                    <span className="font-extrabold text-primary text-xs block">{box.name}</span>
                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <div>SKU: <strong>{box.sku}</strong></div>
                      <div>Min Limit: <strong>{box.minThreshold} units</strong></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold text-slate-700">Stock: {box.availableQty}</span>
                      <Badge className={`text-[8px] font-bold ${
                        box.status === "In Stock" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {box.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ribbon & Wrapping Paper Inventory Card */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-base flex items-center gap-2 border-b pb-2">
                <Scissors className="w-5 h-5 text-accent" /> Satin Ribbon & Wrapping Papers
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Ribbons */}
                <div className="space-y-3">
                  <span className="font-bold text-xs text-primary block uppercase tracking-wider">Ribbons Rolls</span>
                  {ribbons.map(rib => (
                    <div key={rib.id} className="bg-secondary/10 border rounded-2xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-primary block">{rib.name}</span>
                        <span className="text-[9px] text-slate-400">SKU: {rib.sku}</span>
                      </div>
                      <Badge className="bg-white border text-primary font-bold text-[10px]">{rib.availableQty} meters</Badge>
                    </div>
                  ))}
                </div>

                {/* Wrapping papers */}
                <div className="space-y-3">
                  <span className="font-bold text-xs text-primary block uppercase tracking-wider">Wrapping Sheets</span>
                  {papers.map(p => (
                    <div key={p.id} className="bg-secondary/10 border rounded-2xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-primary block">{p.name}</span>
                        <span className="text-[9px] text-slate-400">SKU: {p.sku}</span>
                      </div>
                      <Badge className="bg-white border text-primary font-bold text-[10px]">{p.availableQty} units</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Packaging Styles */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-base flex items-center gap-2 border-b pb-2">
                <Sparkles className="w-5 h-5 text-accent" /> Packaging Styles Guide
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {STYLES_DETAILS.map((style, idx) => {
                  const Icon = style.icon;
                  return (
                    <div key={idx} className="bg-secondary/15 rounded-2xl p-4 border flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-primary">{style.name}</span>
                          <Badge className="bg-primary/10 text-primary text-[8px] font-bold uppercase">{style.tag}</Badge>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-[11px]">{style.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Material Usage Tracking log per order */}
          <div className="lg:col-span-4 bg-card border rounded-3xl p-6 shadow-sm space-y-4 flex flex-col h-[760px]">
            <h3 className="font-bold text-primary text-base flex items-center gap-2 border-b pb-2">
              <Gift className="w-5 h-5 text-accent" /> Material Usage Log per Order
            </h3>

            {loading ? (
              <div className="text-center py-10 text-xs">Loading logs...</div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">No orders placed to track material usage.</p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {orders.slice().reverse().map(order => {
                  const ribbon = order.ribbonColor || "Premium Gold";
                  const box = order.boxSize || "Medium";

                  return (
                    <div key={order.id} className="bg-secondary/10 border rounded-2xl p-3.5 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-primary">{order.trackingId}</span>
                        <span className="text-slate-400 text-[10px]">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>📦 Box Size:</span>
                          <strong className="text-primary">{box} Size Box</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>🎀 Satin Ribbon:</span>
                          <strong className="text-primary" style={{ color: order.ribbonColor }}>{ribbon}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>📄 Wrapping Style:</span>
                          <strong className="text-primary">{order.status === "Delivered" ? "Delivered Style" : "Luxury Kraft"}</strong>
                        </div>
                      </div>
                      <div className="border-t pt-1.5 flex justify-between text-[9px] text-emerald-600 font-bold uppercase tracking-wider">
                        <span>Fulfillment Status:</span>
                        <span>{order.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
