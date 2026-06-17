const express = require("express");
const router = express.Router();
const { DesignApproval, Order, User, Recipient, OrderItem, Product } = require("../models");
const { optionalUser } = require("../middleware/auth");

// Get all design approvals
router.get("/design-approvals", optionalUser, async (req, res) => {
  try {
    const orderFilter = {};
    if (req.userRole !== "admin") {
      if (!req.userId) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }
      orderFilter.userId = req.userId;
    }

    const approvals = await DesignApproval.findAll({
      include: [{
        model: Order,
        as: "order",
        where: orderFilter,
        include: [
          { model: User, as: "user", attributes: ["username", "email"] },
          { model: Recipient, as: "recipient" },
          { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }
        ]
      }]
    });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update design approval status
router.put("/design-approvals/:id/status", optionalUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, revisionNotes } = req.body;
    const approval = await DesignApproval.findByPk(id);
    if (!approval) return res.status(404).json({ success: false, message: "Approval record not found" });

    // Read history
    let history = [];
    if (approval.history) {
      try {
        history = JSON.parse(approval.history);
      } catch (e) {
        history = [];
      }
    }

    // Push new action to history log
    const userRoleLabel = req.userRole === "admin" ? "Administrator" : "Customer";
    history.push({
      timestamp: new Date().toISOString(),
      action: `Status set to: ${status}`,
      actor: userRoleLabel,
      note: revisionNotes || "No notes submitted."
    });

    await approval.update({
      status,
      revisionNotes,
      history: JSON.stringify(history),
      updatedAt: new Date()
    });

    // Automatically sync back the Order status if Design gets Approved
    const order = await Order.findByPk(approval.orderId);
    if (order) {
      if (status === "Approved" || status === "Final Approved") {
        await order.update({ status: "Packaging" });
      } else if (status === "Revision Requested") {
        await order.update({ status: "Customization" });
      }
    }

    res.json({ success: true, approval });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
