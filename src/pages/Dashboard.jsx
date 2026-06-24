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
  const [prodLength, setProdLength] = useState("");
  const [prodWidth, setProdWidth] = useState("");
  const [prodHeight, setProdHeight] = useState("");
  const [prodWeight, setProdWeight] = useState("");
  const [prodFragile, setProdFragile] = useState(false);
  const [errors, setErrors] = useState({});

  // Merged Inventory States
  const [packaging, setPackaging] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [layoutTemplates, setLayoutTemplates] = useState([]);
  const [alerts, setAlerts] = useState({ lowStockProducts: [], outStockProducts: [], lowStockPackaging: [], outStockPackaging: [], totalLowCount: 0, totalOutCount: 0 });
  const [subTab, setSubTab] = useState("products"); // 'products', 'packaging', or 'boxes'
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

  // Packaging Box Form State (Add/Edit)
  const [editingBox, setEditingBox] = useState(null);
  const [boxName, setBoxName] = useState("");
  const [boxLength, setBoxLength] = useState("");
  const [boxWidth, setBoxWidth] = useState("");
  const [boxHeight, setBoxHeight] = useState("");
  const [boxMaxWeight, setBoxMaxWeight] = useState("");
  const [boxCost, setBoxCost] = useState("");
  const [boxStyle, setBoxStyle] = useState("Classic Luxury Rigid");
  const [boxRibbonStyle, setBoxRibbonStyle] = useState("Gold Satin Ribbon");
  const [boxRibbonHex, setBoxRibbonHex] = useState("#D4AF37");
  const [boxPackagingTheme, setBoxPackagingTheme] = useState("Royal Luxury");
  const [boxOccasions, setBoxOccasions] = useState("birthday,anniversary,wedding,corporate");
  const [boxErrors, setBoxErrors] = useState({});

  // Layout Template Form State (Edit)
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [tplMinSpacing, setTplMinSpacing] = useState("");
  const [tplFragileBuffer, setTplFragileBuffer] = useState("");
  const [tplAllowRotation, setTplAllowRotation] = useState(true);
  const [tplAlignment, setTplAlignment] = useState("center");
  const [tplPlacementZone, setTplPlacementZone] = useState("radial");
  const [tplDescription, setTplDescription] = useState("");
  const [templateErrors, setTemplateErrors] = useState({});

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
      setBoxes(invRes.data.boxes || []);
      setLayoutTemplates(invRes.data.layoutTemplates || []);
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

    const len = parseFloat(prodLength);
    const wid = parseFloat(prodWidth);
    const hgt = parseFloat(prodHeight);
    const wgt = parseFloat(prodWeight);

    if (isNaN(len) || len <= 0) newErrors.prodLength = "* Length must be greater than 0.";
    if (isNaN(wid) || wid <= 0) newErrors.prodWidth = "* Width must be greater than 0.";
    if (isNaN(hgt) || hgt <= 0) newErrors.prodHeight = "* Height must be greater than 0.";
    if (isNaN(wgt) || wgt <= 0) newErrors.prodWeight = "* Weight must be greater than 0.";

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
        length: len,
        width: wid,
        height: hgt,
        weight: wgt,
        fragile: prodFragile,
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
      setProdLength("");
      setProdWidth("");
      setProdHeight("");
      setProdWeight("");
      setProdFragile(false);
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
    setProdLength(p.length !== undefined && p.length !== null ? p.length : "");
    setProdWidth(p.width !== undefined && p.width !== null ? p.width : "");
    setProdHeight(p.height !== undefined && p.height !== null ? p.height : "");
    setProdWeight(p.weight !== undefined && p.weight !== null ? p.weight : "");
    setProdFragile(p.fragile || false);
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

  // Packaging Box CRUD Handlers
  const handleSaveBox = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const len = parseFloat(boxLength);
    const wid = parseFloat(boxWidth);
    const hgt = parseFloat(boxHeight);
    const maxW = parseFloat(boxMaxWeight);
    const cost = parseInt(boxCost);

    if (!boxName.trim()) newErrors.boxName = "* Box Name is required.";
    if (isNaN(len) || len <= 0) newErrors.boxLength = "* Length must be greater than 0.";
    if (isNaN(wid) || wid <= 0) newErrors.boxWidth = "* Width must be greater than 0.";
    if (isNaN(hgt) || hgt <= 0) newErrors.boxHeight = "* Height must be greater than 0.";
    if (isNaN(maxW) || maxW <= 0) newErrors.boxMaxWeight = "* Max Weight capacity must be greater than 0.";
    if (isNaN(cost) || cost <= 0) newErrors.boxCost = "* Cost must be greater than 0.";

    if (Object.keys(newErrors).length > 0) {
      setBoxErrors(newErrors);
      return;
    }
    setBoxErrors({});

    try {
      const payload = {
        name: boxName,
        length: len,
        width: wid,
        height: hgt,
        maxWeight: maxW,
        cost,
        style: boxStyle,
        ribbonStyle: boxRibbonStyle,
        ribbonHex: boxRibbonHex,
        packagingTheme: boxPackagingTheme,
        occasions: boxOccasions
      };

      if (editingBox) {
        await axios.put(`http://localhost:5000/api/inventory/boxes/${editingBox.id}`, payload);
        toast({ title: "Box Updated", description: "Packaging box parameters updated successfully." });
      } else {
        await axios.post("http://localhost:5000/api/inventory/boxes", payload);
        toast({ title: "Box Created", description: "New box configuration added." });
      }

      // Reset
      setEditingBox(null);
      setBoxName("");
      setBoxLength("");
      setBoxWidth("");
      setBoxHeight("");
      setBoxMaxWeight("");
      setBoxCost("");
      setBoxStyle("Classic Luxury Rigid");
      setBoxRibbonStyle("Gold Satin Ribbon");
      setBoxRibbonHex("#D4AF37");
      setBoxPackagingTheme("Royal Luxury");
      setBoxOccasions("birthday,anniversary,wedding,corporate");
      setBoxErrors({});
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save packaging box.", variant: "destructive" });
    }
  };

  const handleEditBoxClick = (b) => {
    setEditingBox(b);
    setBoxName(b.name);
    setBoxLength(b.length);
    setBoxWidth(b.width);
    setBoxHeight(b.height);
    setBoxMaxWeight(b.maxWeight);
    setBoxCost(b.cost);
    setBoxStyle(b.style || "Classic Luxury Rigid");
    setBoxRibbonStyle(b.ribbonStyle || "Gold Satin Ribbon");
    setBoxRibbonHex(b.ribbonHex || "#D4AF37");
    setBoxPackagingTheme(b.packagingTheme || "Royal Luxury");
    setBoxOccasions(b.occasions || "birthday,anniversary,wedding,corporate");
    setBoxErrors({});
  };

  const handleDeleteBox = async (id) => {
    if (!window.confirm("Are you sure you want to delete this packaging box configuration?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/inventory/boxes/${id}`);
      toast({ title: "Deleted", description: "Packaging box config removed." });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete box configuration.", variant: "destructive" });
    }
  };

  // Layout Template CRUD Handlers
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const sp = parseFloat(tplMinSpacing);
    const buf = parseFloat(tplFragileBuffer);

    if (isNaN(sp) || sp < 0) newErrors.tplMinSpacing = "* Minimum spacing must be >= 0.";
    if (isNaN(buf) || buf < 0) newErrors.tplFragileBuffer = "* Fragile buffer must be >= 0.";

    if (Object.keys(newErrors).length > 0) {
      setTemplateErrors(newErrors);
      return;
    }
    setTemplateErrors({});

    try {
      const payload = {
        minSpacing: sp,
        fragileBuffer: buf,
        allowRotation: tplAllowRotation,
        alignmentPreference: tplAlignment,
        preferredPlacementZone: tplPlacementZone,
        description: tplDescription
      };

      await axios.put(`http://localhost:5000/api/inventory/layout-templates/${editingTemplate.id}`, payload);
      toast({ title: "Template Saved", description: "Layout template behavior updated successfully." });

      // Reset
      setEditingTemplate(null);
      setTplMinSpacing("");
      setTplFragileBuffer("");
      setTplAllowRotation(true);
      setTplAlignment("center");
      setTplPlacementZone("radial");
      setTplDescription("");
      setTemplateErrors({});
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update layout template.", variant: "destructive" });
    }
  };

  const handleStartEditTemplate = (t) => {
    setEditingTemplate(t);
    setTplMinSpacing(t.minSpacing);
    setTplFragileBuffer(t.fragileBuffer);
    setTplAllowRotation(t.allowRotation);
    setTplAlignment(t.alignmentPreference);
    setTplPlacementZone(t.preferredPlacementZone);
    setTplDescription(t.description || "");
    setTemplateErrors({});
  };

  const getAnalyticsMetrics = () => {
    if (!products || products.length === 0) {
      return {
        largestProduct: null,
        smallestProduct: null,
        avgVolume: 0,
        mostUsedBox: "None",
        avgSpaceUtil: "0%",
        avgPackingEfficiency: "0%",
        mostPackedProduct: "None",
        mostPopularCategory: "None",
        efficiencyTrend: []
      };
    }

    // Static product volume stats
    let maxVol = -1;
    let minVol = Infinity;
    let largestProd = null;
    let smallestProd = null;
    let totalVol = 0;

    products.forEach(p => {
      const vol = (p.length || 0) * (p.width || 0) * (p.height || 0);
      totalVol += vol;
      if (vol > maxVol) {
        maxVol = vol;
        largestProd = p;
      }
      if (vol < minVol && vol > 0) {
        minVol = vol;
        smallestProd = p;
      }
    });
    const avgVolume = products.length > 0 ? (totalVol / products.length) : 0;

    // Order-Based stats (using actual order data!)
    const boxCounts = {};
    let totalSpaceUtil = 0;
    let totalEfficiency = 0;
    let ordersWithScores = 0;

    const productCounts = {};
    const categoryCounts = {};

    orders.forEach(o => {
      // 1. Box usage
      const size = o.boxSize || "Medium Box";
      boxCounts[size] = (boxCounts[size] || 0) + 1;

      // 2. Average Space Util & Packing Efficiency
      if (o.spaceUtil !== undefined && o.spaceUtil !== null && o.spaceUtil > 0) {
        totalSpaceUtil += o.spaceUtil;
        totalEfficiency += o.packingEfficiency || 0;
        ordersWithScores++;
      } else {
        // Fallback for pre-seeded orders
        const isLarge = o.boxSize === "Large";
        const isSmall = o.boxSize === "Small";
        const mockSpaceUtil = isLarge ? 58 : isSmall ? 82 : 72;
        const mockEfficiency = isLarge ? 64 : isSmall ? 88 : 78;
        totalSpaceUtil += mockSpaceUtil;
        totalEfficiency += mockEfficiency;
        ordersWithScores++;
      }

      // 3. Product and Category Counts
      if (o.items && o.items.length > 0) {
        o.items.forEach(item => {
          if (item.product) {
            const pName = item.product.name;
            productCounts[pName] = (productCounts[pName] || 0) + (item.quantity || 1);

            const cat = item.product.category;
            categoryCounts[cat] = (categoryCounts[cat] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    // Most Used Box Type
    let mostUsedBox = "None";
    let maxBoxCount = -1;
    Object.entries(boxCounts).forEach(([box, count]) => {
      if (count > maxBoxCount) {
        maxBoxCount = count;
        mostUsedBox = box;
      }
    });
    if (orders.length === 0) mostUsedBox = "Medium Box (Default)";

    // Most Packed Product
    let mostPackedProduct = "None";
    let maxProductCount = -1;
    Object.entries(productCounts).forEach(([prod, count]) => {
      if (count > maxProductCount) {
        maxProductCount = count;
        mostPackedProduct = prod;
      }
    });

    // Most Popular Gift Category
    let mostPopularCategory = "None";
    let maxCategoryCount = -1;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCategoryCount) {
        maxCategoryCount = count;
        mostPopularCategory = cat;
      }
    });

    // Averages
    const avgSpaceUtil = ordersWithScores > 0 ? Math.round(totalSpaceUtil / ordersWithScores) : 72;
    const avgPackingEfficiency = ordersWithScores > 0 ? Math.round(totalEfficiency / ordersWithScores) : 78;

    // Trend
    let efficiencyTrend = orders.slice(-7).map(o => o.packingEfficiency || 75).filter(v => v > 0);
    if (efficiencyTrend.length < 5) {
      efficiencyTrend = [68, 71, 74, 76, 78];
    }

    return {
      largestProduct: largestProd,
      smallestProduct: smallestProd,
      avgVolume: Math.round(avgVolume),
      mostUsedBox,
      avgSpaceUtil: `${avgSpaceUtil}%`,
      avgPackingEfficiency: `${avgPackingEfficiency}%`,
      mostPackedProduct,
      mostPopularCategory,
      efficiencyTrend
    };
  };

  const analytics = getAnalyticsMetrics();

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

  const filteredBoxes = boxes.filter(b => {
    return b.name.toLowerCase().includes(inventorySearch.toLowerCase()) || (b.style && b.style.toLowerCase().includes(inventorySearch.toLowerCase()));
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
            { id: "inventory", label: "Inventory & Stock Catalog 🛠️" },
            { id: "layouts", label: "Layout Templates Configuration ⚙️" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setEditingProduct(null); setEditingBox(null); setEditingTemplate(null); }}
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

                  {/* AI Gifting Logistics & Packing Analytics */}
                  <div className="bg-card border rounded-3xl p-5 mb-6 shadow-sm text-left">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-1.5 font-heading">
                      <Layers className="w-4 h-4 text-accent" /> AI Gifting Logistics & Packing Analytics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-2xl border text-center flex flex-col justify-between">
                        <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Largest Product</h4>
                        <p className="text-xs font-bold text-primary mt-1">{analytics.largestProduct ? `${analytics.largestProduct.name} (${analytics.largestProduct.length}x${analytics.largestProduct.width}x${analytics.largestProduct.height} cm)` : "None"}</p>
                        <span className="text-[10px] text-slate-500 font-mono">Vol: {analytics.largestProduct ? (analytics.largestProduct.length * analytics.largestProduct.width * analytics.largestProduct.height).toLocaleString() : 0} cm³</span>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-2xl border text-center flex flex-col justify-between">
                        <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Smallest Product</h4>
                        <p className="text-xs font-bold text-primary mt-1">{analytics.smallestProduct ? `${analytics.smallestProduct.name} (${analytics.smallestProduct.length}x${analytics.smallestProduct.width}x${analytics.smallestProduct.height} cm)` : "None"}</p>
                        <span className="text-[10px] text-slate-500 font-mono">Vol: {analytics.smallestProduct ? (analytics.smallestProduct.length * analytics.smallestProduct.width * analytics.smallestProduct.height).toLocaleString() : 0} cm³</span>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-2xl border text-center flex flex-col justify-between">
                        <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Average Product Vol</h4>
                        <p className="text-xl font-extrabold text-primary mt-1">{analytics.avgVolume.toLocaleString()} cm³</p>
                        <span className="text-[9px] text-slate-400">Total catalog average</span>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-2xl border text-center flex flex-col justify-between">
                        <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Most Used Box Type</h4>
                        <p className="text-sm font-extrabold text-emerald-600 mt-1">{analytics.mostUsedBox}</p>
                        <span className="text-[9px] text-slate-400">Derived from placed orders</span>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-2xl border text-center flex flex-col justify-between">
                        <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Most Packed Product</h4>
                        <p className="text-xs font-bold text-primary mt-1 truncate" title={analytics.mostPackedProduct}>{analytics.mostPackedProduct}</p>
                        <span className="text-[10px] text-slate-500">Cat: {analytics.mostPopularCategory}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between px-4">
                        <div>
                          <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Space Utilization</h4>
                          <p className="text-2xl font-black text-primary mt-0.5">{analytics.avgSpaceUtil}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Packing Efficiency</h4>
                          <p className="text-2xl font-black text-primary mt-0.5">{analytics.avgPackingEfficiency}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-secondary/25 p-3 rounded-2xl border">
                        <div className="text-left">
                          <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Packing Efficiency Trend</h4>
                          <span className="text-[9px] text-slate-400">Last 7 orders path</span>
                        </div>
                        <svg className="w-32 h-10 text-emerald-500" viewBox="0 0 100 30" fill="none">
                          <path
                            d={`M 0,${30 - (analytics.efficiencyTrend[0] || 70) * 0.3} 
                               L 20,${30 - (analytics.efficiencyTrend[1] || 72) * 0.3} 
                               L 40,${30 - (analytics.efficiencyTrend[2] || 70) * 0.3} 
                               L 60,${30 - (analytics.efficiencyTrend[3] || 75) * 0.3} 
                               L 80,${30 - (analytics.efficiencyTrend[4] || 74) * 0.3} 
                               L 100,${30 - (analytics.efficiencyTrend[5] || 78) * 0.3}`}
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="100" cy={30 - (analytics.efficiencyTrend[5] || 78) * 0.3} r="3" fill="currentColor" />
                        </svg>
                      </div>
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
                      <button
                        type="button"
                        onClick={() => { setSubTab("boxes"); setInventorySearch(""); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          subTab === "boxes" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        Packaging Dimensions Manager 📐
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder={subTab === "products" ? "Search Name or SKU..." : subTab === "boxes" ? "Search Box Style/Name..." : "Search Material name..."}
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
                      {subTab === "products" && (
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

                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Length (cm)</Label>
                                <Input 
                                  type="number"
                                  step="any"
                                  value={prodLength} 
                                  onChange={(e) => {
                                    setProdLength(e.target.value);
                                    setErrors(prev => ({ ...prev, prodLength: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {errors.prodLength && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.prodLength}</p>}
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Width (cm)</Label>
                                <Input 
                                  type="number"
                                  step="any"
                                  value={prodWidth} 
                                  onChange={(e) => {
                                    setProdWidth(e.target.value);
                                    setErrors(prev => ({ ...prev, prodWidth: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {errors.prodWidth && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.prodWidth}</p>}
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Height (cm)</Label>
                                <Input 
                                  type="number"
                                  step="any"
                                  value={prodHeight} 
                                  onChange={(e) => {
                                    setProdHeight(e.target.value);
                                    setErrors(prev => ({ ...prev, prodHeight: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {errors.prodHeight && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.prodHeight}</p>}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Weight (g)</Label>
                                <Input 
                                  type="number"
                                  step="any"
                                  value={prodWeight} 
                                  onChange={(e) => {
                                    setProdWeight(e.target.value);
                                    setErrors(prev => ({ ...prev, prodWeight: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {errors.prodWeight && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.prodWeight}</p>}
                              </div>
                              <div className="flex items-center gap-2 pt-6">
                                <input 
                                  type="checkbox" 
                                  id="prodFragile" 
                                  checked={prodFragile} 
                                  onChange={(e) => setProdFragile(e.target.checked)} 
                                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="prodFragile" className="font-semibold text-xs text-primary cursor-pointer">Fragile Product</Label>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-white h-10 font-semibold text-xs shadow-md">
                                {editingProduct ? "Save Changes" : "Add Product"}
                              </Button>
                              {editingProduct && (
                                <Button type="button" variant="outline" onClick={() => { setEditingProduct(null); setProdName(""); setProdPrice(""); setProdStock(""); setProdLength(""); setProdWidth(""); setProdHeight(""); setProdWeight(""); setProdFragile(false); setErrors({}); }} className="rounded-xl h-10 text-xs px-3">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </form>
                        </>
                      )}
                      {subTab === "packaging" && (
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
                      {subTab === "boxes" && (
                        <>
                          <h3 className="text-lg font-bold font-heading mb-4 text-primary">
                            {editingBox ? `Edit ${editingBox.name}` : "Add Packaging Box"}
                          </h3>
                          <form onSubmit={handleSaveBox} className="space-y-4">
                            <div className="space-y-1">
                              <Label className="font-semibold text-xs text-primary">Box Name</Label>
                              <Input 
                                placeholder="e.g. Royal Gold Premium Box" 
                                value={boxName} 
                                onChange={(e) => {
                                  setBoxName(e.target.value);
                                  setBoxErrors(prev => ({ ...prev, boxName: "" }));
                                }} 
                                className="rounded-xl h-10 text-xs" 
                              />
                              {boxErrors.boxName && <p className="text-xs text-rose-600 font-semibold mt-1">{boxErrors.boxName}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Length (cm)</Label>
                                <Input 
                                  type="number"
                                  step="any"
                                  value={boxLength} 
                                  onChange={(e) => {
                                    setBoxLength(e.target.value);
                                    setBoxErrors(prev => ({ ...prev, boxLength: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {boxErrors.boxLength && <p className="text-[10px] text-rose-600 font-semibold mt-1">{boxErrors.boxLength}</p>}
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Width (cm)</Label>
                                <Input 
                                  type="number"
                                  step="any"
                                  value={boxWidth} 
                                  onChange={(e) => {
                                    setBoxWidth(e.target.value);
                                    setBoxErrors(prev => ({ ...prev, boxWidth: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {boxErrors.boxWidth && <p className="text-[10px] text-rose-600 font-semibold mt-1">{boxErrors.boxWidth}</p>}
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Height (cm)</Label>
                                <Input 
                                  type="number"
                                  step="any"
                                  value={boxHeight} 
                                  onChange={(e) => {
                                    setBoxHeight(e.target.value);
                                    setBoxErrors(prev => ({ ...prev, boxHeight: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {boxErrors.boxHeight && <p className="text-[10px] text-rose-600 font-semibold mt-1">{boxErrors.boxHeight}</p>}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Max Weight (g)</Label>
                                <Input 
                                  type="number" 
                                  step="any"
                                  value={boxMaxWeight} 
                                  onChange={(e) => {
                                    setBoxMaxWeight(e.target.value);
                                    setBoxErrors(prev => ({ ...prev, boxMaxWeight: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {boxErrors.boxMaxWeight && <p className="text-xs text-rose-600 font-semibold mt-1">{boxErrors.boxMaxWeight}</p>}
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Cost (₹)</Label>
                                <Input 
                                  type="number" 
                                  value={boxCost} 
                                  onChange={(e) => {
                                    setBoxCost(e.target.value);
                                    setBoxErrors(prev => ({ ...prev, boxCost: "" }));
                                  }} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                                {boxErrors.boxCost && <p className="text-xs text-rose-600 font-semibold mt-1">{boxErrors.boxCost}</p>}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Style</Label>
                                <Input 
                                  value={boxStyle} 
                                  onChange={(e) => setBoxStyle(e.target.value)} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Theme</Label>
                                <Input 
                                  value={boxPackagingTheme} 
                                  onChange={(e) => setBoxPackagingTheme(e.target.value)} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Ribbon Style</Label>
                                <Input 
                                  value={boxRibbonStyle} 
                                  onChange={(e) => setBoxRibbonStyle(e.target.value)} 
                                  className="rounded-xl h-10 text-xs" 
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="font-semibold text-xs text-primary">Ribbon Hex</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    type="color" 
                                    value={boxRibbonHex} 
                                    onChange={(e) => setBoxRibbonHex(e.target.value)} 
                                    className="w-10 p-0 h-10 rounded-xl cursor-pointer border-0" 
                                  />
                                  <Input 
                                    value={boxRibbonHex} 
                                    onChange={(e) => setBoxRibbonHex(e.target.value)} 
                                    className="flex-1 rounded-xl h-10 text-xs uppercase" 
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="font-semibold text-xs text-primary">Occasions</Label>
                              <Input 
                                value={boxOccasions} 
                                onChange={(e) => setBoxOccasions(e.target.value)} 
                                className="rounded-xl h-10 text-xs" 
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-white h-10 font-semibold text-xs shadow-md">
                                {editingBox ? "Save Changes" : "Add Box"}
                              </Button>
                              {editingBox && (
                                <Button type="button" variant="outline" onClick={() => { setEditingBox(null); setBoxName(""); setBoxLength(""); setBoxWidth(""); setBoxHeight(""); setBoxMaxWeight(""); setBoxCost(""); setBoxStyle("Classic Luxury Rigid"); setBoxRibbonStyle("Gold Satin Ribbon"); setBoxRibbonHex("#D4AF37"); setBoxPackagingTheme("Royal Luxury"); setBoxOccasions("birthday,anniversary,wedding,corporate"); setBoxErrors({}); }} className="rounded-xl h-10 text-xs px-3">
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
                      {subTab === "products" && (
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
                                        <span className="font-bold text-primary block">
                                          {p.name} {p.fragile && <Badge className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50 text-[9px] scale-90 px-1 py-0 ml-1">Fragile</Badge>}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">{p.category} · {p.size} Size · ₹{p.price}</span>
                                        <span className="text-[10px] text-slate-500 font-mono block">
                                          {p.length || 0} × {p.width || 0} × {p.height || 0} cm · {p.weight || 0}g
                                        </span>
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
                      )}
                      {subTab === "packaging" && (
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
                      {subTab === "boxes" && (
                        <>
                          <h3 className="text-lg font-bold font-heading mb-4 text-primary">Packaging Boxes Configuration</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-border text-slate-400 font-bold">
                                  <th className="py-2.5 px-2">Box Name</th>
                                  <th className="py-2.5 px-2">Dimensions (L x W x H)</th>
                                  <th className="py-2.5 px-2">Max Weight</th>
                                  <th className="py-2.5 px-2">Volume</th>
                                  <th className="py-2.5 px-2">Cost</th>
                                  <th className="py-2.5 px-2">Theme & Style</th>
                                  <th className="py-2.5 px-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredBoxes.map((b) => (
                                  <tr key={b.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                                    <td className="py-3 px-2">
                                      <span className="font-bold text-primary block">{b.name}</span>
                                      <span className="text-[10px] text-slate-400 block">Occasions: {b.occasions}</span>
                                    </td>
                                    <td className="py-3 px-2 font-mono font-medium text-slate-700">
                                      {b.length} × {b.width} × {b.height} cm
                                    </td>
                                    <td className="py-3 px-2 font-semibold text-slate-500">{b.maxWeight} g</td>
                                    <td className="py-3 px-2 font-mono text-slate-600">{(b.volume || 0).toLocaleString()} cm³</td>
                                    <td className="py-3 px-2 font-bold text-emerald-600">₹{b.cost}</td>
                                    <td className="py-3 px-2">
                                      <span className="block font-medium text-primary">{b.style}</span>
                                      <span className="block text-[10px] text-slate-400">{b.packagingTheme}</span>
                                      <span className="inline-block w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: b.ribbonHex }} title={b.ribbonStyle} />
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="xs" onClick={() => handleEditBoxClick(b)} className="h-7 w-7 p-0 rounded-full hover:bg-white border"><Edit3 className="w-3.5 h-3.5 text-slate-600" /></Button>
                                        <Button variant="ghost" size="xs" onClick={() => handleDeleteBox(b.id)} className="h-7 w-7 p-0 rounded-full hover:bg-white border text-rose-600 border-rose-100"><Trash2 className="w-3.5 h-3.5" /></Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. LAYOUT TEMPLATES CONFIGURATION */}
              {activeTab === "layouts" && (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* LEFT COLUMN: Edit layout template form */}
                  <div className="bg-card border rounded-3xl p-6 shadow-sm h-fit">
                    <h3 className="text-lg font-bold font-heading mb-4 text-primary">
                      {editingTemplate ? `Modify Behavior: ${editingTemplate.name}` : "Select a Template to Edit"}
                    </h3>
                    
                    {editingTemplate ? (
                      <form onSubmit={handleSaveTemplate} className="space-y-4">
                        <div className="p-3 bg-secondary/25 border rounded-2xl mb-2 text-xs">
                          <p className="font-semibold text-primary">Current Rule Set</p>
                          <p className="text-muted-foreground mt-0.5">{editingTemplate.description || "Configure constraints for this packing algorithm style."}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="font-semibold text-xs text-primary">Min Spacing (cm)</Label>
                            <Input 
                              type="number" 
                              step="any"
                              value={tplMinSpacing} 
                              onChange={(e) => {
                                setTplMinSpacing(e.target.value);
                                setTemplateErrors(prev => ({ ...prev, tplMinSpacing: "" }));
                              }} 
                              className="rounded-xl h-10 text-xs" 
                            />
                            {templateErrors.tplMinSpacing && <p className="text-xs text-rose-600 font-semibold mt-1">{templateErrors.tplMinSpacing}</p>}
                          </div>
                          <div className="space-y-1">
                            <Label className="font-semibold text-xs text-primary">Fragile Buffer (cm)</Label>
                            <Input 
                              type="number" 
                              step="any"
                              value={tplFragileBuffer} 
                              onChange={(e) => {
                                setTplFragileBuffer(e.target.value);
                                setTemplateErrors(prev => ({ ...prev, tplFragileBuffer: "" }));
                              }} 
                              className="rounded-xl h-10 text-xs" 
                            />
                            {templateErrors.tplFragileBuffer && <p className="text-xs text-rose-600 font-semibold mt-1">{templateErrors.tplFragileBuffer}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="font-semibold text-xs text-primary">Alignment Preference</Label>
                            <select 
                              value={tplAlignment} 
                              onChange={(e) => setTplAlignment(e.target.value)} 
                              className="w-full rounded-xl h-10 border px-3 text-xs bg-white"
                            >
                              <option value="center">Center-Focused</option>
                              <option value="left">Left-Aligned</option>
                              <option value="right">Right-Aligned</option>
                              <option value="symmetrical">Symmetrical Grid</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="font-semibold text-xs text-primary">Placement Zone</Label>
                            <select 
                              value={tplPlacementZone} 
                              onChange={(e) => setTplPlacementZone(e.target.value)} 
                              className="w-full rounded-xl h-10 border px-3 text-xs bg-white"
                            >
                              <option value="radial">Radial Shell</option>
                              <option value="corners">Outer Boundaries</option>
                              <option value="rows">Linear Rows</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input 
                            type="checkbox" 
                            id="tplAllowRotation" 
                            checked={tplAllowRotation} 
                            onChange={(e) => setTplAllowRotation(e.target.checked)} 
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="tplAllowRotation" className="font-semibold text-xs text-primary cursor-pointer">Allow Product Rotation (90°)</Label>
                        </div>

                        <div className="space-y-1">
                          <Label className="font-semibold text-xs text-primary">Algorithmic Description</Label>
                          <textarea 
                            value={tplDescription} 
                            onChange={(e) => setTplDescription(e.target.value)} 
                            className="w-full rounded-xl border p-2 text-xs h-20 bg-white"
                            placeholder="Describe how this layout behaves..."
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-white h-10 font-semibold text-xs shadow-md">
                            Save Configuration
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => { 
                              setEditingTemplate(null); 
                              setTplMinSpacing(""); 
                              setTplFragileBuffer(""); 
                              setTplAllowRotation(true); 
                              setTplAlignment("center"); 
                              setTplPlacementZone("radial"); 
                              setTplDescription(""); 
                              setTemplateErrors({}); 
                            }} 
                            className="rounded-xl h-10 text-xs px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>Please select a layout template from the table to start editing its parameters.</p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: Table listing templates */}
                  <div className="lg:col-span-2 bg-card border rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold font-heading mb-4 text-primary">Available Layout Schemes</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border text-slate-400 font-bold">
                            <th className="py-2.5 px-2">Template Style</th>
                            <th className="py-2.5 px-2">Min Spacing</th>
                            <th className="py-2.5 px-2">Fragile Buffer</th>
                            <th className="py-2.5 px-2">Rotation Checked</th>
                            <th className="py-2.5 px-2">Logic Align & Zone</th>
                            <th className="py-2.5 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {layoutTemplates.map((t) => (
                            <tr key={t.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                              <td className="py-3 px-2">
                                <span className="font-bold text-primary block">{t.name}</span>
                                <span className="text-[10px] text-slate-400 block">{t.description}</span>
                              </td>
                              <td className="py-3 px-2 font-bold text-slate-700">{t.minSpacing} cm</td>
                              <td className="py-3 px-2 font-bold text-rose-600">{t.fragileBuffer} cm</td>
                              <td className="py-3 px-2">
                                {t.allowRotation ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[8px] font-bold uppercase">Enabled</Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-800 border-slate-200 text-[8px] font-bold uppercase">Disabled</Badge>
                                )}
                              </td>
                              <td className="py-3 px-2 uppercase font-mono font-medium text-accent">
                                {t.alignmentPreference} · {t.preferredPlacementZone}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="xs" 
                                  onClick={() => handleStartEditTemplate(t)} 
                                  className="h-7 w-7 p-0 rounded-full hover:bg-white border"
                                  title="Edit Template Properties"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                </Button>
                              </td>
                            </tr>
                          ))}
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