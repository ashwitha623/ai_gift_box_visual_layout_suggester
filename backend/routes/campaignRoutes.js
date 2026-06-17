const express = require("express");
const router = express.Router();
const { Campaign, User } = require("../models");
const { requireAdmin, optionalUser } = require("../middleware/auth");

// Create Campaign
router.post("/campaigns", async (req, res) => {
  try {
    const { name, corporateId, budget, deliveryDate, employeeListUrl } = req.body;
    const campaign = await Campaign.create({
      name,
      corporateId,
      budget: parseInt(budget),
      deliveryDate,
      employeeListUrl: employeeListUrl || "",
      status: "Scheduled"
    });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all campaigns
router.get("/campaigns", optionalUser, async (req, res) => {
  try {
    const filter = {};
    if (req.userRole !== "admin") {
      if (!req.userId) {
        return res.status(403).json({ success: false, message: "Access Denied: Please sign in." });
      }
      filter.corporateId = req.userId;
    }

    const campaigns = await Campaign.findAll({
      where: filter,
      include: [{ model: User, as: "corporate", attributes: ["id", "username", "email"] }]
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update campaign status
router.put("/campaigns/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const campaign = await Campaign.findByPk(id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    await campaign.update({ status });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
