import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OccasionStep from "@/components/builder/OccasionStep";
import ProductStep from "@/components/builder/ProductStep";
import RecipientStep from "@/components/builder/RecipientStep";
import ResultStep from "@/components/builder/ResultStep";
import { generateRecommendations } from "@/lib/layoutEngine";

const STEPS = ["Occasion", "Products", "Details", "AI Layout"];

export default function CreateBox() {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState(null);
  const [products, setProducts] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [dbBoxes, setDbBoxes] = useState([]);
  const [dbLayoutTemplates, setDbLayoutTemplates] = useState([]);
  const [details, setDetails] = useState({
    name: "",
    senderName: "",
    phone: "",
    message: "",
    customText: "",
    deliveryAddress: "",
    deliveryDate: "",
    photoUrl: "",
    logoUrl: "",
    budget: 5000,
    boxSize: "Medium"
  });
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Fetch products and boxes from API on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setCatalogLoading(true);
        const res = await axios.get("http://localhost:5000/api/inventory");
        if (res.data) {
          if (res.data.products) {
            setDbProducts(res.data.products);
          }
          if (res.data.boxes) {
            setDbBoxes(res.data.boxes);
          }
          if (res.data.layoutTemplates) {
            setDbLayoutTemplates(res.data.layoutTemplates);
          }
        }
      } catch (e) {
        console.error("Failed to load inventory from API", e);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("paperplane_builder_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.occasion) setOccasion(parsed.occasion);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.details) setDetails(parsed.details);
        if (parsed.result) setResult(parsed.result);
        if (parsed.step !== undefined) setStep(parsed.step);
      } catch (e) {
        console.error("Failed to restore builder state", e);
      }
    }
  }, []);

  // Persist state to sessionStorage on changes
  useEffect(() => {
    if (step > 0 || products.length > 0 || details.name) {
      sessionStorage.setItem("paperplane_builder_state", JSON.stringify({
        occasion,
        products,
        details,
        result,
        step
      }));
    }
  }, [occasion, products, details, result, step]);

  const toggleProduct = (p) =>
    setProducts((prev) => (prev.some((s) => s.id === p.id) ? prev.filter((s) => s.id !== p.id) : prev.length < 8 ? [...prev, p] : prev));

  const isDetailsValid = !!(
    details.name?.trim() &&
    details.senderName?.trim() &&
    details.message?.trim() &&
    details.deliveryAddress?.trim() &&
    details.deliveryDate?.trim() &&
    details.phone?.trim() &&
    /^\d{10}$/.test(details.phone.trim())
  );

  const isStepAccessible = (targetStep) => {
    if (targetStep === 0) return true;
    if (targetStep === 1) return !!occasion;
    if (targetStep === 2) return products.length >= 2;
    if (targetStep === 3) return isDetailsValid;
    return false;
  };

  const canNext = step === 0 ? !!occasion : step === 1 ? products.length >= 2 : isDetailsValid;
  const selectedTotal = products.reduce((s, p) => s + p.price, 0);

  const handleGenerate = async () => {
    setGenerating(true);
    setStep(3);

    setTimeout(() => {
      const generatedResult = generateRecommendations({
        occasion: occasion.id,
        occasionTitle: occasion.title,
        products,
        budget: details.budget,
        boxSize: details.boxSize,
        boxTemplates: dbBoxes,
        layoutTemplates: dbLayoutTemplates
      });

      setResult(generatedResult);
      setGenerating(false);
    }, 2200);
  };

  const restart = () => {
    sessionStorage.removeItem("paperplane_builder_state");
    setStep(0); setOccasion(null); setProducts([]); setResult(null);
    setDetails({
      name: "",
      senderName: "",
      phone: "",
      message: "",
      customText: "",
      deliveryAddress: "",
      deliveryDate: "",
      photoUrl: "",
      logoUrl: "",
      budget: 5000,
      boxSize: "Medium"
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
        {STEPS.map((label, i) => {
          const accessible = isStepAccessible(i) && !generating;
          return (
            <div key={label} className="flex items-center gap-2 sm:gap-4">
              <div 
                onClick={() => accessible && setStep(i)}
                className={`flex items-center gap-2 transition-all ${accessible ? "cursor-pointer hover:opacity-80" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? "bg-primary text-white" : i === step ? "bg-gradient-to-r from-primary to-rosegold text-white shadow-md shadow-primary/30 scale-110" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <span className={`hidden sm:block text-sm font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 sm:w-12 h-0.5 rounded ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
          {step === 0 && <OccasionStep selected={occasion} onSelect={setOccasion} />}
          {step === 1 && <ProductStep selected={products} onToggle={toggleProduct} allProducts={dbProducts} loading={catalogLoading} />}
          {step === 2 && <RecipientStep details={details} onChange={setDetails} selectedTotal={selectedTotal} />}
          {step === 3 && (generating || !result ? (
            <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8 py-12 px-4 items-center">
              {/* Spinner & Message */}
              <div className="md:col-span-5 text-center md:text-left space-y-6">
                <div className="relative w-20 h-20 mx-auto md:mx-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-primary">Analyzing your gift box...</h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    Our packing optimization engine is evaluating box sizing constraints, product fragile buffers, and nesting aesthetic arrangements.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-accent justify-center md:justify-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce" />
                  <span>PACKING OPTIMIZER IN PROGRESS...</span>
                </div>
              </div>

              {/* Layout Pre-render Skeleton Preview */}
              <div className="md:col-span-7 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-md space-y-6 animate-pulse">
                {/* Visualizer box skeleton */}
                <div className="aspect-[4/3] w-full bg-slate-100/70 rounded-2xl border border-dashed border-slate-200/60 flex items-center justify-center relative p-8">
                  {/* Outer Ribbon line skeleton */}
                  <div className="absolute inset-y-0 left-1/4 w-4 bg-slate-200/40" />
                  <div className="absolute inset-x-0 top-1/3 h-4 bg-slate-200/40" />
                  
                  {/* Silhouettes of products inside box */}
                  <div className="grid grid-cols-2 gap-4 w-full h-full relative z-10 p-4">
                    <div className="bg-slate-200/50 rounded-xl flex items-center justify-center text-slate-400/80">🎁</div>
                    <div className="bg-slate-200/50 rounded-xl flex items-center justify-center text-slate-400/80">🎁</div>
                    <div className="bg-slate-200/50 rounded-xl flex items-center justify-center text-slate-400/80">🎁</div>
                    <div className="bg-slate-200/50 rounded-xl flex items-center justify-center text-slate-400/80">🎁</div>
                  </div>
                </div>

                {/* Score bar skeletons */}
                <div className="space-y-3">
                  <div className="h-4 w-1/4 bg-slate-200/60 rounded-md" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 bg-slate-100/50 rounded-xl border border-dashed border-slate-200/40" />
                    <div className="h-10 bg-slate-100/50 rounded-xl border border-dashed border-slate-200/40" />
                    <div className="h-10 bg-slate-100/50 rounded-xl border border-dashed border-slate-200/40" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ResultStep result={result} occasion={occasion} products={products} details={details} onRestart={restart} onBack={() => setStep(2)} boxTemplates={dbBoxes} layoutTemplates={dbLayoutTemplates} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      {step < 3 && (
        <div className="flex justify-between mt-12 max-w-xl mx-auto">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="rounded-full bg-gradient-to-r from-primary to-rosegold text-white border-0 shadow-md shadow-primary/25 px-6">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleGenerate} disabled={!canNext} className="rounded-full bg-gradient-to-r from-primary to-rosegold text-white border-0 shadow-md shadow-primary/25 px-6">
              <Sparkles className="w-4 h-4 mr-2" /> Generate AI Layout
            </Button>
          )}
        </div>
      )}
      {step === 1 && products.length < 2 && (
        <p className="text-center text-xs text-muted-foreground mt-3">Select at least 2 products to continue.</p>
      )}
      {step === 2 && !isDetailsValid && (
        <p className="text-center text-xs text-rose-600 font-semibold mt-3 animate-pulse">
          * Please fill out all required fields marked with * to proceed.
        </p>
      )}
    </div>
  );
}