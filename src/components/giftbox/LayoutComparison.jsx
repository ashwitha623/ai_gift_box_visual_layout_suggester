import { useState, useMemo } from "react";
import { Crown, Layout, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import GiftBoxVisual from "@/components/giftbox/GiftBoxVisual";

export default function LayoutComparison({ recommended, alternatives, active, onSelect, products, customizations }) {
  // Combine recommended and alternatives to get all 5 layouts
  const allLayouts = useMemo(() => [recommended, ...alternatives], [recommended, alternatives]);

  // State for filtering and sorting
  const [filter, setFilter] = useState("all"); // "all", "aesthetic", "space", "safety"
  const [sortBy, setSortBy] = useState("matchScore"); // "matchScore", "aesthetic", "safety"

  // Process sorting and filtering dynamically
  const sortedLayouts = useMemo(() => {
    let list = [...allLayouts];
    
    // 1. Handle filters (which also apply auto-sorting for the selected criteria)
    if (filter === "aesthetic") {
      list.sort((a, b) => b.scores.aesthetic - a.scores.aesthetic);
    } else if (filter === "space") {
      list.sort((a, b) => b.scores.spaceUtil - a.scores.spaceUtil);
    } else if (filter === "safety") {
      list.sort((a, b) => b.scores.safety - a.scores.safety);
    } else {
      // 2. Handle sorting dropdown selection
      if (sortBy === "aesthetic") {
        list.sort((a, b) => b.scores.aesthetic - a.scores.aesthetic);
      } else if (sortBy === "safety") {
        list.sort((a, b) => b.scores.safety - a.scores.safety);
      } else {
        list.sort((a, b) => b.matchScore - a.matchScore);
      }
    }
    return list;
  }, [allLayouts, filter, sortBy]);

  return (
    <div className="mt-12 bg-transparent rounded-[32px] p-2">
      {/* Header section with Filter Tabs and Sorting Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-slate-800" />
          <h3 className="text-lg font-bold font-heading text-slate-800 tracking-tight">Compare AI Packaging Layouts</h3>
        </div>

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
            {[
              { id: "all", label: "All Layouts" },
              { id: "aesthetic", label: "Aesthetic" },
              { id: "space", label: "Space Efficient" },
              { id: "safety", label: "Safe Shipping" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
                  filter === tab.id
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white text-slate-700 text-[11px] font-semibold pl-3.5 pr-8 py-2 rounded-xl border border-slate-200/80 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="matchScore">Sort by: Match Score</option>
              <option value="aesthetic">Sort by: Aesthetic</option>
              <option value="safety">Sort by: Safety</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main carousel layout container with navigation arrows */}
      <div className="relative flex items-center w-full">
        {/* Left Arrow Button */}
        <button className="absolute -left-4 z-20 bg-white border border-slate-200/80 rounded-full p-2 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all text-slate-500 hover:text-slate-800 focus:outline-none hidden md:flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Layout Cards Grid */}
        <div className="grid gap-5 w-full overflow-hidden px-1 py-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {sortedLayouts.map((layout) => {
            const isRecommended = layout.id === recommended.id;
            const isActive = layout.id === active.id;

            return (
              <div
                key={layout.id}
                onClick={() => onSelect(layout)}
                className={`group relative flex flex-col justify-between rounded-[24px] cursor-pointer p-4 transition-all duration-300 border bg-white ${
                  isActive
                    ? "ring-2 ring-indigo-600 border-indigo-600 shadow-lg -translate-y-1"
                    : "border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
                }`}
              >
                <div>
                  {/* AI Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-2.5 left-4 z-10 flex items-center gap-1 bg-amber-400 text-amber-950 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      <Crown className="w-2.5 h-2.5 fill-amber-950" /> Recommended
                    </div>
                  )}

                  {/* Micro Thumbnail Visual Box */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 mb-3.5 aspect-square border border-slate-100 shadow-inner group-hover:bg-slate-100/50 transition-colors">
                    <div className="scale-[0.52] sm:scale-[0.58] origin-center absolute pointer-events-none w-[170%] h-[170%]">
                      <GiftBoxVisual
                        products={products}
                        ribbonHex={layout.ribbon.hex}
                        layoutId={layout.id}
                        size="sm"
                        customizations={customizations}
                        boxTemplates={customizations.boxTemplates}
                      />
                    </div>
                    
                    {/* Match Score Badge Inside Thumbnail */}
                    <div className={`absolute bottom-2 right-2 text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md z-30 ${
                      layout.matchScore >= 80 ? "bg-emerald-500" : "bg-blue-500"
                    }`}>
                      {layout.matchScore}%
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="space-y-1 px-0.5">
                    <h4 className="font-extrabold text-[11px] sm:text-[12px] text-slate-800 tracking-tight leading-tight truncate">
                      {layout.name}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-normal line-clamp-1">
                      {layout.description}
                    </p>
                  </div>

                  {/* Clean 4-Column Layout Metrics */}
                  <div className="grid grid-cols-4 gap-0.5 mt-3 pt-2.5 border-t border-slate-100 text-center">
                    <div className="flex flex-col">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-400 font-semibold uppercase tracking-wide">Space</span>
                      <span className="text-slate-700 font-bold text-[9px] sm:text-[10px] mt-0.5">{layout.scores.spaceUtil}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-400 font-semibold uppercase tracking-wide">Aesthetic</span>
                      <span className="text-slate-700 font-bold text-[9px] sm:text-[10px] mt-0.5">{layout.scores.aesthetic}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-400 font-semibold uppercase tracking-wide">Safety</span>
                      <span className="text-slate-700 font-bold text-[9px] sm:text-[10px] mt-0.5">{layout.scores.safety}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-400 font-semibold uppercase tracking-wide">Cost</span>
                      <span className="text-slate-700 font-bold text-[9px] sm:text-[10px] mt-0.5">{layout.scores.costScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button className="absolute -right-4 z-20 bg-white border border-slate-200/80 rounded-full p-2 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all text-slate-500 hover:text-slate-800 focus:outline-none hidden md:flex items-center justify-center">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}