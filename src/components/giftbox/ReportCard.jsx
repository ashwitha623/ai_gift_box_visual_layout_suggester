import { Ribbon, Package, ListOrdered, Brain, Gift, ShieldAlert, Cpu, Maximize2, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function PackingBlueprint({ layout, products }) {
  const box = layout.box;
  const items = layout.items || [];
  
  // Scale units by 10 for SVG coordinate system readability
  const scale = 10;
  const svgW = box.length * scale;
  const svgH = box.width * scale;
  const borderMargin = 1.2 * scale; // Standard margin boundary

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden mt-6">
      {/* Decorative Blueprint Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1524_1px,transparent_1px),linear-gradient(to_bottom,#0c1524_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

      <div className="relative flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-accent" />
          <div>
            <h4 className="font-extrabold text-sm tracking-tight text-white font-heading">2D Packing Optimizer Blueprint</h4>
            <p className="text-[10px] text-slate-400">Top-down schematic view with physical centimeter coordinates</p>
          </div>
        </div>
        <Badge className="bg-sky-500/15 border border-sky-400/35 text-sky-400 text-[9px] hover:bg-sky-500/10">
          Scale 1:10 (cm × 10)
        </Badge>
      </div>

      {/* SVG Blueprint Canvas */}
      <div className="flex items-center justify-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800/60 shadow-inner">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full max-w-lg aspect-auto h-auto rounded-lg overflow-hidden border border-sky-500/30 bg-[#070b13] shadow-md shadow-sky-950/20"
        >
          {/* Blueprint Grid Lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0f172a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Box Outer Bounds */}
          <rect
            x="0"
            y="0"
            width={svgW}
            height={svgH}
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeDasharray="none"
          />

          {/* Wall Safety Margin line */}
          <rect
            x={borderMargin}
            y={borderMargin}
            width={svgW - borderMargin * 2}
            height={svgH - borderMargin * 2}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Render Products */}
          {items.map((item, idx) => {
            const ix = item.x * scale;
            const iy = item.y * scale;
            const iw = item.w * scale;
            const ih = item.h * scale;
            
            // Draw safety buffer zone for fragile items (2.0cm buffer)
            const isFragile = item.product.fragile;
            const buffer = isFragile ? 1.0 * scale : 0.3 * scale;

            return (
              <g key={item.product.id} className="group cursor-pointer">
                {/* Safety Envelope Zone (Dashed background) */}
                <rect
                  x={ix - buffer}
                  y={iy - buffer}
                  width={iw + buffer * 2}
                  height={ih + buffer * 2}
                  fill="none"
                  stroke={isFragile ? "#f59e0b" : "#475569"}
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                  opacity="0.4"
                />

                {/* Main Product Rect */}
                <rect
                  x={ix}
                  y={iy}
                  width={iw}
                  height={ih}
                  rx="4"
                  ry="4"
                  fill={isFragile ? "rgba(239, 68, 68, 0.08)" : "rgba(14, 165, 233, 0.06)"}
                  stroke={isFragile ? "#ef4444" : "#0ea5e9"}
                  strokeWidth="1.6"
                />

                {/* Inner Cross lines for Fragile item visualization */}
                {isFragile && (
                  <path
                    d={`M ${ix} ${iy} L ${ix + iw} ${iy + ih} M ${ix + iw} ${iy} L ${ix} ${iy + ih}`}
                    stroke="#ef4444"
                    strokeWidth="0.5"
                    opacity="0.25"
                  />
                )}

                {/* Product Name Label */}
                <text
                  x={ix + iw / 2}
                  y={iy + ih / 2 - 2.5}
                  textAnchor="middle"
                  fill="#f8fafc"
                  className="font-sans font-bold select-none text-[8.5px]"
                  style={{ fontSize: "7px" }}
                >
                  {item.product.name.substring(0, 16)}
                </text>

                {/* Coordinate Specs */}
                <text
                  x={ix + iw / 2}
                  y={iy + ih / 2 + 5.5}
                  textAnchor="middle"
                  fill={isFragile ? "#fca5a5" : "#7dd3fc"}
                  className="font-mono select-none"
                  style={{ fontSize: "5.5px" }}
                >
                  {`x:${item.x.toFixed(1)} y:${item.y.toFixed(1)} cm`}
                </text>

                {/* Dimension label */}
                <text
                  x={ix + iw / 2}
                  y={iy + ih / 2 + 11.5}
                  textAnchor="middle"
                  fill="#94a3b8"
                  className="font-mono select-none"
                  style={{ fontSize: "5px" }}
                >
                  {`${item.w.toFixed(1)}×${item.h.toFixed(1)} cm`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Blueprint Legend Map */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-[10px] text-slate-400 border-t border-slate-900 pt-4 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded border border-sky-500 bg-sky-500/10 flex-shrink-0" />
          <span>Regular Product</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded border border-rose-500 bg-rose-500/10 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#ef4444_10%,transparent_10%)] bg-[size:4px_4px]" />
          </div>
          <span>Fragile Product (Alert)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 border border-dashed border-amber-500/50 flex-shrink-0" />
          <span>Safety Buffer Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 border border-dotted border-slate-700 flex-shrink-0" />
          <span>Box Wall Margin</span>
        </div>
      </div>
    </div>
  );
}

export default function ReportCard({ layout, occasion, products, details, totalPrice }) {
  const box = layout.box;

  // Calculate volume capacities
  const boxVolume = box.capacity;
  const usedSpaceVolume = products.reduce((s, p) => s + (p.length * p.width * p.height), 0);
  const remainingSpaceVolume = Math.max(0, boxVolume - usedSpaceVolume);
  const spaceUtilPercent = layout.scores.spaceUtil;

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
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="text-center p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Layout Efficiency</span>
              <span className="text-base font-black text-primary block mt-1">{layout.scores.efficiency}%</span>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Space Utilized</span>
              <span className="text-base font-black text-primary block mt-1">{layout.scores.spaceUtil}%</span>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Aesthetic Score</span>
              <span className="text-base font-black text-primary block mt-1">{layout.scores.aesthetic}%</span>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Product Safety</span>
              <span className="text-base font-black text-primary block mt-1">{layout.scores.safety}%</span>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Occasion Match</span>
              <span className="text-base font-black text-primary block mt-1">{layout.scores.occasionMatch}%</span>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Packaging Cost</span>
              <span className="text-base font-black text-primary block mt-1">{layout.scores.costScore}%</span>
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
                  <span className="font-semibold text-muted-foreground">Box Dimensions (L x W x H):</span>
                  <span className="font-bold text-slate-700">{box.length} × {box.width} × {box.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Volume Capacity:</span>
                  <span className="font-bold text-slate-700">{box.capacity.toLocaleString()} cm³</span>
                </div>
                <div className="border-t border-border/60 pt-2.5 flex justify-between">
                  <span className="font-semibold text-muted-foreground">Used Space Volume:</span>
                  <span className="font-bold text-emerald-600">{usedSpaceVolume.toLocaleString()} cm³ ({spaceUtilPercent}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Remaining Space Volume:</span>
                  <span className="font-bold text-slate-500">{remainingSpaceVolume.toLocaleString()} cm³ ({100 - spaceUtilPercent}%)</span>
                </div>
              </div>
            </div>

            {/* List of products with dimensions */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-xs text-primary uppercase tracking-wider mb-3">
                <Gift className="w-4 h-4 text-accent" /> Product Details & Dimensions
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-secondary/35 rounded-xl px-3 py-2 border border-border/50 text-xs">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-6 h-6 rounded-full object-cover border" />
                      <span className="font-bold text-primary">{p.name}</span>
                      {p.fragile ? (
                        <Badge className="bg-rose-50 border border-rose-200 text-rose-600 text-[8px] px-1 py-0 hover:bg-rose-50 font-black">
                          FRAGILE
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-50 border border-slate-200 text-slate-500 text-[8px] px-1 py-0 hover:bg-slate-50 font-bold">
                          NON-FRAGILE
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-500 font-medium font-mono text-[10px]">
                      {p.length} × {p.width} × {p.height} cm · {p.weight}g
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
          <div className="space-y-6 flex flex-col justify-between">
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
                  <Brain className="w-4 h-4 text-accent" /> AI Layout Description
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{layout.explanation}</p>
              </div>
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

        {/* 2D Packing Blueprint Visualization Section */}
        <PackingBlueprint layout={layout} products={products} />
      </div>
    </div>
  );
}