const express = require("express");
const router = express.Router();
const { Product } = require("../models");
const { requireAdmin } = require("../middleware/auth");

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add new product
router.post("/products", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, size, image, stock } = req.body;
    const product = await Product.create({ name, category, price: parseInt(price), size, image, stock: parseInt(stock) });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Edit product
router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, size, image, stock } = req.body;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    await product.update({ name, category, price: parseInt(price), size, image, stock: parseInt(stock) });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete product
router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    await product.destroy();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get low/out of stock alerts
router.get("/inventory/alerts", requireAdmin, async (req, res) => {
  try {
    const products = await Product.findAll();
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
    const outOfStock = products.filter(p => p.stock === 0);
    res.json({
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStock,
      outOfStock
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
