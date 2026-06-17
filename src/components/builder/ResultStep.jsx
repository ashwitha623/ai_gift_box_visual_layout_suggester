import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Sparkles, RefreshCw, ShoppingCart, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import GiftBoxVisual from "@/components/giftbox/GiftBoxVisual";
import ReportCard from "@/components/giftbox/ReportCard";
import LayoutComparison from "@/components/giftbox/LayoutComparison";
import { exportReportPDF, downloadSummary } from "@/lib/exportReport";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import confetti from "canvas-confetti";

export default function ResultStep({ result, occasion, products, details, onRestart }) {
  const [activeLayout, setActiveLayout] = useState(result.recommended);
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  const handlePDF = async () => {
    setExporting(true);
    await exportReportPDF(reportRef.current, details.name || "gift-box");
    setExporting(false);
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const res = await axios.post("http://localhost:5000/api/orders", {
        userId: 1, // Mock Customer ID
        products: products,
        totalPrice: result.totalPrice + 350, // Product total plus box/ribbon wrapping fees
        ribbonColor: activeLayout.ribbon.color,
        boxSize: details.boxSize,
        recipientName: details.name,
        message: details.message,
        customText: details.customText,
        photoUrl: details.photoUrl,
        logoUrl: details.logoUrl,
        paymentMethod
      });

      if (res.data.success) {
        setTrackingId(res.data.trackingId);
        setOrderSuccess(true);
        // Fire confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        toast({ title: "Order Error", description: "Could not process order.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Order Error", description: "Failed to connect to checkout server.", variant: "destructive" });
    }
    setPlacingOrder(false);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4 text-primary" /> AI Recommendation Ready
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
          {details.name ? `${details.name}'s` : "Your"} {occasion.title} Gift Box
        </h2>
        <p className="text-muted-foreground mt-2">
          Recommended layout: <span className="font-semibold text-primary">{activeLayout.name}</span> · Match Score {activeLayout.matchScore}%
        </p>
      </div>

      <div ref={reportRef} className="bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10">
          <GiftBoxVisual products={products} ribbonHex={activeLayout.ribbon.hex} layoutId={activeLayout.id} customizations={details} />
        </motion.div>

        <ReportCard layout={activeLayout} occasion={occasion} products={products} details={details} totalPrice={result.totalPrice} />
      </div>

      <LayoutComparison
        recommended={result.recommended}
        alternatives={result.alternatives}
        active={activeLayout}
        onSelect={setActiveLayout}
        products={products}
        customizations={details}
      />

      <div className="flex flex-wrap justify-center gap-3 mt-10">
        <Button onClick={() => setCheckoutOpen(true)} className="rounded-full bg-primary hover:bg-primary/90 text-white border-0 shadow-md px-6">
          <ShoppingCart className="w-4 h-4 mr-2" /> Place Gifting Order
        </Button>
        <Button onClick={handlePDF} disabled={exporting} variant="outline" className="rounded-full border px-6">
          <FileText className="w-4 h-4 mr-2" /> {exporting ? "Exporting..." : "Export Report (PDF)"}
        </Button>
        <Button variant="ghost" onClick={() => downloadSummary(activeLayout, occasion, products, details, result.totalPrice)} className="rounded-full px-6 text-muted-foreground">
          <Download className="w-4 h-4 mr-2" /> Download Summary
        </Button>
        <Button variant="ghost" onClick={onRestart} className="rounded-full px-6 text-muted-foreground">
          <RefreshCw className="w-4 h-4 mr-2" /> Start Over
        </Button>
      </div>

      {/* CHECKOUT MODAL FLOW */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
              {orderSuccess ? "Order Confirmed! 🎉" : "Complete Gifting Purchase"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
              {orderSuccess 
                ? "Your order has been logged in our fulfillment queue." 
                : "Choose payment details to confirm your customized gift box."}
            </DialogDescription>
          </DialogHeader>

          {orderSuccess ? (
            <div className="text-center py-6 space-y-5">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <div className="bg-secondary rounded-2xl p-4 border border-border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Order Tracking ID</span>
                <span className="text-2xl font-black text-primary tracking-tight">{trackingId}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We have generated your custom invoice and dispatched the design parameters to our production queue.
              </p>
              <div className="flex gap-2 justify-center">
                <a href="/orders">
                  <Button className="rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs px-5 h-10 shadow-md">
                    Track Fulfillment Timeline
                  </Button>
                </a>
                <Button variant="ghost" onClick={() => { setCheckoutOpen(false); setOrderSuccess(false); onRestart(); }} className="rounded-full border hover:bg-slate-50 text-xs px-5 h-10">
                  Build Another
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {/* Order price summary */}
              <div className="bg-secondary rounded-2xl p-4 border flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-500">Box Total (with wrapping):</span>
                <span className="text-primary text-base">₹{(result.totalPrice + 350).toLocaleString("en-IN")}</span>
              </div>

              {/* Payment selector */}
              <div className="space-y-3">
                <Label className="font-bold text-xs text-primary uppercase tracking-wide">Select Payment Gateway</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-3">
                  {["Card", "UPI", "Net Banking"].map((m) => (
                    <label key={m} className={`flex flex-col items-center gap-1.5 border-2 rounded-2xl py-3 px-1 cursor-pointer hover:border-primary/50 transition-colors ${
                      paymentMethod === m ? "border-primary bg-secondary/50" : "border-border bg-white"
                    }`}>
                      <RadioGroupItem value={m} className="hidden" />
                      <span className="text-xs font-bold text-primary">{m}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={placingOrder} 
                  className="flex-1 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold h-11 text-xs shadow-md"
                >
                  {placingOrder ? "Processing Payment..." : "Confirm & Pay"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setCheckoutOpen(false)} 
                  className="rounded-full border hover:bg-slate-50 text-xs px-4 h-11"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}