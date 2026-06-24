const express = require("express");
const router = express.Router();

const layouts = require("../models/layoutData");

// Generate Layout
router.post("/generate-layout", (req, res) => {
  const { occasion, products } = req.body;

  res.json({
    success: true,
    layout: "Circular",
    ribbon: "Pink",
    packaging: "Premium",
    occasion,
    products
  });
});

// Save Layout
router.post("/save-layout", (req, res) => {
  const layoutItem = {
    id: Date.now() + Math.random().toString(36).substring(2, 11),
    ...req.body,
    createdAt: new Date()
  };
  layouts.push(layoutItem);

  res.json({
    success: true,
    message: "Layout Saved Successfully",
    layout: layoutItem
  });
});

// Get Layout History
router.get("/layouts", (req, res) => {
  res.json(layouts);
});

// Delete Layout
router.delete("/layouts/:id", (req, res) => {
  const { id } = req.params;
  const index = layouts.findIndex(l => l.id === id);
  if (index !== -1) {
    layouts.splice(index, 1);
    return res.json({ success: true, message: "Layout Deleted Successfully" });
  }
  // Fallback if id is a numerical index
  const idx = parseInt(id);
  if (!isNaN(idx) && idx >= 0 && idx < layouts.length) {
    layouts.splice(idx, 1);
    return res.json({ success: true, message: "Layout Deleted Successfully" });
  }
  res.status(404).json({ success: false, message: "Layout not found" });
});

module.exports = router;