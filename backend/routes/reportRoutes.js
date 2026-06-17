const express = require("express");
const router = express.Router();
const { Order, Product, PackagingMaterial, ProductionStage, CRMContact, User } = require("../models");
const { requireAdmin } = require("../middleware/auth");

router.use(requireAdmin);

// Orders Report Summary
router.get("/reports/orders", async (req, res) => {
  try {
    const orders = await Order.findAll();
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    const statusBreakdown = {};
    orders.forEach(o => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    });

    res.json({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusBreakdown,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Inventory Report Summary
router.get("/reports/inventory", async (req, res) => {
  try {
    const products = await Product.findAll();
    const packaging = await PackagingMaterial.findAll();

    const productValuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minThreshold).length +
                          packaging.filter(p => p.availableQty <= p.minThreshold).length;

    res.json({
      productCount: products.length,
      packagingCount: packaging.length,
      productValuation,
      lowStockCount,
      products,
      packaging
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Production Operations Report Summary
router.get("/reports/production", async (req, res) => {
  try {
    const stages = await ProductionStage.findAll();
    
    const stageCounts = {};
    const statusCounts = {};
    
    stages.forEach(s => {
      stageCounts[s.stage] = (stageCounts[s.stage] || 0) + 1;
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    });

    res.json({
      totalStagesLogged: stages.length,
      stageCounts,
      statusCounts,
      stages
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CRM Customer Report Summary
router.get("/reports/crm", async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "customer" },
      include: [{ model: Order, as: "orders" }]
    });

    const reportData = users.map(u => ({
      username: u.username,
      email: u.email,
      totalOrders: u.orders ? u.orders.length : 0,
      totalValue: u.orders ? u.orders.reduce((sum, o) => sum + o.totalPrice, 0) : 0
    }));

    res.json({
      totalCustomers: users.length,
      customers: reportData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Occasion Reminders Report Summary
router.get("/reports/reminders", async (req, res) => {
  try {
    const reminders = await CRMContact.findAll();
    
    const sentCount = reminders.filter(r => r.status === "Sent" || r.reminderSent).length;
    const pendingCount = reminders.filter(r => r.status === "Pending").length;
    const scheduledCount = reminders.filter(r => r.status === "Scheduled").length;

    res.json({
      totalReminders: reminders.length,
      sentCount,
      pendingCount,
      scheduledCount,
      reminders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
