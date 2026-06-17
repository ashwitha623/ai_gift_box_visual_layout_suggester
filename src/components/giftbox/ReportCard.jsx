import { Ribbon, Package, ListOrdered, Brain, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/giftdata";

export default function ReportCard({ layout, occasion, products, details, totalPrice }) {
  return (
    <div className="bg-card rounded-3xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-rosegold px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-lg font-heading">Layout Recommendation Report</h3>
          <p className="text-white/80 text-sm">{occasion.title} · {products.length} products · {formatINR(totalPrice)}</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-2 text-center">
          <div className="text-2xl font-extrabold text-white">{layout.matchScore}%</div>
          <div className="text-[10px] uppercase tracking-wider text-white/80">Match Score</div>
        </div>
      </div>

      <div className="p-6 sm:p-8 grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3"><Gift className="w-4 h-4 text-primary" /> Selected Products</h4>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-3 py-1">
                  <img src={p.image} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-medium text-secondary-foreground">{p.name}</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">{p.size[0]}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5"><Ribbon className="w-3.5 h-3.5" /> Ribbon Color</div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-white shadow" style={{ background: layout.ribbon.hex }} />
                <span className="font-semibold text-sm">{layout.ribbon.color}</span>
              </div>
            </div>
            <div className="bg-muted rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5"><Package className="w-3.5 h-3.5" /> Layout Style</div>
              <span className="font-semibold text-sm">{layout.name}</span>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5"><Package className="w-3.5 h-3.5" /> Packaging Style</div>
            <p className="text-sm font-medium text-foreground">{layout.packaging}</p>
          </div>

          {details.message && (
            <div className="bg-secondary rounded-2xl p-4 border-l-4 border-primary">
              <p className="text-xs text-muted-foreground mb-1">Message Card</p>
              <p className="text-sm italic text-secondary-foreground">"{details.message}"</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3"><ListOrdered className="w-4 h-4 text-primary" /> Arrangement Instructions</h4>
            <ol className="space-y-2.5">
              {layout.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gradient-to-br from-secondary to-accent/40 rounded-2xl p-5">
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2"><Brain className="w-4 h-4 text-primary" /> AI Explanation</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{layout.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}