import { Crown, Sparkles, Shield, Heart, Percent, Layout } from "lucide-react";
import GiftBoxVisual from "@/components/giftbox/GiftBoxVisual";

export default function LayoutComparison({ recommended, alternatives, active, onSelect, products, customizations }) {
  // Combine recommended and alternatives to get all 5 layouts
  const allLayouts = [recommended, ...alternatives];

  return (
    <div className="mt-12 bg-slate-50/50 rounded-[32px] p-6 sm:p-8 border border-border/80 shadow-inner">
      <div className="flex items-center gap-2 mb-2">
        <Layout className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold font-heading text-primary tracking-tight">Compare AI Packaging Layouts</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-6 max-w-xl leading-relaxed">
        The AI optimizer evaluated all five distinct packaging heuristics. Select any option to view its full interactive 3D/2D projection preview.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {allLayouts.map((layout) => {
          const isRecommended = layout.id === recommended.id;
          const isActive = layout.id === active.id;

          return (
            <div
              key={layout.id}
              onClick={() => onSelect(layout)}
              className={`group relative flex flex-col justify-between rounded-3xl cursor-pointer p-4 transition-all duration-300 border bg-white ${
                isActive 
                  ? "ring-2 ring-primary border-primary shadow-xl shadow-primary/10 -translate-y-1" 
                  : "border-border/80 shadow-md hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5"
              } ${isRecommended ? "md:col-span-1 border-amber-300 bg-amber-50/5" : ""}`}
            >
              <div>
                {/* AI Recommended Badge */}
                {isRecommended && (
                  <div className="absolute -top-3.5 left-4 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-[#D4AF37] text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md animate-pulse">
                    <Crown className="w-3 h-3 text-white" /> AI Recommended Layout
                  </div>
                )}

                {/* Micro Thumbnail Visual Box */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center p-3 mb-4 aspect-square border border-border/50 shadow-inner group-hover:bg-slate-50 transition-colors">
                  <div className="scale-[0.52] sm:scale-[0.62] origin-center absolute pointer-events-none w-[160%] h-[160%]">
                    <GiftBoxVisual
                      products={products}
                      ribbonHex={layout.ribbon.hex}
                      layoutId={layout.id}
                      size="sm"
                      customizations={customizations}
                    />
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-primary group-hover:text-accent transition-colors flex items-center gap-1">
                    {layout.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                    {layout.description}
                  </p>
                </div>

                {/* Detailed Packing Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[10px] font-medium text-slate-500">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Box Style</span>
                    <span className="text-slate-800 font-bold truncate text-[9px]">{layout.box.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Box Size</span>
                    <span className="text-slate-800 font-bold text-[9px]">{layout.box.length}×{layout.box.width}cm</span>
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Space Util</span>
                    <span className="text-slate-800 font-extrabold text-[9px]">{layout.scores.spaceUtil}%</span>
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Safety Rating</span>
                    <span className="text-slate-800 font-extrabold text-[9px]">{layout.scores.safety}%</span>
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Aesthetic</span>
                    <span className="text-slate-800 font-extrabold text-[9px]">{layout.scores.aesthetic}%</span>
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Cost Score</span>
                    <span className="text-slate-800 font-extrabold text-[9px]">{layout.scores.costScore}%</span>
                  </div>
                </div>
              </div>

              {/* Bottom score and recommended explanation */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Match Score</span>
                  <span className="text-sm font-black text-primary">{layout.matchScore}%</span>
                </div>

                {isRecommended && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[9px] text-amber-800 leading-normal font-semibold">
                    ⭐ Recommended because it provides the best balance of aesthetics, product safety, space utilization, packaging cost, and occasion compatibility.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}