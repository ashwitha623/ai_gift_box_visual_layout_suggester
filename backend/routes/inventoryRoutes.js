const express = require("express");
const router = express.Router();
const { Product, PackagingMaterial, PackagingBox, LayoutTemplate } = require("../models");
const { requireAdmin } = require("../middleware/auth");

// Get full inventory (Products, Packaging, Boxes, and Layout Templates)
router.get("/inventory", async (req, res) => {
  try {
    const products = await Product.findAll();
    const packaging = await PackagingMaterial.findAll();
    const boxes = await PackagingBox.findAll();
    const layoutTemplates = await LayoutTemplate.findAll();
    res.json({ products, packaging, boxes, layoutTemplates });
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

// Packaging Boxes CRUD
router.post("/inventory/boxes", requireAdmin, async (req, res) => {
  try {
    const { name, length, width, height, maxWeight, cost, style, ribbonStyle, ribbonHex, packagingTheme, occasions } = req.body;
    const lVal = parseFloat(length) || 0;
    const wVal = parseFloat(width) || 0;
    const hVal = parseFloat(height) || 0;
    const volume = lVal * wVal * hVal;
    
    const box = await PackagingBox.create({
      name,
      length: lVal,
      width: wVal,
      height: hVal,
      maxWeight: parseFloat(maxWeight) || 0,
      volume,
      cost: parseInt(cost) || 300,
      style: style || "Classic Luxury Rigid",
      ribbonStyle: ribbonStyle || "Gold Satin Ribbon",
      ribbonHex: ribbonHex || "#D4AF37",
      packagingTheme: packagingTheme || "Royal Luxury",
      occasions: occasions || "birthday,anniversary,wedding,corporate,graduation,festival,baby_shower,friendship,farewell,just_because"
    });
    res.json({ success: true, box });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/inventory/boxes/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, length, width, height, maxWeight, cost, style, ribbonStyle, ribbonHex, packagingTheme, occasions } = req.body;
    const box = await PackagingBox.findByPk(id);
    if (!box) return res.status(404).json({ success: false, message: "Box configuration not found" });

    const lVal = parseFloat(length) || 0;
    const wVal = parseFloat(width) || 0;
    const hVal = parseFloat(height) || 0;
    const volume = lVal * wVal * hVal;

    await box.update({
      name,
      length: lVal,
      width: wVal,
      height: hVal,
      maxWeight: parseFloat(maxWeight) || 0,
      volume,
      cost: parseInt(cost) || 300,
      style: style || box.style,
      ribbonStyle: ribbonStyle || box.ribbonStyle,
      ribbonHex: ribbonHex || box.ribbonHex,
      packagingTheme: packagingTheme || box.packagingTheme,
      occasions: occasions || box.occasions
    });
    res.json({ success: true, box });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/inventory/boxes/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const box = await PackagingBox.findByPk(id);
    if (!box) return res.status(404).json({ success: false, message: "Box configuration not found" });
    await box.destroy();
    res.json({ success: true, message: "Box configuration deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Layout Templates CRUD
router.get("/inventory/layout-templates", async (req, res) => {
  try {
    const templates = await LayoutTemplate.findAll();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/inventory/layout-templates/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { minSpacing, fragileBuffer, allowRotation, alignmentPreference, preferredPlacementZone, description } = req.body;
    const template = await LayoutTemplate.findByPk(id);
    if (!template) return res.status(404).json({ success: false, message: "Layout template not found" });

    await template.update({
      minSpacing: parseFloat(minSpacing) !== undefined ? parseFloat(minSpacing) : template.minSpacing,
      fragileBuffer: parseFloat(fragileBuffer) !== undefined ? parseFloat(fragileBuffer) : template.fragileBuffer,
      allowRotation: allowRotation !== undefined ? allowRotation : template.allowRotation,
      alignmentPreference: alignmentPreference || template.alignmentPreference,
      preferredPlacementZone: preferredPlacementZone || template.preferredPlacementZone,
      description: description !== undefined ? description : template.description
    });

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
