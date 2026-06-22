import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShoppingBag, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, CATEGORIES, CATEGORY_FALLBACKS, formatINR } from "@/lib/giftdata";

const SIZE_COLOR = {
  Small:  "bg-sky-50 text-sky-700 border-sky-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Large:  "bg-rose-50 text-rose-700 border-rose-200",
};

export default function ProductStep({ selected, onToggle }) {
  const [category, setCategory] = useState("All");
  const filtered = category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
  const total = selected.reduce((s, p) => s + p.price, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">Choose Your Products</h2>
          <p className="text-muted-foreground mt-1 text-sm">Select 2–8 gifts. The AI arranges them by size and category.</p>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
          selected.length >= 2 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground"
        }`}>
          <ShoppingBag className="w-4 h-4" />
          {selected.length} selected · {formatINR(total)}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto py-3 mb-5 -mx-1 px-1 scrollbar-none">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
              category === c
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-white text-muted-foreground hover:bg-secondary border border-border hover:border-primary/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        {filtered.map((p, i) => {
          const isSelected = selected.some((s) => s.id === p.id);
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: Math.min(i * 0.025, 0.35), type: "spring", stiffness: 280, damping: 22 }}
              onClick={() => onToggle(p)}
              className={`group relative text-left rounded-2xl overflow-hidden bg-card transition-all duration-250 ${
                isSelected
                  ? "ring-[2.5px] ring-primary shadow-xl shadow-primary/20 scale-[1.02]"
                  : "shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]"
              }`}
            >
              {/* Product image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  onError={(e) => { e.currentTarget.src = CATEGORY_FALLBACKS[p.category] || CATEGORY_FALLBACKS["Lifestyle Gifts"]; }}
                />

                {/* Size badge */}
                <Badge className={`absolute top-2 left-2 text-[10px] font-semibold border ${SIZE_COLOR[p.size]} shadow-sm`}>
                  {p.size}
                </Badge>

                {/* Selected overlay */}
                {isSelected ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40">
                      <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
                    <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-3">
                <p className="font-semibold text-sm text-foreground truncate leading-tight">{p.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-muted-foreground truncate pr-1">{p.category}</span>
                  <span className="text-sm font-bold text-primary flex-shrink-0">{formatINR(p.price)}</span>
                </div>
              </div>

              {/* Selected bottom accent */}
              {isSelected && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary to-rosegold" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}