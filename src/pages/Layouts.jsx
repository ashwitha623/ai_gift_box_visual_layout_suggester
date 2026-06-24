import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Gift,
  Calendar,
  Archive,
  Star,
  Trash2,
  Play,
  Search,
  ChevronRight,
  Plus,
  Compass,
  ArrowLeft,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { OCCASIONS, PRODUCTS } from "@/lib/giftdata";
import { generateRecommendations } from "@/lib/layoutEngine";

export default function Layouts() {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/layouts");
      // Pre-seed unique IDs for items that do not have them
      const itemsWithIds = res.data.map((item, idx) => ({
        ...item,
        id: item.id || `legacy-${idx}`
      }));
      setLayouts(itemsWithIds.reverse());
      setLoading(false);
    } catch (err) {
      console.error("Failed to load layouts:", err);
      setLoading(false);
    }
  };

  const handleDeleteLayout = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    try {
      const res = await axios.delete(`http://localhost:5000/api/layouts/${id}`);
      if (res.data.success) {
        toast({
          title: "Design Deleted",
          description: "Layout configuration removed from your history."
        });
        fetchLayouts();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete saved design.",
        variant: "destructive"
      });
    }
  };

  const handleRecreate = (item) => {
    // Find occasion details
    const matchedOccasion = OCCASIONS.find(
      (o) => o.title.toLowerCase() === item.occasion.toLowerCase()
    );

    // Find product details
    const matchedProducts = (item.products || []).map((pName) => {
      const found = PRODUCTS.find((p) => p.name.toLowerCase() === pName.toLowerCase());
      return found || null;
    }).filter(Boolean);

    if (matchedProducts.length < 2) {
      toast({
        title: "Cannot Recreate",
        description: "This design contains products that are no longer in our catalog.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Pre-generate recommendations so they land directly on visual studio layout
      const generatedResult = generateRecommendations({
        occasion: matchedOccasion?.id || "just_because",
        occasionTitle: matchedOccasion?.title || "Just Because",
        products: matchedProducts,
        budget: 5000,
        boxSize: "Medium",
      });

      // Override ribbon color in recommendations to match saved design
      if (item.ribbon && generatedResult.recommended) {
        generatedResult.recommended.ribbon.color = item.ribbon;
      }

      const builderState = {
        occasion: matchedOccasion || { id: "just_because", title: "Just Because", icon: "Gift", description: "" },
        products: matchedProducts,
        details: {
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
        },
        result: generatedResult,
        step: 3 // Set to Step 3 (Visual Layout)
      };

      sessionStorage.setItem("paperplane_builder_state", JSON.stringify(builderState));
      toast({
        title: "Layout Loaded! 🎨",
        description: `Restoring design for ${item.occasion} in the visual studio.`
      });
      navigate("/create");
    } catch (err) {
      console.error("Failed to load layout in builder:", err);
      toast({
        title: "Error",
        description: "Could not recreate layout details in builder.",
        variant: "destructive"
      });
    }
  };

  // Helper to map hex codes to names
  const getRibbonName = (hex) => {
    if (!hex) return "Standard Ribbon";
    const colors = {
      "#D4AF37": "Gold Satin",
      "#AA8413": "Navy Satin",
      "#C41E3A": "Red Satin",
      "#1A1A1A": "Velvet Black",
      "#FFB3C6": "Pastel Pink",
      "#C0C0C0": "Silver Classic"
    };
    return colors[hex.toUpperCase()] || `Custom Ribbon`;
  };

  // Filter layouts list
  const filteredLayouts = layouts.filter((item) => {
    const matchesSearch =
      item.occasion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.layout.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.products || []).some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOccasion =
      selectedOccasionFilter === "all" ||
      item.occasion.toLowerCase() === selectedOccasionFilter.toLowerCase();

    return matchesSearch && matchesOccasion;
  });

  // Calculate quick stats
  const totalSaved = layouts.length;
  const uniqueProductsCount = new Set(layouts.flatMap((l) => l.products || [])).size;
  const latestDesign = layouts[0] || null;

  return (
    <div className="min-h-screen bg-background font-body text-foreground pb-20">
      
      {/* Hero Header Area */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#09152b] via-[#0f213f] to-[#040a14] py-16 px-6 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3.5 py-1 text-xs mb-4 text-[#C5A880] uppercase font-bold tracking-wider">
                <Archive className="w-3.5 h-3.5" /> Studio Archive
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight">Gift Layout History</h1>
              <p className="text-slate-300 text-sm mt-2 max-w-xl">
                Revisit and reload your previously saved AI layouts, ribbon choices, and product assortments.
              </p>
            </div>
            
            <Button
              onClick={() => navigate("/create")}
              className="rounded-full bg-[#C5A880] hover:bg-[#bfa278] text-[#09152b] font-bold text-xs h-11 px-6 shadow-lg shadow-[#C5A880]/10 flex items-center gap-1.5 border border-white/20"
            >
              <Plus className="w-4 h-4" /> Design New Box
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl pt-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Saved</span>
              <span className="text-2xl font-black block mt-1">{totalSaved} Layouts</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unique Items</span>
              <span className="text-2xl font-black block mt-1">{uniqueProductsCount} Products</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur col-span-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Latest Occasion</span>
              <span className="text-base font-extrabold block mt-1 truncate">
                {latestDesign ? `${latestDesign.occasion} (${latestDesign.layout})` : "None"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-8">
        
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b pb-6">
          {/* Occasions select scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {["all", "birthday", "anniversary", "wedding", "festival", "corporate", "just_because"].map((occ) => {
              const matched = OCCASIONS.find(o => o.id === occ);
              const label = occ === "all" ? "All Designs" : matched ? matched.title : occ;
              const isActive = selectedOccasionFilter === occ;
              
              return (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasionFilter(occ)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-[#09152b] text-white border-[#09152b] shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search layout, items, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 rounded-full h-11 border-slate-200 text-xs focus:ring-[#09152b]"
            />
          </div>
        </div>

        {/* Layout list */}
        {loading ? (
          <div className="text-center py-20 text-xs text-muted-foreground">Loading layouts...</div>
        ) : filteredLayouts.length === 0 ? (
          <div className="bg-card border rounded-[32px] p-12 text-center max-w-xl mx-auto space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-primary">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-heading text-primary">No Matching Layouts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {layouts.length === 0
                  ? "You haven't saved any AI box configurations in this browser session yet."
                  : "Try checking your spelling or adjusting the occasion filter buttons."}
              </p>
            </div>
            <Button
              onClick={() => navigate("/create")}
              className="rounded-full bg-primary hover:bg-primary/95 text-white px-6 font-semibold text-xs h-10"
            >
              Start AI Gifting Box Builder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredLayouts.map((item, index) => {
                // Find products
                const matchedProducts = (item.products || []).map((pName) => {
                  return PRODUCTS.find((p) => p.name.toLowerCase() === pName.toLowerCase()) || null;
                }).filter(Boolean);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    key={item.id}
                    className="group bg-card border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Premium card header */}
                      <div className="bg-[#FAF7F2] p-5 border-b flex justify-between items-center">
                        <div>
                          <Badge className="bg-[#09152b] text-white hover:bg-[#09152b] text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            {item.occasion}
                          </Badge>
                          <span className="block text-[10px] text-slate-400 font-medium mt-1">Saved Design</span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteLayout(item.id, e)}
                          className="h-8 w-8 rounded-full border border-slate-200/60 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete design"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Physical attributes */}
                        <div className="grid grid-cols-2 gap-3 bg-secondary/15 rounded-xl p-3 border text-[10.5px]">
                          <div>
                            <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider">Placement Grid</span>
                            <span className="font-extrabold text-[#09152b] mt-0.5 block">{item.layout}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider">Ribbon Accent</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border shadow-sm block" 
                                style={{ backgroundColor: item.ribbon || "#C5A880" }}
                              />
                              <span className="font-extrabold text-[#09152b]">{getRibbonName(item.ribbon)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Product visual preview block */}
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider mb-2">Assorted Items</span>
                          
                          {/* Horizontal small thumbnails */}
                          <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
                            {matchedProducts.map((p, pIdx) => (
                              <div 
                                key={`${p.id}-${pIdx}`} 
                                className="relative flex-shrink-0 w-11 h-11 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center"
                                title={p.name}
                              >
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>

                          {/* List of text names */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.products?.map((p, i) => (
                              <Badge key={i} variant="secondary" className="text-[9.5px] py-0.5 px-2 bg-slate-50 hover:bg-slate-50 border border-slate-100 text-slate-600 font-semibold rounded-lg">
                                🎁 {p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-6 pb-6 pt-2">
                      <Button
                        onClick={() => handleRecreate(item)}
                        className="w-full rounded-full bg-[#09152b] hover:bg-[#1a2d4b] text-white font-bold h-10 text-xs shadow-md shadow-slate-900/5 flex items-center justify-center gap-1.5 border border-[#C5A880]/20"
                      >
                        <Edit className="w-3.5 h-3.5" /> Customize Layout
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}