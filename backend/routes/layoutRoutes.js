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
  layouts.push(req.body);

  res.json({
    success: true,
    message: "Layout Saved Successfully"
  });
});

// Get Layout History
router.get("/layouts", (req, res) => {
  res.json(layouts);
});

module.exports = router;