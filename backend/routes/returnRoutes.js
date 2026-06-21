const express = require("express");
const router = express.Router();
const { Return, Order } = require("../models");
const { requireAdmin, optionalUser } = require("../middleware/auth");

// Get all return requests (Admin gets all, Customer gets only their own)
router.get("/returns", optionalUser, async (req, res) => {
  try {
    const orderFilter = {};
    if (req.userRole !== "admin") {
      if (!req.userId) {
        return res.status(403).json({ success: false, message: "Access Denied: Please sign in." });
      }
      orderFilter.userId = req.userId;
    }

    const returns = await Return.findAll({
      include: [{
        model: Order,
        as: "order",
        where: orderFilter
      }]
    });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// File return request
router.post("/returns", async (req, res) => {
  try {
    const { orderId, type, reason } = req.body;
    
    // Validate if the order exists (lookup by numerical ID or tracking ID string)
    let order = null;
    if (orderId && !isNaN(orderId)) {
      order = await Order.findByPk(parseInt(orderId));
    }
    if (!order && orderId) {
      order = await Order.findOne({ where: { trackingId: String(orderId).trim() } });
    }

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: `Order "${orderId}" does not exist in our system.` 
      });
    }

    const request = await Return.create({
      orderId: order.id,
      type, // 'Return', 'Replacement', 'Refund'
      reason,
      status: "Pending"
    });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve/Reject return request (Admin)
router.put("/returns/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // 'Approved', 'Rejected'
    const request = await Return.findByPk(id);
    if (!request) return res.status(404).json({ success: false, message: "Return request not found" });

    await request.update({ status, adminNotes });
    
    // Update order status if approved
    if (status === "Approved") {
      const order = await Order.findByPk(request.orderId);
      if (order) {
        if (request.type === "Refund") {
          await order.update({ paymentStatus: "Refunded" });
        } else {
          await order.update({ status: `Return (${request.type})` });
        }
      }
    }

    res.json({ success: true, message: `Return request status updated to ${status}`, request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
