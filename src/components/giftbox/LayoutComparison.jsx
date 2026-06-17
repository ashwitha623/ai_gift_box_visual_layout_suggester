import { Crown } from "lucide-react";
import GiftBoxVisual from "@/components/giftbox/GiftBoxVisual";

export default function LayoutComparison({ recommended, alternatives, active, onSelect, products, customizations }) {
  const all = [recommended, ...alternatives];
  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold font-heading text-foreground mb-1">Compare Layouts</h3>
      <p className="text-sm text-muted-foreground mb-6">The AI evaluated all styles — click any option to preview it.</p>
      <div className="grid sm:grid-cols-3 gap-5">
        {all.map((layout) => {
          const isRecommended = layout.id === recommended.id;
          const isActive = layout.id === active.id;
          return (
            <button
              key={layout.id}
              onClick={() => onSelect(layout)}
              className={`relative text-left rounded-2xl bg-card p-4 transition-all duration-300 ${
                isActive ? "ring-2 ring-primary shadow-xl shadow-primary/15" : "shadow-md hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-4 z-10 flex items-center gap-1 bg-gradient-to-r from-primary to-rosegold text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow">
                  <Crown className="w-3 h-3" /> Recommended
                </div>
              )}
              <div className="scale-90 origin-top pointer-events-none">
                <GiftBoxVisual products={products} ribbonHex={layout.ribbon.hex} layoutId={layout.id} size="sm" customizations={customizations} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="font-semibold text-sm text-foreground">{layout.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{layout.description}</p>
                </div>
                <div className="flex-shrink-0 ml-3 text-center">
                  <div className="text-lg font-extrabold text-primary">{layout.matchScore}%</div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Match</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}