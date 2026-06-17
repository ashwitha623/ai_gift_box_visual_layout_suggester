const express = require("express");
const router = express.Router();
const { Notification, User } = require("../models");
const { optionalUser } = require("../middleware/auth");

// Get recent notifications
router.get("/notifications", optionalUser, async (req, res) => {
  try {
    const filter = {};
    if (req.userRole !== "admin") {
      if (!req.userId) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }
      filter.userId = req.userId;
    }

    const notifications = await Notification.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["username", "email"] }]
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark notification as read
putEndpoint = router.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    await notification.update({ status: "Read" });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

