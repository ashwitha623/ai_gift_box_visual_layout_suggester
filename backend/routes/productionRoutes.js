const express = require("express");
const router = express.Router();
const { ProductionStage, Order, User, Recipient, OrderItem, Product } = require("../models");
const { requireAdmin } = require("../middleware/auth");

// Get all production stages grouped by order
router.get("/production/board", async (req, res) => {
  try {
    const stages = await ProductionStage.findAll({
      include: [{
        model: Order,
        as: "order",
        include: [
          { model: User, as: "user", attributes: ["username", "email"] },
          { model: Recipient, as: "recipient" },
          { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }
        ]
      }]
    });
    res.json(stages);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update status/employee of a specific production stage
router.put("/production/stage/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedEmployee, statusNotes } = req.body; // 'Pending', 'In Progress', 'Completed'
    const stageItem = await ProductionStage.findByPk(id);
    if (!stageItem) return res.status(404).json({ success: false, message: "Production stage not found" });

    const updates = { status };
    if (assignedEmployee !== undefined) updates.assignedEmployee = assignedEmployee;
    if (statusNotes !== undefined) updates.statusNotes = statusNotes;

    // Track timestamps
    if (status === "In Progress" && stageItem.status !== "In Progress") {
      updates.startDate = new Date();
    } else if (status === "Completed" && stageItem.status !== "Completed") {
      if (!stageItem.startDate) {
        updates.startDate = new Date();
      }
      updates.completionDate = new Date();
    }

    await stageItem.update(updates);

    // Sync order stage back to main order status
      const order = await Order.findByPk(stageItem.orderId);
      if (order && status === "In Progress") {
        // Map stages to main Order status
        let mappedStatus = "Order Placed";
        if (stageItem.stage === "Design") mappedStatus = "Customization";
        else if (stageItem.stage === "Production") mappedStatus = "Production";
        else if (stageItem.stage === "Packaging") mappedStatus = "Packaging";
        else if (stageItem.stage === "Quality Check") mappedStatus = "Quality Check";
        else if (stageItem.stage === "Dispatch") mappedStatus = "Dispatch";
        else if (stageItem.stage === "Delivered") mappedStatus = "Delivered";

        const orderUpdates = { status: mappedStatus };
        if (order.paymentMethod === "COD") {
          orderUpdates.paymentStatus = mappedStatus === "Delivered" ? "Paid" : "Pending";
        }
        await order.update(orderUpdates);
      }

    res.json({ success: true, stageItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kanban Drag-and-Drop Order Stage update
router.post("/production/order/:orderId/move", requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { targetStage } = req.body; // e.g. 'Design', 'Production', 'Packaging', 'Quality Check', 'Dispatch', 'Delivered'
    
    // Find all stages for this order
    const orderStages = await ProductionStage.findAll({ where: { orderId } });
    if (orderStages.length === 0) return res.status(404).json({ success: false, message: "No stages found for this order" });

    const stagesInOrder = ["Design", "Production", "Packaging", "Quality Check", "Dispatch", "Delivered"];
    const targetIdx = stagesInOrder.indexOf(targetStage);
    if (targetIdx === -1) return res.status(400).json({ success: false, message: "Invalid target stage" });

    // Update statuses transitively
    for (let stageItem of orderStages) {
      const currentIdx = stagesInOrder.indexOf(stageItem.stage);
      let newStatus = "Pending";
      let startDate = stageItem.startDate;
      let completionDate = stageItem.completionDate;

      if (currentIdx < targetIdx) {
        newStatus = "Completed";
        if (!startDate) startDate = new Date();
        if (!completionDate) completionDate = new Date();
      } else if (currentIdx === targetIdx) {
        newStatus = "In Progress";
        startDate = new Date();
        completionDate = null;
      } else {
        newStatus = "Pending";
        startDate = null;
        completionDate = null;
      }

      await stageItem.update({ status: newStatus, startDate, completionDate });
    }

    // Sync order status
    const order = await Order.findByPk(orderId);
    if (order) {
      let mappedStatus = "Order Placed";
      if (targetStage === "Design") mappedStatus = "Customization";
      else if (targetStage === "Production") mappedStatus = "Production";
      else if (targetStage === "Packaging") mappedStatus = "Packaging";
      else if (targetStage === "Quality Check") mappedStatus = "Quality Check";
      else if (targetStage === "Dispatch") mappedStatus = "Dispatch";
      else if (targetStage === "Delivered") mappedStatus = "Delivered";

      const orderUpdates = { status: mappedStatus };
      if (order.paymentMethod === "COD") {
        orderUpdates.paymentStatus = mappedStatus === "Delivered" ? "Paid" : "Pending";
      }
      await order.update(orderUpdates);
    }

    res.json({ success: true, message: `Order #${orderId} moved to ${targetStage}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
