const express = require("express");
const router = express.Router();
const { Product, PackagingMaterial } = require("../models");
const { requireAdmin } = require("../middleware/auth");

// Get full inventory (Products and Packaging)
router.get("/inventory", async (req, res) => {
  try {
    const products = await Product.findAll();
    const packaging = await PackagingMaterial.findAll();
    res.json({ products, packaging });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update product stock adjustment
router.post("/inventory/product/:id/adjust", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment } = req.body; // positive or negative integer
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const newStock = Math.max(0, product.stock + parseInt(adjustment));
    await product.update({ stock: newStock });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get inventory alert metrics
router.get("/inventory/alerts", async (req, res) => {
  try {
    const products = await Product.findAll();
    const packaging = await PackagingMaterial.findAll();

    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minThreshold);
    const outStockProducts = products.filter(p => p.stock === 0);

    const lowStockPackaging = packaging.filter(p => p.availableQty > 0 && p.availableQty <= p.minThreshold);
    const outStockPackaging = packaging.filter(p => p.availableQty === 0);

    res.json({
      lowStockProducts,
      outStockProducts,
      lowStockPackaging,
      outStockPackaging,
      totalLowCount: lowStockProducts.length + lowStockPackaging.length,
      totalOutCount: outStockProducts.length + outStockPackaging.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Packaging material CRUD
router.post("/inventory/packaging", requireAdmin, async (req, res) => {
  try {
    const { name, type, sku, availableQty, minThreshold } = req.body;
    
    // Status calculation
    let status = "In Stock";
    if (availableQty === 0) status = "Out Of Stock";
    else if (availableQty <= minThreshold) status = "Low Stock";

    const item = await PackagingMaterial.create({
      name, type, sku, availableQty, minThreshold, status
    });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/inventory/packaging/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, sku, availableQty, minThreshold } = req.body;
    const item = await PackagingMaterial.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    let status = "In Stock";
    if (availableQty === 0) status = "Out Of Stock";
    else if (availableQty <= minThreshold) status = "Low Stock";

    await item.update({ name, type, sku, availableQty, minThreshold, status });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/inventory/packaging/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PackagingMaterial.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    await item.destroy();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
