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
  const [details, setDetails] = useState({
    name: "",
    senderName: "",
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
    details.deliveryDate?.trim()
  );

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
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? "bg-primary text-white" : i === step ? "bg-gradient-to-r from-primary to-rosegold text-white shadow-md shadow-primary/30 scale-110" : "bg-muted text-muted-foreground"
              }`}>{i + 1}</div>
              <span className={`hidden sm:block text-sm font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-6 sm:w-12 h-0.5 rounded ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
          {step === 0 && <OccasionStep selected={occasion} onSelect={setOccasion} />}
          {step === 1 && <ProductStep selected={products} onToggle={toggleProduct} />}
          {step === 2 && <RecipientStep details={details} onChange={setDetails} selectedTotal={selectedTotal} />}
          {step === 3 && (generating || !result ? (
            <div className="text-center py-24">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-rosegold opacity-20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-primary to-rosegold flex items-center justify-center shadow-lg shadow-primary/30">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold font-heading text-foreground">Analyzing your gift box...</h2>
              <p className="text-muted-foreground mt-2 text-sm">Evaluating layout styles, product sizes, occasion mood and budget fit.</p>
              <Loader2 className="w-5 h-5 mx-auto mt-5 text-primary animate-spin" />
            </div>
          ) : (
            <ResultStep result={result} occasion={occasion} products={products} details={details} onRestart={restart} />
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