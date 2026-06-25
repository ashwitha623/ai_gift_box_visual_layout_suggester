import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Sparkles, RefreshCw, ShoppingCart, CheckCircle, ShieldCheck, Bookmark, ArrowLeft, ShieldAlert } from "lucide-react";
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

export default function ResultStep({ result, occasion, products, details, onRestart, onBack, boxTemplates, layoutTemplates }) {
  const [activeLayout, setActiveLayout] = useState(result.recommended || null);
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

  const handleItemsChange = (newItems) => {
    setActiveLayout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: newItems
      };
    });
  };

  // Volumetric Shipping Calculations
  const boxTemplate = activeLayout?.box;
  const boxLength = boxTemplate?.length || 30;
  const boxWidth = boxTemplate?.width || 20;
  const boxHeight = boxTemplate?.height || 12;

  const volumetricWeight = Math.round((boxLength * boxWidth * boxHeight) / 5);
  const productsWeight = products.reduce((sum, p) => sum + (p.weight || 150), 0);
  const actualWeight = productsWeight + 250; // tare weight of luxury box
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  let shippingCost = 150;
  if (chargeableWeight > 500) {
    shippingCost += Math.ceil((chargeableWeight - 500) / 500) * 80;
  }

  const boxTotal = result.totalPrice + (activeLayout?.box?.cost || 300);
  const grandTotal = boxTotal + shippingCost;

  if (result.success === false || result.error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4 bg-white border border-rose-100 rounded-3xl shadow-xl shadow-rose-950/5">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold font-heading text-primary">Packing Optimization Failed</h3>
        <p className="text-slate-600 text-sm mt-3 max-w-md mx-auto leading-relaxed">
          {result.error || "Selected products exceed available box capacities. Please reduce items or create a larger box configuration."}
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button onClick={onBack} className="rounded-full border hover:bg-slate-50 text-xs px-6 h-10 font-bold bg-white text-slate-700">
            Modify Products
          </Button>
          <Button onClick={onRestart} className="rounded-full bg-primary hover:bg-primary/95 text-white text-xs px-6 h-10 font-bold shadow-md">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

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
        totalPrice: grandTotal, // Volumetric shipping inclusive price
        ribbonColor: activeLayout.ribbon.color,
        boxSize: activeLayout.box.name,
        recipientName: details.name,
        recipientPhone: details.phone,
        message: `${details.message || ""} ||occasion:${occasion.id} ||layout:${activeLayout.id}`.trim(),
        customText: details.customText,
        photoUrl: details.photoUrl,
        logoUrl: details.logoUrl,
        paymentMethod,
        spaceUtil: activeLayout.scores.spaceUtil,
        packingEfficiency: activeLayout.scores.efficiency
      });

      if (res.data.success) {
        setTrackingId(res.data.trackingId);
        setOrderSuccess(true);
        // Refresh notifications count instantly
        window.dispatchEvent(new Event("refresh-notifications"));
        toast({
          title: "Order Placed Successfully! 🎉",
          description: "A design layout draft has been published to your Design Approval Center.",
        });
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
          <GiftBoxVisual products={products} ribbonHex={activeLayout.ribbon.hex} layoutId={activeLayout.id} customizations={{ ...details, occasion: occasion.id, onItemsChange: handleItemsChange }} boxTemplates={boxTemplates} layoutTemplates={layoutTemplates} />
        </motion.div>

        <ReportCard layout={activeLayout} occasion={occasion} products={products} details={details} totalPrice={result.totalPrice} />
      </div>

      <LayoutComparison
        recommended={result.recommended}
        alternatives={result.alternatives}
        active={activeLayout}
        onSelect={setActiveLayout}
        products={products}
        customizations={{ ...details, occasion: occasion.id, boxTemplates, layoutTemplates }}
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
        <Button variant="ghost" onClick={onBack} className="rounded-full px-6 text-muted-foreground w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Details
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
              <div className="bg-secondary rounded-2xl p-5 border border-slate-200/60 space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Gift Box & Products:</span>
                  <span className="text-slate-800">₹{boxTotal.toLocaleString("en-IN")}</span>
                </div>
                
                <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Package Dimensions:</span>
                    <span className="font-mono">{boxLength}x{boxWidth}x{boxHeight} cm</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Actual Package Weight:</span>
                    <span>{actualWeight} g</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Volumetric Weight (V = L×W×H/5):</span>
                    <span>{volumetricWeight} g</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                    <span>Chargeable Weight:</span>
                    <span className="text-primary">{chargeableWeight} g</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Volumetric Shipping Fee:</span>
                  <span className="text-emerald-600 font-bold">₹{shippingCost}</span>
                </div>

                <div className="border-t border-slate-300 pt-3 flex justify-between items-center text-sm font-bold text-primary">
                  <span>Grand Total (All Inclusive):</span>
                  <span className="text-lg">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
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