import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, Download, FileText, Calendar, ShoppingBag, Package, RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { exportReportPDF } from "@/lib/exportReport";

export default function ReportsExports() {
  const [reportType, setReportType] = useState("orders"); // 'orders', 'inventory', 'production', 'crm', 'reminders'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/reports/${reportType}`);
      setReportData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load report analytics.", variant: "destructive" });
      setLoading(false);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (!reportData) return;

    let headers = [];
    let rows = [];
    let filename = `paper-plane-${reportType}-report.csv`;

    if (reportType === "orders") {
      headers = ["Order Code", "Payment Status", "Fulfillment Status", "Price (INR)", "Box Size", "Placed Date"];
      rows = (reportData.orders || []).map(o => [
        o.trackingId,
        o.paymentStatus,
        o.status,
        o.totalPrice,
        o.boxSize,
        new Date(o.createdAt || Date.now()).toLocaleDateString()
      ]);
    } else if (reportType === "inventory") {
      headers = ["Product/Material Name", "SKU Code", "Category/Type", "Available Stock", "Min Threshold"];
      const productsRow = (reportData.products || []).map(p => [p.name, p.sku || "—", p.category, p.stock, p.minThreshold]);
      const packagingRow = (reportData.packaging || []).map(p => [p.name, p.sku, p.type, p.availableQty, p.minThreshold]);
      rows = [...productsRow, ...packagingRow];
    } else if (reportType === "production") {
      headers = ["Order Code", "Stage Phase", "Employee Assigned", "Stage Status", "Start Date", "End Date"];
      rows = (reportData.stages || []).map(s => [
        s.order?.trackingId || `#${s.orderId}`,
        s.stage,
        s.assignedEmployee || "Unassigned",
        s.status,
        s.startDate ? new Date(s.startDate).toLocaleDateString() : "—",
        s.completionDate ? new Date(s.completionDate).toLocaleDateString() : "—"
      ]);
    } else if (reportType === "crm") {
      headers = ["Customer Username", "Email", "Total Orders Count", "Total Revenue Spend (INR)"];
      rows = (reportData.customers || []).map(c => [
        c.username,
        c.email,
        c.totalOrders,
        c.totalValue
      ]);
    } else if (reportType === "reminders") {
      headers = ["Occasion Contact", "Relationship", "Occasion Type", "Target Milestone Date", "Reminder Status"];
      rows = (reportData.reminders || []).map(r => [
        r.name,
        r.relationship,
        r.occasionType,
        r.occasionDate,
        r.status
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "CSV Exported", description: `${filename} downloaded successfully.` });
  };

  // Excel Exporter
  const handleExportExcel = () => {
    if (!reportData) return;

    let headers = [];
    let rows = [];
    let filename = `paper-plane-${reportType}-report.xls`;

    if (reportType === "orders") {
      headers = ["Order Code", "Payment Status", "Fulfillment Status", "Price (INR)", "Box Size", "Placed Date"];
      rows = (reportData.orders || []).map(o => [
        o.trackingId,
        o.paymentStatus,
        o.status,
        o.totalPrice,
        o.boxSize,
        new Date(o.createdAt || Date.now()).toLocaleDateString()
      ]);
    } else if (reportType === "inventory") {
      headers = ["Product/Material Name", "SKU Code", "Category/Type", "Available Stock", "Min Threshold"];
      const productsRow = (reportData.products || []).map(p => [p.name, p.sku || "—", p.category, p.stock, p.minThreshold]);
      const packagingRow = (reportData.packaging || []).map(p => [p.name, p.sku, p.type, p.availableQty, p.minThreshold]);
      rows = [...productsRow, ...packagingRow];
    } else if (reportType === "production") {
      headers = ["Order Code", "Stage Phase", "Employee Assigned", "Stage Status", "Start Date", "End Date"];
      rows = (reportData.stages || []).map(s => [
        s.order?.trackingId || `#${s.orderId}`,
        s.stage,
        s.assignedEmployee || "Unassigned",
        s.status,
        s.startDate ? new Date(s.startDate).toLocaleDateString() : "—",
        s.completionDate ? new Date(s.completionDate).toLocaleDateString() : "—"
      ]);
    } else if (reportType === "crm") {
      headers = ["Customer Username", "Email", "Total Orders Count", "Total Revenue Spend (INR)"];
      rows = (reportData.customers || []).map(c => [
        c.username,
        c.email,
        c.totalOrders,
        c.totalValue
      ]);
    } else if (reportType === "reminders") {
      headers = ["Occasion Contact", "Relationship", "Occasion Type", "Target Milestone Date", "Reminder Status"];
      rows = (reportData.reminders || []).map(r => [
        r.name,
        r.relationship,
        r.occasionType,
        r.occasionDate,
        r.status
      ]);
    }

    // Build simple HTML table for Excel fallback
    let tableHtml = `<table border="1"><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>`;
    rows.forEach(r => {
      tableHtml += `<tr>${r.map(val => `<td>${val}</td>`).join("")}</tr>`;
    });
    tableHtml += `</tbody></table>`;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Excel Exported", description: `${filename} downloaded successfully.` });
  };

  const handleExportPDF = () => {
    const element = document.getElementById("report-preview-content");
    if (!element) return;
    exportReportPDF(element, `${reportType} Report`);
    toast({ title: "PDF Generated", description: "Styled PDF output created successfully." });
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Reports & Exports Desk</h1>
            <p className="text-muted-foreground mt-2">Generate professional audits for orders, inventory logs, Kanban teams workflow steps, and calendars.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline" className="rounded-xl border text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 h-10 px-3.5">
              <Download className="w-4 h-4 text-accent" /> Export CSV
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="rounded-xl border text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 h-10 px-3.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Excel
            </Button>
            <Button onClick={handleExportPDF} className="rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-semibold flex items-center gap-1.5 h-10 px-4">
              <FileText className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Report Category Selectors */}
        <div className="flex gap-2 border-b pb-4 overflow-x-auto">
          {[
            { id: "orders", label: "Orders Report 🛍️" },
            { id: "inventory", label: "Inventory Report 🛠️" },
            { id: "production", label: "Production Report ⚙️" },
            { id: "crm", label: "CRM Report 👥" },
            { id: "reminders", label: "Occasion Reminders 📅" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                reportType === t.id ? "bg-primary text-white" : "bg-white border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Live Preview Area */}
        {loading ? (
          <div className="text-center py-20 text-xs">Compiling report data...</div>
        ) : (
          <div id="report-preview-content" className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Report Title Card */}
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-primary text-2xl uppercase tracking-tight">{reportType} Analytics Report</h3>
                <p className="text-xs text-muted-foreground mt-1">Generated Date: <strong>{new Date().toLocaleString()}</strong> · Status: **Verified**</p>
              </div>
              <BarChart2 className="w-8 h-8 text-accent" />
            </div>

            {/* Metrics cards inside reports */}
            {reportType === "orders" && reportData && (
              <div className="grid grid-cols-3 gap-4 bg-secondary/15 p-4 rounded-2xl border">
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Sales Price</span>
                  <span className="text-lg font-bold text-primary block">₹{reportData.totalRevenue?.toLocaleString()}</span>
                </div>
                <div className="text-center border-x">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Orders Placed</span>
                  <span className="text-lg font-bold text-primary block">{reportData.totalOrders}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average Cart Value</span>
                  <span className="text-lg font-bold text-emerald-600 block">₹{reportData.avgOrderValue?.toLocaleString()}</span>
                </div>
              </div>
            )}

            {reportType === "inventory" && reportData && (
              <div className="grid grid-cols-3 gap-4 bg-secondary/15 p-4 rounded-2xl border">
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Products Types</span>
                  <span className="text-lg font-bold text-primary block">{reportData.productCount} Items</span>
                </div>
                <div className="text-center border-x">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Packaging Types</span>
                  <span className="text-lg font-bold text-primary block">{reportData.packagingCount} Materials</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Catalog Valuation</span>
                  <span className="text-lg font-bold text-emerald-600 block">₹{reportData.productValuation?.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Preview Tables */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                
                {/* 1. ORDERS */}
                {reportType === "orders" && (
                  <>
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold">
                        <th className="py-2.5 px-3">Order Code</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Fulfillment Status</th>
                        <th className="py-2.5 px-3">Cost Value</th>
                        <th className="py-2.5 px-3">Box Size</th>
                        <th className="py-2.5 px-3 text-right">Placed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.orders || []).map(o => (
                        <tr key={o.id} className="border-b hover:bg-secondary/20">
                          <td className="py-3 px-3 font-bold text-primary">{o.trackingId}</td>
                          <td className="py-3 px-3 font-medium">{o.paymentStatus}</td>
                          <td className="py-3 px-3"><Badge className="bg-white border text-primary text-[8px] font-bold uppercase">{o.status}</Badge></td>
                          <td className="py-3 px-3 font-bold text-slate-700">₹{o.totalPrice}</td>
                          <td className="py-3 px-3 text-slate-500">{o.boxSize}</td>
                          <td className="py-3 px-3 text-right text-slate-400">{new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 2. INVENTORY */}
                {reportType === "inventory" && (
                  <>
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold">
                        <th className="py-2.5 px-3">Product/Material</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Type/Category</th>
                        <th className="py-2.5 px-3">Available Stock</th>
                        <th className="py-2.5 px-3 text-right">Min Threshold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.products || []).map(p => (
                        <tr key={`p-${p.id}`} className="border-b hover:bg-secondary/20">
                          <td className="py-3 px-3 font-bold text-primary">{p.name}</td>
                          <td className="py-3 px-3 font-semibold text-accent">{p.sku || `PRD-GEN-${p.id}`}</td>
                          <td className="py-3 px-3 text-slate-500">Product ({p.category})</td>
                          <td className="py-3 px-3 font-bold text-slate-700">{p.stock}</td>
                          <td className="py-3 px-3 text-right text-slate-400">{p.minThreshold || 5}</td>
                        </tr>
                      ))}
                      {(reportData.packaging || []).map(item => (
                        <tr key={`pck-${item.id}`} className="border-b hover:bg-secondary/20">
                          <td className="py-3 px-3 font-bold text-primary">{item.name}</td>
                          <td className="py-3 px-3 font-semibold text-accent">{item.sku}</td>
                          <td className="py-3 px-3 text-slate-500">Packaging ({item.type})</td>
                          <td className="py-3 px-3 font-bold text-slate-700">{item.availableQty}</td>
                          <td className="py-3 px-3 text-right text-slate-400">{item.minThreshold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 3. PRODUCTION */}
                {reportType === "production" && (
                  <>
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold">
                        <th className="py-2.5 px-3">Order Code</th>
                        <th className="py-2.5 px-3">Workflow Stage</th>
                        <th className="py-2.5 px-3">Team Assignment</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Start Date</th>
                        <th className="py-2.5 px-3 text-right">End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.stages || []).map(s => (
                        <tr key={s.id} className="border-b hover:bg-secondary/20">
                          <td className="py-3 px-3 font-bold text-primary">{s.order?.trackingId || `#${s.orderId}`}</td>
                          <td className="py-3 px-3 font-semibold">{s.stage}</td>
                          <td className="py-3 px-3 font-medium text-slate-600">{s.assignedEmployee || "Unassigned"}</td>
                          <td className="py-3 px-3"><Badge className="bg-white border text-primary text-[8px] font-bold uppercase">{s.status}</Badge></td>
                          <td className="py-3 px-3 text-slate-400">{s.startDate ? new Date(s.startDate).toLocaleDateString() : "—"}</td>
                          <td className="py-3 px-3 text-right text-slate-400">{s.completionDate ? new Date(s.completionDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 4. CRM */}
                {reportType === "crm" && (
                  <>
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold">
                        <th className="py-2.5 px-3">Username</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Total Orders Count</th>
                        <th className="py-2.5 px-3 text-right">Total Revenue Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.customers || []).map((c, idx) => (
                        <tr key={idx} className="border-b hover:bg-secondary/20">
                          <td className="py-3 px-3 font-bold text-primary">{c.username}</td>
                          <td className="py-3 px-3 font-medium text-slate-500">{c.email}</td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{c.totalOrders} Placed</td>
                          <td className="py-3 px-3 text-right font-extrabold text-primary">₹{c.totalValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 5. REMINDERS */}
                {reportType === "reminders" && (
                  <>
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold">
                        <th className="py-2.5 px-3">Recipient Name</th>
                        <th className="py-2.5 px-3">Relationship</th>
                        <th className="py-2.5 px-3">Occasion Type</th>
                        <th className="py-2.5 px-3">Milestone Date</th>
                        <th className="py-2.5 px-3 text-right">Reminder Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.reminders || []).map(r => (
                        <tr key={r.id} className="border-b hover:bg-secondary/20">
                          <td className="py-3 px-3 font-bold text-primary">{r.name}</td>
                          <td className="py-3 px-3 text-slate-500 font-medium">{r.relationship}</td>
                          <td className="py-3 px-3 font-semibold capitalize">{r.occasionType}</td>
                          <td className="py-3 px-3 font-medium text-slate-700">{r.occasionDate}</td>
                          <td className="py-3 px-3 text-right"><Badge className="bg-white border text-primary text-[8px] font-bold uppercase">{r.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
