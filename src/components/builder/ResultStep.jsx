import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Sparkles, RefreshCw, ShoppingCart, CheckCircle, ShieldCheck, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import GiftBoxVisual from "@/components/giftbox/GiftBoxVisual";
import ReportCard from "@/components/giftbox/ReportCard";
import LayoutComparison from "@/components/giftbox/LayoutComparison";
import { exportReportPDF, downloadSummary } from "@/lib/exportReport";
import { useToast } from "@/components/ui/use-toast";
import { useAuthAction } from "@/components/AuthModalContext";
import axios from "axios";
import confetti from "canvas-confetti";

export default function ResultStep({ result, occasion, products, details, onRestart }) {
  const [activeLayout, setActiveLayout] = useState(result.recommended);
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const { toast } = useToast();
  const { withAuth } = useAuthAction();

  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  const handlePDF = async () => {
    setExporting(true);
    await exportReportPDF(reportRef.current, details.name || "gift-box");
    setExporting(false);
  };

  const handleSaveLayout = async () => {
    setSavingLayout(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/save-layout",
        {
          occasion: occasion.title,
          products: products.map((p) => p.name),
          layout: activeLayout.name,
          ribbon: activeLayout.ribbon.color,
        }
      );

      if (res.data.success) {
        toast({
          title: "Layout Saved",
          description: "This design has been added to your Layout History.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save layout.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to connect to backend server.",
        variant: "destructive"
      });
    }
    setSavingLayout(false);
  };

  const handleDownloadSummary = () => {
    downloadSummary(activeLayout, occasion, products, details, result.totalPrice);
  };

  // Hash checking to auto-execute action after authentication
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#place-order") {
      window.history.replaceState(null, null, " ");
      setCheckoutOpen(true);
    } else if (hash === "#save-layout") {
      window.history.replaceState(null, null, " ");
      handleSaveLayout();
    } else if (hash === "#download-pdf") {
      window.history.replaceState(null, null, " ");
      handlePDF();
    } else if (hash === "#download-summary") {
      window.history.replaceState(null, null, " ");
      handleDownloadSummary();
    }
  }, []);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    let userId = 1;
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) userId = user.id;
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await axios.post("http://localhost:5000/api/orders", {
        userId,
        products: products,
        totalPrice: result.totalPrice + activeLayout.box.cost, // Product total plus selected box cost
        ribbonColor: activeLayout.ribbon.color,
        boxSize: activeLayout.box.name,
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

  const onPlaceOrderClick = () => {
    withAuth(() => {
      setCheckoutOpen(true);
    }, "/create#place-order");
  };

  const onSaveLayoutClick = () => {
    withAuth(() => {
      handleSaveLayout();
    }, "/create#save-layout");
  };

  const onPDFClick = () => {
    withAuth(() => {
      handlePDF();
    }, "/create#download-pdf");
  };

  const onSummaryClick = () => {
    withAuth(() => {
      handleDownloadSummary();
    }, "/create#download-summary");
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4 text-primary" /> AI Recommendation Ready
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary truncate px-2">
          {details.name ? `${details.name.length > 15 ? details.name.substring(0, 15) + "..." : details.name}'s` : "Your"} {occasion.title.length > 15 ? occasion.title.substring(0, 15) + "..." : occasion.title} Gift Box
        </h2>
        <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
          Recommended layout: <span className="font-semibold text-primary">{activeLayout.name.length > 25 ? activeLayout.name.substring(0, 25) + "..." : activeLayout.name}</span> · Match Score {activeLayout.matchScore}%
        </p>
      </div>

      <div ref={reportRef} className="bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10">
          <GiftBoxVisual products={products} ribbonHex={activeLayout.ribbon.hex} layoutId={activeLayout.id} customizations={{ ...details, occasion: occasion.id }} />
        </motion.div>

        <ReportCard layout={activeLayout} occasion={occasion} products={products} details={details} totalPrice={result.totalPrice} />
      </div>

      <LayoutComparison
        recommended={result.recommended}
        alternatives={result.alternatives}
        active={activeLayout}
        onSelect={setActiveLayout}
        products={products}
        customizations={{ ...details, occasion: occasion.id }}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-3 mt-10 max-w-sm mx-auto sm:max-w-none">
        <Button onClick={onPlaceOrderClick} className="rounded-full bg-primary hover:bg-primary/90 text-white border-0 shadow-md px-6 w-full sm:w-auto">
          <ShoppingCart className="w-4 h-4 mr-2" /> Place Gifting Order
        </Button>
        <Button onClick={onSaveLayoutClick} disabled={savingLayout} variant="outline" className="rounded-full border px-6 bg-white hover:bg-slate-50 text-slate-700 w-full sm:w-auto">
          <Bookmark className="w-4 h-4 mr-2 text-[#C5A880]" /> {savingLayout ? "Saving Layout..." : "Save Layout"}
        </Button>
        <Button onClick={onPDFClick} disabled={exporting} variant="outline" className="rounded-full border px-6 w-full sm:w-auto">
          <FileText className="w-4 h-4 mr-2" /> {exporting ? "Exporting..." : "Export Report (PDF)"}
        </Button>
        <Button variant="ghost" onClick={onSummaryClick} className="rounded-full px-6 text-muted-foreground w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" /> Download Summary
        </Button>
        <Button variant="ghost" onClick={onRestart} className="rounded-full px-6 text-muted-foreground w-full sm:w-auto">
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
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-stretch sm:items-center">
                <a href="/orders" className="w-full sm:w-auto">
                  <Button className="rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs px-5 h-10 shadow-md w-full">
                    Track Fulfillment Timeline
                  </Button>
                </a>
                <Button variant="ghost" onClick={() => { setCheckoutOpen(false); setOrderSuccess(false); onRestart(); }} className="rounded-full border hover:bg-slate-50 text-xs px-5 h-10 w-full sm:w-auto">
                  Build Another
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {/* Order price summary */}
              <div className="bg-secondary rounded-2xl p-4 border flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-500">Box Total (with wrapping):</span>
                <span className="text-primary text-base">₹{(result.totalPrice + activeLayout.box.cost).toLocaleString("en-IN")}</span>
              </div>

              {/* Payment selector */}
              <div className="space-y-3">
                <Label className="font-bold text-xs text-primary uppercase tracking-wide">Payment Method</Label>
                <div className="flex flex-col items-center gap-1.5 border border-primary/20 rounded-2xl py-4 px-4 bg-secondary/20">
                  <span className="text-sm font-extrabold text-primary">💵 Cash on Delivery (COD)</span>
                  <span className="text-[10.5px] text-muted-foreground text-center mt-1">Pay with cash when your customized luxury gift box is delivered to your doorstep.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 items-stretch sm:items-center">
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={placingOrder} 
                  className="flex-1 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold h-11 text-xs shadow-md w-full"
                >
                  {placingOrder ? "Placing Order..." : "Confirm Order"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setCheckoutOpen(false)} 
                  className="rounded-full border hover:bg-slate-50 text-xs px-4 h-11 w-full sm:w-auto"
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