import { useEffect, useState } from "react";
import axios from "axios";
import AdminCredentialGate from "@/components/admin/AdminCredentialGate";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Trash2, Edit3 } from "lucide-react";
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
      const productsRes = await axios.get("http://localhost:5000/api/products");

      setOrders(ordersRes.data);
      setProducts(productsRes.data);
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
                <div className="grid lg:grid-cols-3 gap-10">
                  {/* Add/Edit Form */}
                  <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm h-fit">
                    <h3 className="text-xl font-bold font-heading mb-6 text-primary">
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
                          className="rounded-xl h-10" 
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
                            className="rounded-xl h-10" 
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
                            className="rounded-xl h-10" 
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
                  </div>

                  {/* Stock Grid */}
                  <div className="lg:col-span-2 bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-xl font-bold font-heading mb-6 text-primary">Catalog Stock Index</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs text-muted-foreground font-bold">
                            <th className="py-2.5 px-3">Product</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Cost</th>
                            <th className="py-2.5 px-3">Stock Level</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => {
                            const isLow = p.stock > 0 && p.stock <= 5;
                            const isOut = p.stock === 0;
                            return (
                              <tr key={p.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                                <td className="py-3 px-3 font-semibold text-primary text-xs">{p.name}</td>
                                <td className="py-3 px-3 text-xs text-slate-500">{p.category}</td>
                                <td className="py-3 px-3 font-medium text-xs">₹{p.price}</td>
                                <td className="py-3 px-3">
                                  {isOut ? (
                                    <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[9px] font-bold">OUT OF STOCK</Badge>
                                  ) : isLow ? (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold">{p.stock} LOW STOCK</Badge>
                                  ) : (
                                    <span className="text-xs font-bold text-slate-700">{p.stock} units</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right flex justify-end gap-1.5">
                                  <Button variant="ghost" size="xs" onClick={() => handleEditProductClick(p)} className="h-7 w-7 p-0 rounded-full hover:bg-white border"><Edit3 className="w-3.5 h-3.5 text-slate-600" /></Button>
                                  <Button variant="ghost" size="xs" onClick={() => handleDeleteProduct(p.id)} className="h-7 w-7 p-0 rounded-full hover:bg-white border text-rose-600 border-rose-100"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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