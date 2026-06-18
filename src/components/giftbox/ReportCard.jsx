import { Ribbon, Package, ListOrdered, Brain, Gift, ShieldAlert, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/giftdata";

export default function ReportCard({ layout, occasion, products, details, totalPrice }) {
  const box = layout.box;
  
  // Calculate volumes
  const boxVolume = box.capacity;
  const usedSpaceVolume = products.reduce((s, p) => s + (p.length * p.width * p.height), 0);
  const remainingSpaceVolume = Math.max(0, boxVolume - usedSpaceVolume);

  return (
    <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border mt-8">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-rosegold px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-extrabold text-lg font-heading tracking-tight">AI Gifting Optimization Report</h3>
          <p className="text-white/80 text-xs mt-1">
            {occasion.title} Occasion · {products.length} Items Packed · Box Wrapping Cost Included
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-2 text-center border border-white/10">
          <div className="text-2xl font-black text-white">{layout.matchScore}%</div>
          <div className="text-[9px] uppercase tracking-widest text-white/80 font-bold">Match Score</div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Dynamic AI Layout Scoring Grid */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-bold text-xs text-primary uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-accent" /> AI Layout Optimizer Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Layout Efficiency</span>
              <span className="text-lg font-black text-primary block mt-1">{layout.scores.efficiency}%</span>
            </div>
            <div className="text-center p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Space Utilized</span>
              <span className="text-lg font-black text-primary block mt-1">{layout.scores.spaceUtil}%</span>
            </div>
            <div className="text-center p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Aesthetic Score</span>
              <span className="text-lg font-black text-primary block mt-1">{layout.scores.aesthetic}%</span>
            </div>
            <div className="text-center p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Product Safety</span>
              <span className="text-lg font-black text-primary block mt-1">{layout.scores.safety}%</span>
            </div>
            <div className="text-center p-3.5 bg-secondary/50 rounded-2xl border border-border/60 col-span-2 sm:col-span-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Occasion Match</span>
              <span className="text-lg font-black text-primary block mt-1">{layout.scores.occasionMatch}%</span>
            </div>
          </div>
        </div>

        {/* Outer Split Columns */}
        <div className="grid md:grid-cols-2 gap-8 pt-2">
          {/* Column 1: Box Dimensions and Product Dimensions */}
          <div className="space-y-6">
            {/* Box template selection */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-xs text-primary uppercase tracking-wider mb-3">
                <Package className="w-4 h-4 text-accent" /> Selected Box Specifications
              </h4>
              <div className="bg-secondary/40 rounded-2xl p-4 border space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Recommended Box:</span>
                  <span className="font-bold text-primary">{box.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Box Style:</span>
                  <span className="font-medium text-slate-700">{box.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Dimensions (L x W x H):</span>
                  <span className="font-bold text-slate-700">{box.length} x {box.width} x {box.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Volume Capacity:</span>
                  <span className="font-bold text-slate-700">{box.capacity.toLocaleString()} cm³</span>
                </div>
                <div className="border-t border-border/60 pt-2.5 flex justify-between">
                  <span className="font-semibold text-muted-foreground">Space Used:</span>
                  <span className="font-bold text-emerald-600">{usedSpaceVolume.toLocaleString()} cm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Remaining Space:</span>
                  <span className="font-bold text-slate-500">{remainingSpaceVolume.toLocaleString()} cm³</span>
                </div>
              </div>
            </div>

            {/* List of products with dimensions */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-xs text-primary uppercase tracking-wider mb-3">
                <Gift className="w-4 h-4 text-accent" /> Product Dimensions List
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-secondary/35 rounded-xl px-3 py-2 border border-border/50 text-xs">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-6 h-6 rounded-full object-cover border" />
                      <span className="font-bold text-primary">{p.name}</span>
                      {p.fragile && (
                        <Badge className="bg-rose-50 border border-rose-200 text-rose-600 text-[8px] px-1 py-0 hover:bg-rose-50 font-black">
                          FRAGILE
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-500 font-medium font-mono text-[10px]">
                      {p.length}x{p.width}x{p.height}cm · {p.weight}g
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ribbon & theme matches */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/40 rounded-2xl p-4 border border-border/70">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Ribbon className="w-3.5 h-3.5 text-accent" /> Ribbon Accent
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0" style={{ background: layout.ribbon.hex }} />
                  <span className="font-bold text-primary text-xs">{layout.ribbon.color}</span>
                </div>
              </div>
              <div className="bg-secondary/40 rounded-2xl p-4 border border-border/70">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Package className="w-3.5 h-3.5 text-accent" /> Packaging Theme
                </div>
                <span className="font-bold text-primary text-xs">{box.packagingTheme}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Arrangement Instructions and Explanation */}
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-2 font-bold text-xs text-primary uppercase tracking-wider mb-3">
                <ListOrdered className="w-4 h-4 text-accent" /> AI Packing Instructions
              </h4>
              <ol className="space-y-2.5">
                {layout.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-gradient-to-br from-secondary/80 to-accent/40 rounded-3xl p-5 border border-border/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-full blur-xl pointer-events-none" />
              <h4 className="flex items-center gap-2 font-bold text-xs text-primary uppercase tracking-wider mb-2">
                <Brain className="w-4 h-4 text-accent" /> AI Recommendation Rationale
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{layout.explanation}</p>
            </div>

            {/* Safety alert notice if fragile items exist */}
            {products.some(p => p.fragile) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs text-amber-800">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Fragile Spacer Guidelines Engaged</p>
                  <p className="text-[11px] text-amber-700/95 mt-0.5 leading-relaxed">
                    Safety buffer zones have been placed around glass and ceramic items. Empty pockets are locked using crinkle filler shreds to prevent shifting in transit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}