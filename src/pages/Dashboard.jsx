import { useEffect, useState } from "react";
import axios from "axios";
import AdminCredentialGate from "@/components/admin/AdminCredentialGate";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Trash2, Edit3, Plus, Minus, Search, ShieldAlert, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders"); // Defaults to Orders Hub
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Product Form State (Add/Edit)
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Soft Toys");
  const [prodPrice, setProdPrice] = useState("");
  const [prodSize, setProdSize] = useState("Medium");
  const [prodStock, setProdStock] = useState("");
  const [errors, setErrors] = useState({});

  // Merged Inventory States
  const [packaging, setPackaging] = useState([]);
  const [alerts, setAlerts] = useState({ lowStockProducts: [], outStockProducts: [], lowStockPackaging: [], outStockPackaging: [], totalLowCount: 0, totalOutCount: 0 });
  const [subTab, setSubTab] = useState("products"); // 'products' or 'packaging'
  const [inventorySearch, setInventorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Packaging Material Form State (Add/Edit)
  const [editingPackaging, setEditingPackaging] = useState(null);
  const [packName, setPackName] = useState("");
  const [packType, setPackType] = useState("Box");
  const [packSku, setPackSku] = useState("");
  const [packQty, setPackQty] = useState("");
  const [packMin, setPackMin] = useState("");
  const [packagingErrors, setPackagingErrors] = useState({});

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const u = JSON.parse(userStr);
      setCurrentUser(u);
      if (u.role === "admin") {
        loadDashboardData();
      } else {
        setLoading(false);
      }
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const ordersRes = await axios.get("http://localhost:5000/api/orders");
      const invRes = await axios.get("http://localhost:5000/api/inventory");
      const alertsRes = await axios.get("http://localhost:5000/api/inventory/alerts");

      setOrders(ordersRes.data);
      setProducts(invRes.data.products || []);
      setPackaging(invRes.data.packaging || []);
      setAlerts(alertsRes.data || { lowStockProducts: [], outStockProducts: [], lowStockPackaging: [], outStockPackaging: [], totalLowCount: 0, totalOutCount: 0 });
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
      setLoading(false);
    }
  };

  // Update order status (Design approval & production tracking stages)
  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status });
      toast({ title: "Order Updated", description: `Order status set to '${status}'.` });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    }
  };

  // Product Save/Update
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!prodName.trim()) newErrors.prodName = "* Product Name is required.";
    if (!prodPrice.toString().trim()) newErrors.prodPrice = "* Price is required.";
    if (!prodStock.toString().trim()) newErrors.prodStock = "* Stock Count is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const payload = {
        name: prodName,
        category: prodCategory,
        price: parseInt(prodPrice),
        size: prodSize,
        stock: parseInt(prodStock),
        vendorId: null // No vendor assignment needed
      };

      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, payload);
        toast({ title: "Product Updated", description: "Product parameters saved successfully." });
      } else {
        await axios.post("http://localhost:5000/api/products", payload);
        toast({ title: "Product Created", description: "New item added to catalog." });
      }

      // Reset
      setEditingProduct(null);
      setProdName("");
      setProdPrice("");
      setProdStock("");
      setErrors({});
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
    }
  };

  const handleEditProductClick = (p) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price);
    setProdSize(p.size);
    setProdStock(p.stock);
    setErrors({});
    setActiveTab("inventory");
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      toast({ title: "Product Deleted", description: "Item removed from inventory." });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  const handleAdjustProductStock = async (id, adjustment) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/inventory/product/${id}/adjust`, { adjustment });
      if (res.data.success) {
        toast({ title: "Stock Adjusted", description: `Product stock modified successfully.` });
        loadDashboardData();
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
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePackaging = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!packName.trim()) newErrors.packName = "* Material Name is required.";
    if (!packSku.trim()) newErrors.packSku = "* SKU Code is required.";
    if (!packQty.toString().trim()) newErrors.packQty = "* Available Qty is required.";
    if (!packMin.toString().trim()) newErrors.packMin = "* Min Threshold is required.";

    if (Object.keys(newErrors).length > 0) {
      setPackagingErrors(newErrors);
      return;
    }
    setPackagingErrors({});

    try {
      const payload = {
        name: packName,
        type: packType,
        sku: packSku,
        availableQty: parseInt(packQty),
        minThreshold: parseInt(packMin)
      };

      if (editingPackaging) {
        await axios.put(`http://localhost:5000/api/inventory/packaging/${editingPackaging.id}`, payload);
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
      setEditingPackaging(null);
      setPackagingErrors({});
      loadDashboardData();
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
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditPackaging = (item) => {
    setEditingPackaging(item);
    setPackName(item.name);
    setPackType(item.type);
    setPackSku(item.sku);
    setPackQty(item.availableQty);
    setPackMin(item.minThreshold);
    setPackagingErrors({});
  };

  const totalProductsCount = products.length;
  const availableProductsStock = products.reduce((sum, p) => sum + p.stock, 0);
  const availablePackagingStock = packaging.reduce((sum, p) => sum + p.availableQty, 0);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || p.sku?.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredPackaging = packaging.filter(p => {
    return p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || p.sku?.toLowerCase().includes(inventorySearch.toLowerCase());
  });

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AdminCredentialGate 
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setTimeout(() => {
            loadDashboardData();
          }, 50);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Admin Gifting Center</h1>
            <p className="text-muted-foreground mt-2">Track order fulfillment stages, design approvals, and maintain inventory stock levels.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDashboardData} variant="outline" className="rounded-full border text-xs">
              Refresh System
            </Button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2.5 mb-8 border-b border-border pb-4">
          {[
            { id: "orders", label: "Orders Hub (Design & Production) 📦" },
            { id: "inventory", label: "Inventory & Stock Catalog 🛠️" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setEditingProduct(null); }}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === t.id
                  ? "bg-primary text-white shadow"
                  : "bg-white border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">Loading Administrative Metrics...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {/* 1. ORDERS HUB */}
              {activeTab === "orders" && (
                <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-xl font-bold font-heading mb-6 text-primary">Fulfillment & Workflow Tracker</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground font-bold">
                          <th className="py-3 px-4">Order Code</th>
                          <th className="py-3 px-4">Client</th>
                          <th className="py-3 px-4">Customizations</th>
                          <th className="py-3 px-4">Value</th>
                          <th className="py-3 px-4">Fulfillment Stage</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice().reverse().map((o) => (
                          <tr key={o.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                            <td className="py-4 px-4 font-bold text-primary">{o.trackingId}</td>
                            <td className="py-4 px-4 text-xs">
                              {o.user ? o.user.username : "Guest"}
                              <span className="block text-[10px] text-slate-400">{o.user?.email || ""}</span>
                            </td>
                            <td className="py-4 px-4 text-xs font-medium">
                              Recipient: <strong>{o.recipient?.name || "None"}</strong>
                              {o.recipient?.phone && <span className="block text-[10px] text-slate-500">Phone: {o.recipient.phone}</span>}
                              {o.recipient?.customText && <span className="block text-[10px] text-accent">Lid: "{o.recipient.customText}"</span>}
                            </td>
                            <td className="py-4 px-4 font-semibold">₹{o.totalPrice}</td>
                            <td className="py-4 px-4">
                              <Badge className="bg-[#FAF7F2] border border-[#C5A880]/30 text-primary text-[10px] font-bold">
                                {o.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Select value={o.status} onValueChange={(val) => handleUpdateOrderStatus(o.id, val)}>
                                <SelectTrigger className="w-40 rounded-xl h-8 bg-white ml-auto text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Order Placed">Order Placed</SelectItem>
                                  <SelectItem value="Customization">Customization (Design)</SelectItem>
                                  <SelectItem value="Packaging">Packaging</SelectItem>
                                  <SelectItem value="Quality Check">Quality Check</SelectItem>
                                  <SelectItem value="Dispatch">Dispatch</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. INVENTORY & STOCK */}
              {activeTab === "inventory" && (
                <div>
                  {/* Analytics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-card border rounded-3xl p-4 shadow-sm text-center">
                      <Package className="w-6 h-6 text-accent mx-auto mb-1.5" />
                      <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total Products</h4>
                      <p className="text-xl font-extrabold text-primary mt-0.5">{totalProductsCount}</p>
                    </div>
                    <div className="bg-card border rounded-3xl p-4 shadow-sm text-center">
                      <Layers className="w-6 h-6 text-accent mx-auto mb-1.5" />
                      <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Available Stock</h4>
                      <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{availableProductsStock + availablePackagingStock} units</p>
                    </div>
                    <div className="bg-card border rounded-3xl p-4 shadow-sm text-center">
                      <ShieldAlert className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                      <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Low Stock Items</h4>
                      <p className="text-xl font-extrabold text-amber-600 mt-0.5">{alerts.totalLowCount}</p>
                    </div>
                    <div className="bg-card border rounded-3xl p-4 shadow-sm text-center">
                      <ShieldAlert className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
                      <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Out Of Stock</h4>
                      <p className="text-xl font-extrabold text-rose-600 mt-0.5">{alerts.totalOutCount}</p>
                    </div>
                    <div className="bg-card border rounded-3xl p-4 shadow-sm text-center col-span-2 lg:col-span-1">
                      <Package className="w-6 h-6 text-accent mx-auto mb-1.5" />
                      <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Packaging Stocks</h4>
                      <p className="text-xl font-extrabold text-primary mt-0.5">{packaging.length} Types</p>
                    </div>
                  </div>

                  {/* Low Stock Alerts Panels */}
                  {alerts.totalLowCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6 space-y-3">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Low Stock Alerts Active ({alerts.totalLowCount})</span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {alerts.lowStockProducts.map(p => (
                          <div key={p.id} className="bg-white border border-amber-100 rounded-2xl p-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-primary block">{p.name}</span>
                              <span className="text-[9px] text-muted-foreground">Category: {p.category}</span>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 text-[9px] font-bold">{p.stock} left</Badge>
                          </div>
                        ))}
                        {alerts.lowStockPackaging.map(p => (
                          <div key={p.id} className="bg-white border border-amber-100 rounded-2xl p-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-primary block">{p.name}</span>
                              <span className="text-[9px] text-muted-foreground">Type: {p.type}</span>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 text-[9px] font-bold">{p.availableQty} left</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search, Filter & Tabs */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border rounded-3xl p-4 mb-6 shadow-sm">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSubTab("products"); setInventorySearch(""); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          subTab === "products" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        Gift Products Stock 🧸
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSubTab("packaging"); setInventorySearch(""); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          subTab === "packaging" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        Packaging Materials Inventory 📦
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder={subTab === "products" ? "Search Name or SKU..." : "Search Material name..."}
                          value={inventorySearch}
                          onChange={(e) => setInventorySearch(e.target.value)}
                          className="pl-10 rounded-full h-10 bg-secondary/35 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 text-xs"
                        />
                      </div>
                      {subTab === "products" && (
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
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Add/Edit forms */}
                    <div className="bg-card border rounded-3xl p-6 shadow-sm h-fit">
                      {subTab === "products" ? (
                        <>
                          <h3 className="text-lg font-bold font-heading mb-4 text-primary">
                            {editingProduct ? `Edit ${editingProduct.name}` : "Add Product to Catalog"}
                          </h3>
                          <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div className="space-y-1">
                              <Label className="font-semibold text-xs text-primary">Product Name</Label>
                              <Input 
                                placeholder="e.g. Lavender Candle" 
                                value={prodName} 
                                onChange={(e) => {
                                  setProdName(e.target.value);
                                  setErrors(prev => ({ ...prev, prodName: "" }));
                                }} 
                                className="rounded-xl h-10 text-xs" 
                              />
                              {errors.prodName && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.prodName}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Category</Label>
                                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full rounded-xl h-10 border px-3 text-xs bg-white">
                                  <option value="Soft Toys">Soft Toys</option>
                                  <option value="Jewelry">Jewelry</option>
                                  <option value="Flowers">Flowers</option>
                                  <option value="Chocolates">Chocolates</option>
                                  <option value="Lifestyle Gifts">Lifestyle Gifts</option>
                                  <option value="Premium Gifts">Premium Gifts</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Box Size Weight</Label>
                                <select value={prodSize} onChange={(e) => setProdSize(e.target.value)} className="w-full rounded-xl h-10 border px-3 text-xs bg-white">
                                  <option value="Small">Small</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Large">Large</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Price (₹)</Label>
                                <Input 
                                  type="number" 
                                  value={prodPrice} 
                                  onChange={(e) => {
                                    setProdPrice(e.target.value);
                                    setErrors(prev => ({ ...prev, prodPrice: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {errors.prodPrice && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.prodPrice}</p>}
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Stock Count</Label>
                                <Input 
                                  type="number" 
                                  value={prodStock} 
                                  onChange={(e) => {
                                    setProdStock(e.target.value);
                                    setErrors(prev => ({ ...prev, prodStock: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {errors.prodStock && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.prodStock}</p>}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-white h-10 font-semibold text-xs shadow-md">
                                {editingProduct ? "Save Changes" : "Add Product"}
                              </Button>
                              {editingProduct && (
                                <Button type="button" variant="outline" onClick={() => { setEditingProduct(null); setProdName(""); setProdPrice(""); setProdStock(""); setErrors({}); }} className="rounded-xl h-10 text-xs px-3">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </form>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold font-heading mb-4 text-primary">
                            {editingPackaging ? `Edit ${editingPackaging.name}` : "Add Packaging Material"}
                          </h3>
                          <form onSubmit={handleSavePackaging} className="space-y-4">
                            <div className="space-y-1">
                              <Label className="font-semibold text-xs text-primary">Material Name</Label>
                              <Input 
                                placeholder="e.g. Royal Blue Ribbon" 
                                value={packName} 
                                onChange={(e) => setPackName(e.target.value)} 
                                className="rounded-xl h-10 text-xs" 
                              />
                              {packagingErrors.packName && <p className="text-xs text-rose-600 font-semibold mt-1">{packagingErrors.packName}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Type</Label>
                                <select value={packType} onChange={(e) => setPackType(e.target.value)} className="w-full rounded-xl h-10 border px-3 text-xs bg-white">
                                  <option value="Box">Box</option>
                                  <option value="Ribbon">Ribbon</option>
                                  <option value="Card">Greeting Card</option>
                                  <option value="Filler">Filler</option>
                                  <option value="Wrapping">Wrapping Sheet</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">SKU Code</Label>
                                <Input 
                                  placeholder="e.g. RIB-BLU" 
                                  value={packSku} 
                                  onChange={(e) => setPackSku(e.target.value)} 
                                  className="rounded-xl h-10 text-xs uppercase" 
                                />
                                {packagingErrors.packSku && <p className="text-xs text-rose-600 font-semibold mt-1">{packagingErrors.packSku}</p>}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Available Stock</Label>
                                <Input 
                                  type="number" 
                                  placeholder="Qty count" 
                                  value={packQty} 
                                  onChange={(e) => setPackQty(e.target.value)} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {packagingErrors.packQty && <p className="text-xs text-rose-600 font-semibold mt-1">{packagingErrors.packQty}</p>}
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Min Alert Qty</Label>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 5" 
                                  value={packMin} 
                                  onChange={(e) => setPackMin(e.target.value)} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {packagingErrors.packMin && <p className="text-xs text-rose-600 font-semibold mt-1">{packagingErrors.packMin}</p>}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-white h-10 font-semibold text-xs shadow-md">
                                {editingPackaging ? "Save Changes" : "Add Material"}
                              </Button>
                              {editingPackaging && (
                                <Button type="button" variant="outline" onClick={() => { setEditingPackaging(null); setPackName(""); setPackSku(""); setPackQty(""); setPackMin(""); setPackagingErrors({}); }} className="rounded-xl h-10 text-xs px-3">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </form>
                        </>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Table Lists */}
                    <div className="lg:col-span-2 bg-card border rounded-3xl p-6 shadow-sm">
                      {subTab === "products" ? (
                        <>
                          <h3 className="text-lg font-bold font-heading mb-4 text-primary">Hamper Products Inventory Catalog</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-border text-slate-400 font-bold">
                                  <th className="py-2.5 px-2">Product Name</th>
                                  <th className="py-2.5 px-2">SKU</th>
                                  <th className="py-2.5 px-2">Available Qty</th>
                                  <th className="py-2.5 px-2">Reserved Qty</th>
                                  <th className="py-2.5 px-2">Status</th>
                                  <th className="py-2.5 px-2">Fulfillment Adjust</th>
                                  <th className="py-2.5 px-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredProducts.map((p) => {
                                  const isLow = p.stock > 0 && p.stock <= (p.minThreshold || 5);
                                  const isOut = p.stock === 0;
                                  return (
                                    <tr key={p.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                                      <td className="py-3 px-2">
                                        <span className="font-bold text-primary block">{p.name}</span>
                                        <span className="text-[10px] text-slate-400 block">{p.category} · {p.size} Size · ₹{p.price}</span>
                                      </td>
                                      <td className="py-3 px-2 font-mono font-semibold text-accent">{p.sku || `PRD-${p.category.substring(0,3).toUpperCase()}-${p.id}`}</td>
                                      <td className="py-3 px-2 font-bold text-slate-700">{p.stock} units</td>
                                      <td className="py-3 px-2 font-semibold text-slate-500">{p.reservedQty || 0} units</td>
                                      <td className="py-3 px-2">
                                        {isOut ? (
                                          <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[8px] font-bold uppercase">Out of Stock</Badge>
                                        ) : isLow ? (
                                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[8px] font-bold uppercase">Low Stock</Badge>
                                        ) : (
                                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[8px] font-bold uppercase">In Stock</Badge>
                                        )}
                                      </td>
                                      <td className="py-3 px-2">
                                        <div className="flex items-center gap-1.5">
                                          <Button onClick={() => handleAdjustProductStock(p.id, -1)} variant="ghost" className="h-6 w-6 border p-0 rounded-full hover:bg-white"><Minus className="w-3 h-3 text-slate-600" /></Button>
                                          <Button onClick={() => handleAdjustProductStock(p.id, 1)} variant="ghost" className="h-6 w-6 border p-0 rounded-full hover:bg-white"><Plus className="w-3 h-3 text-slate-600" /></Button>
                                        </div>
                                      </td>
                                      <td className="py-3 px-2 text-right">
                                        <div className="flex justify-end gap-1">
                                          <Button variant="ghost" size="xs" onClick={() => handleEditProductClick(p)} className="h-7 w-7 p-0 rounded-full hover:bg-white border"><Edit3 className="w-3.5 h-3.5 text-slate-600" /></Button>
                                          <Button variant="ghost" size="xs" onClick={() => handleDeleteProduct(p.id)} className="h-7 w-7 p-0 rounded-full hover:bg-white border text-rose-600 border-rose-100"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold font-heading mb-4 text-primary">Hamper Packaging Materials Inventory</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-border text-slate-400 font-bold">
                                  <th className="py-2.5 px-2">Material Name</th>
                                  <th className="py-2.5 px-2">Type</th>
                                  <th className="py-2.5 px-2">SKU</th>
                                  <th className="py-2.5 px-2">Available Qty</th>
                                  <th className="py-2.5 px-2">Status</th>
                                  <th className="py-2.5 px-2">Fulfillment Adjust</th>
                                  <th className="py-2.5 px-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredPackaging.map((item) => {
                                  const isLow = item.availableQty > 0 && item.availableQty <= item.minThreshold;
                                  const isOut = item.availableQty === 0;
                                  return (
                                    <tr key={item.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                                      <td className="py-3 px-2 font-bold text-primary">{item.name}</td>
                                      <td className="py-3 px-2 text-slate-500 font-medium">{item.type}</td>
                                      <td className="py-3 px-2 font-mono font-semibold text-accent uppercase">{item.sku}</td>
                                      <td className="py-3 px-2 font-bold text-slate-700">{item.availableQty} units</td>
                                      <td className="py-3 px-2">
                                        {isOut ? (
                                          <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[8px] font-bold uppercase">Out of Stock</Badge>
                                        ) : isLow ? (
                                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[8px] font-bold uppercase">Low Stock</Badge>
                                        ) : (
                                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[8px] font-bold uppercase">In Stock</Badge>
                                        )}
                                      </td>
                                      <td className="py-3 px-2">
                                        <div className="flex items-center gap-1.5">
                                          <Button onClick={() => handleAdjustPackagingStock(item, -5)} variant="ghost" className="h-6 w-6 border p-0 rounded-full hover:bg-white" title="-5 units"><Minus className="w-3 h-3 text-slate-600" /></Button>
                                          <Button onClick={() => handleAdjustPackagingStock(item, 5)} variant="ghost" className="h-6 w-6 border p-0 rounded-full hover:bg-white" title="+5 units"><Plus className="w-3 h-3 text-slate-600" /></Button>
                                        </div>
                                      </td>
                                      <td className="py-3 px-2 text-right">
                                        <div className="flex justify-end gap-1">
                                          <Button variant="ghost" size="xs" onClick={() => handleStartEditPackaging(item)} className="h-7 w-7 p-0 rounded-full hover:bg-white border"><Edit3 className="w-3.5 h-3.5 text-slate-600" /></Button>
                                          <Button variant="ghost" size="xs" onClick={() => handleDeletePackaging(item.id)} className="h-7 w-7 p-0 rounded-full hover:bg-white border text-rose-600 border-rose-100"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
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