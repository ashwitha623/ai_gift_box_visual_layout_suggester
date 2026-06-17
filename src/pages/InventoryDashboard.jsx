import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Minus, Search, ShieldAlert, Edit, Trash2, ArrowUpDown, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [alerts, setAlerts] = useState({ lowStockProducts: [], outStockProducts: [], lowStockPackaging: [], outStockPackaging: [], totalLowCount: 0, totalOutCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'packaging'
  
  // Forms states
  const [showAddPackaging, setShowAddPackaging] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [packName, setPackName] = useState("");
  const [packType, setPackType] = useState("Box");
  const [packSku, setPackSku] = useState("");
  const [packQty, setPackQty] = useState("");
  const [packMin, setPackMin] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const invRes = await axios.get("http://localhost:5000/api/inventory");
      const alertRes = await axios.get("http://localhost:5000/api/inventory/alerts");
      
      setProducts(invRes.data.products || []);
      setPackaging(invRes.data.packaging || []);
      setAlerts(alertRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load inventory data.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleAdjustProductStock = async (id, adjustment) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/inventory/product/${id}/adjust`, { adjustment });
      if (res.data.success) {
        toast({ title: "Stock Adjusted", description: `Product stock modified successfully.` });
        loadInventory();
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Fulfillment stock adjustment failed.", variant: "destructive" });
    }
  };

  const handleAdjustPackagingStock = async (item, adjustment) => {
    try {
      const newQty = Math.max(0, item.availableQty + adjustment);
      const res = await axios.put(`http://localhost:5000/api/inventory/packaging/${item.id}`, {
        name: item.name,
        type: item.type,
        sku: item.sku,
        availableQty: newQty,
        minThreshold: item.minThreshold
      });
      if (res.data.success) {
        toast({ title: "Packaging Stock Adjusted", description: `${item.name} quantity modified.` });
        loadInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePackaging = async (e) => {
    e.preventDefault();
    if (!packName || !packSku || !packQty || !packMin) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        name: packName,
        type: packType,
        sku: packSku,
        availableQty: parseInt(packQty),
        minThreshold: parseInt(packMin)
      };

      if (editingPack) {
        await axios.put(`http://localhost:5000/api/inventory/packaging/${editingPack.id}`, payload);
        toast({ title: "Updated", description: "Packaging material updated successfully." });
      } else {
        await axios.post("http://localhost:5000/api/inventory/packaging", payload);
        toast({ title: "Created", description: "New packaging material added." });
      }

      // Reset Form
      setPackName("");
      setPackSku("");
      setPackQty("");
      setPackMin("");
      setEditingPack(null);
      setShowAddPackaging(false);
      loadInventory();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save packaging material.", variant: "destructive" });
    }
  };

  const handleDeletePackaging = async (id) => {
    if (!window.confirm("Are you sure you want to delete this packaging material?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/inventory/packaging/${id}`);
      toast({ title: "Deleted", description: "Packaging material removed." });
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditPack = (item) => {
    setEditingPack(item);
    setPackName(item.name);
    setPackType(item.type);
    setPackSku(item.sku);
    setPackQty(item.availableQty);
    setPackMin(item.minThreshold);
    setShowAddPackaging(true);
  };

  // Math metrics
  const totalProductsCount = products.length;
  const availableProductsStock = products.reduce((sum, p) => sum + p.stock, 0);
  const availablePackagingStock = packaging.reduce((sum, p) => sum + p.availableQty, 0);

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredPackaging = packaging.filter(p => {
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Fulfillment Inventory Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage products stock indices, SKUs, reserved orders volumes, and gift packaging materials.</p>
          </div>
          <Button onClick={loadInventory} variant="outline" className="rounded-full border hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sync Inventory
          </Button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card border rounded-3xl p-5 shadow-sm text-center">
            <Package className="w-8 h-8 text-accent mx-auto mb-2" />
            <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Products</h4>
            <p className="text-2xl font-extrabold text-primary mt-1">{totalProductsCount}</p>
          </div>
          <div className="bg-card border rounded-3xl p-5 shadow-sm text-center">
            <Layers className="w-8 h-8 text-accent mx-auto mb-2" />
            <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Available Stock</h4>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{availableProductsStock + availablePackagingStock} units</p>
          </div>
          <div className="bg-card border rounded-3xl p-5 shadow-sm text-center">
            <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Low Stock Items</h4>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{alerts.totalLowCount}</p>
          </div>
          <div className="bg-card border rounded-3xl p-5 shadow-sm text-center">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Out Of Stock</h4>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{alerts.totalOutCount}</p>
          </div>
          <div className="bg-card border rounded-3xl p-5 shadow-sm text-center col-span-2 lg:col-span-1">
            <Package className="w-8 h-8 text-accent mx-auto mb-2" />
            <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Packaging Stocks</h4>
            <p className="text-2xl font-extrabold text-primary mt-1">{packaging.length} Types</p>
          </div>
        </div>

        {/* Low Stock Alerts Panels */}
        {alerts.totalLowCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>Low Stock Alerts Active ({alerts.totalLowCount})</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {alerts.lowStockProducts.map(p => (
                <div key={p.id} className="bg-white border border-amber-100 rounded-2xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-primary block">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">Category: {p.category}</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold">{p.stock} left (Min: {p.minThreshold})</Badge>
                </div>
              ))}
              {alerts.lowStockPackaging.map(p => (
                <div key={p.id} className="bg-white border border-amber-100 rounded-2xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-primary block">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">Type: {p.type}</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold">{p.availableQty} left (Min: {p.minThreshold})</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search, Filter & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border rounded-3xl p-4 shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("products"); setSearch(""); }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === "products" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Gift Products Stock 🧸
            </button>
            <button
              onClick={() => { setActiveTab("packaging"); setSearch(""); }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === "packaging" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Packaging Materials Inventory 📦
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder={activeTab === "products" ? "Search Name or SKU..." : "Search Material name..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full h-10 bg-secondary/35 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 text-xs"
              />
            </div>
            {activeTab === "products" && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 rounded-full h-10 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Soft Toys">Soft Toys</SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                  <SelectItem value="Flowers">Flowers</SelectItem>
                  <SelectItem value="Chocolates">Chocolates</SelectItem>
                  <SelectItem value="Lifestyle Gifts">Lifestyle Gifts</SelectItem>
                  <SelectItem value="Premium Gifts">Premium Gifts</SelectItem>
                </SelectContent>
              </Select>
            )}
            {activeTab === "packaging" && (
              <Button onClick={() => { setEditingPack(null); setPackName(""); setPackSku(""); setPackQty(""); setPackMin(""); setShowAddPackaging(true); }} className="rounded-full bg-primary hover:bg-primary/95 text-white h-10 text-xs font-semibold px-4 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Packaging
              </Button>
            )}
          </div>
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="text-center py-20 text-xs">Fetching Inventory Catalog...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* Add Packaging Form Modal Overlay */}
              {showAddPackaging && (
                <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white border rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
                    <h3 className="text-xl font-bold font-heading text-primary mb-5">{editingPack ? `Edit Packaging: ${editingPack.name}` : "Create Packaging Material"}</h3>
                    <form onSubmit={handleSavePackaging} className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-primary">Material Name</Label>
                        <Input value={packName} onChange={(e) => setPackName(e.target.value)} placeholder="e.g. Lavender Wrapping Paper" className="rounded-xl h-10 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-primary">Type</Label>
                          <select value={packType} onChange={(e) => setPackType(e.target.value)} className="w-full h-10 rounded-xl border px-3 text-xs bg-white">
                            <option value="Box">Box 📦</option>
                            <option value="Ribbon">Ribbon 🎀</option>
                            <option value="Paper">Wrapping Paper 📄</option>
                            <option value="Filler">Decorative Filler 🍂</option>
                            <option value="Card">Greeting Card 💌</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-primary">SKU Code</Label>
                          <Input value={packSku} onChange={(e) => setPackSku(e.target.value)} placeholder="e.g. WRP-LVN" className="rounded-xl h-10 text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-primary">Available Qty</Label>
                          <Input type="number" value={packQty} onChange={(e) => setPackQty(e.target.value)} placeholder="e.g. 100" className="rounded-xl h-10 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-primary">Min Threshold</Label>
                          <Input type="number" value={packMin} onChange={(e) => setPackMin(e.target.value)} placeholder="e.g. 15" className="rounded-xl h-10 text-xs" />
                        </div>
                      </div>
                      <div className="flex gap-2.5 pt-3">
                        <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-white h-10 text-xs font-semibold">{editingPack ? "Save Changes" : "Create Material"}</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddPackaging(false)} className="rounded-xl h-10 text-xs">Cancel</Button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* PRODUCTS TABLE */}
              {activeTab === "products" && (
                <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold font-heading text-primary mb-6">Hamper Products Inventory</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground font-bold">
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">SKU</th>
                          <th className="py-3 px-4">Available Qty</th>
                          <th className="py-3 px-4">Reserved Qty</th>
                          <th className="py-3 px-4">Min Threshold</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Fulfillment Adjustments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(p => {
                          const isLow = p.stock > 0 && p.stock <= p.minThreshold;
                          const isOut = p.stock === 0;

                          return (
                            <tr key={p.id} className="border-b hover:bg-secondary/40 transition-colors">
                              <td className="py-4 px-4 font-bold text-primary text-sm">{p.name}</td>
                              <td className="py-4 px-4 font-medium text-slate-500">{p.category}</td>
                              <td className="py-4 px-4 font-semibold text-accent">{p.sku || `PRD-GEN-${p.id}`}</td>
                              <td className="py-4 px-4 font-bold text-slate-700 text-sm">{p.stock}</td>
                              <td className="py-4 px-4 font-medium text-slate-400">{p.reservedQty || 0}</td>
                              <td className="py-4 px-4 text-slate-500 font-medium">{p.minThreshold || 5}</td>
                              <td className="py-4 px-4">
                                {isOut ? (
                                  <Badge className="bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[9px]">OUT OF STOCK</Badge>
                                ) : isLow ? (
                                  <Badge className="bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[9px]">LOW STOCK</Badge>
                                ) : (
                                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px]">IN STOCK</Badge>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="inline-flex items-center gap-1 bg-white border rounded-full p-1 shadow-sm">
                                  <Button size="xs" onClick={() => handleAdjustProductStock(p.id, -1)} className="rounded-full h-6 w-6 p-0 hover:bg-slate-100" variant="ghost">
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center text-xs font-bold text-primary">{p.stock}</span>
                                  <Button size="xs" onClick={() => handleAdjustProductStock(p.id, 1)} className="rounded-full h-6 w-6 p-0 hover:bg-slate-100" variant="ghost">
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PACKAGING MATERIALS TABLE */}
              {activeTab === "packaging" && (
                <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold font-heading text-primary mb-6">Hamper Packaging materials</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground font-bold">
                          <th className="py-3 px-4">Material Name</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">SKU</th>
                          <th className="py-3 px-4">Available Qty</th>
                          <th className="py-3 px-4">Reserved Qty</th>
                          <th className="py-3 px-4">Min Threshold</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Adjust Stock</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPackaging.map(item => {
                          const isLow = item.availableQty > 0 && item.availableQty <= item.minThreshold;
                          const isOut = item.availableQty === 0;

                          return (
                            <tr key={item.id} className="border-b hover:bg-secondary/40 transition-colors">
                              <td className="py-4 px-4 font-bold text-primary text-sm">{item.name}</td>
                              <td className="py-4 px-4 font-semibold text-slate-500">{item.type}</td>
                              <td className="py-4 px-4 font-semibold text-accent">{item.sku}</td>
                              <td className="py-4 px-4 font-bold text-slate-700 text-sm">{item.availableQty}</td>
                              <td className="py-4 px-4 font-medium text-slate-400">{item.reservedQty || 0}</td>
                              <td className="py-4 px-4 text-slate-500 font-medium">{item.minThreshold}</td>
                              <td className="py-4 px-4">
                                {isOut ? (
                                  <Badge className="bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[9px]">OUT OF STOCK</Badge>
                                ) : isLow ? (
                                  <Badge className="bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[9px]">LOW STOCK</Badge>
                                ) : (
                                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px]">IN STOCK</Badge>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="inline-flex items-center gap-1 bg-white border rounded-full p-1 shadow-sm">
                                  <Button size="xs" onClick={() => handleAdjustPackagingStock(item, -5)} className="rounded-full h-6 w-6 p-0 hover:bg-slate-100" variant="ghost">
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center text-xs font-bold text-primary">{item.availableQty}</span>
                                  <Button size="xs" onClick={() => handleAdjustPackagingStock(item, 5)} className="rounded-full h-6 w-6 p-0 hover:bg-slate-100" variant="ghost">
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <Button variant="ghost" size="xs" onClick={() => handleStartEditPack(item)} className="h-7 w-7 p-0 rounded-full hover:bg-white border"><Edit className="w-3.5 h-3.5 text-slate-600" /></Button>
                                  <Button variant="ghost" size="xs" onClick={() => handleDeletePackaging(item.id)} className="h-7 w-7 p-0 rounded-full hover:bg-white border text-rose-600 border-rose-100"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}
