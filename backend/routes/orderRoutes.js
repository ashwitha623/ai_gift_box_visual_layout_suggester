const express = require("express");
const router = express.Router();
const { Order, OrderItem, Recipient, Product, User, DesignApproval, ProductionStage, PackagingMaterial, Notification } = require("../models");
const { requireAdmin, optionalUser } = require("../middleware/auth");

// Create Order (Checkout flow)
router.post("/orders", async (req, res) => {
  try {
    const { userId, products, totalPrice, ribbonColor, boxSize, recipientName, recipientPhone, message, customText, photoUrl, logoUrl, paymentMethod, spaceUtil, packingEfficiency } = req.body;
    
    // Generate mock tracking ID
    const trackingId = "PP-" + Math.floor(100000 + Math.random() * 900000);
    const invoiceUrl = `/invoices/invoice-${trackingId}.pdf`;

    // Create order summary
    const order = await Order.create({
      userId: userId || null,
      totalPrice,
      status: "Order Placed",
      ribbonColor,
      boxSize,
      trackingId,
      paymentStatus: "Pending", // Cash on Delivery is pending initially
      paymentMethod: "COD",
      invoiceUrl,
      spaceUtil: parseFloat(spaceUtil) || 0,
      packingEfficiency: parseFloat(packingEfficiency) || 0
    });

    // Create order items & decrement stock
    for (const p of products) {
      // Find product
      const productObj = await Product.findOne({ where: { name: p.name || p } });
      let productId = null;
      let price = 500; // default mock price
      if (productObj) {
        productId = productObj.id;
        price = productObj.price;
        // Decrement stock
        await productObj.update({ stock: Math.max(0, productObj.stock - 1) });
      }

      await OrderItem.create({
        orderId: order.id,
        productId,
        quantity: 1,
        price
      });
    }

    // Save personalization details
    await Recipient.create({
      orderId: order.id,
      name: recipientName || "Valued Recipient",
      phone: recipientPhone || "",
      message: message || "",
      customText: customText || "",
      photoUrl: photoUrl || "",
      logoUrl: logoUrl || ""
    });

    // 1. Decrement Packaging Materials stock
    try {
      const boxSku = boxSize === "Small" ? "BOX-BLU-S" : boxSize === "Large" ? "BOX-BLU-L" : "BOX-BLU-M";
      const boxMaterial = await PackagingMaterial.findOne({ where: { sku: boxSku } });
      if (boxMaterial) {
        const newQty = Math.max(0, boxMaterial.availableQty - 1);
        let status = "In Stock";
        if (newQty === 0) status = "Out Of Stock";
        else if (newQty <= boxMaterial.minThreshold) status = "Low Stock";
        await boxMaterial.update({ availableQty: newQty, status });
      }

      // Decrement Ribbon (approx 5 meters)
      const ribbonSku = ribbonColor === "#AA8413" ? "RIB-NVY" : ribbonColor === "#D4AF37" ? "RIB-GLD" : "RIB-RED";
      const ribbonMaterial = await PackagingMaterial.findOne({ where: { sku: ribbonSku } });
      if (ribbonMaterial) {
        const newQty = Math.max(0, ribbonMaterial.availableQty - 5);
        let status = "In Stock";
        if (newQty === 0) status = "Out Of Stock";
        else if (newQty <= ribbonMaterial.minThreshold) status = "Low Stock";
        await ribbonMaterial.update({ availableQty: newQty, status });
      }

      // Decrement Filler
      const fillerMaterial = await PackagingMaterial.findOne({ where: { sku: "FIL-BRN" } });
      if (fillerMaterial) {
        const newQty = Math.max(0, fillerMaterial.availableQty - 1);
        let status = "In Stock";
        if (newQty === 0) status = "Out Of Stock";
        else if (newQty <= fillerMaterial.minThreshold) status = "Low Stock";
        await fillerMaterial.update({ availableQty: newQty, status });
      }

      // Decrement Greeting Card if card is used
      if (message || customText) {
        const cardMaterial = await PackagingMaterial.findOne({ where: { sku: "CRD-STD" } });
        if (cardMaterial) {
          const newQty = Math.max(0, cardMaterial.availableQty - 1);
          let status = "In Stock";
          if (newQty === 0) status = "Out Of Stock";
          else if (newQty <= cardMaterial.minThreshold) status = "Low Stock";
          await cardMaterial.update({ availableQty: newQty, status });
        }
      }
    } catch (packErr) {
      console.error("Failed to update packaging stock details:", packErr);
    }

    // 2. Create DesignApproval record
    try {
      await DesignApproval.create({
        orderId: order.id,
        status: "Draft Created",
        revisionNotes: null,
        history: JSON.stringify([
          { timestamp: new Date().toISOString(), action: "Design Draft Created", actor: "System", note: "Auto-generated studio visualizer layout." }
        ])
      });
    } catch (daErr) {
      console.error("Failed to create design approval tracker:", daErr);
    }

    // 3. Create all 6 Production Stages
    try {
      const stages = ["Design", "Production", "Packaging", "Quality Check", "Dispatch", "Delivered"];
      const employees = ["Ankit Sharma", "Prakash Raj", "Sunita Nair", "Vikram Rathore", "Kunal Roy", "Sameer Sen"];
      
      for (let i = 0; i < stages.length; i++) {
        await ProductionStage.create({
          orderId: order.id,
          stage: stages[i],
          assignedEmployee: employees[i],
          startDate: i === 0 ? new Date() : null, // Start Design stage immediately
          completionDate: null,
          statusNotes: `Fulfillment operations scheduled for ${stages[i]} stage.`,
          status: i === 0 ? "In Progress" : "Pending"
        });
      }
    } catch (psErr) {
      console.error("Failed to create production workflow steps:", psErr);
    }

    // 4. Create in-app notification alert for customer
    try {
      await Notification.create({
        userId: userId || 2, // Defaults to customer
        type: "Design Approval Needed",
        message: `Your custom gift box design layout for order ${trackingId} has been drafted. Review and approve it in the Design Approval Center.`,
        channel: "In-App",
        status: "Unread"
      });
    } catch (nErr) {
      console.error("Failed to log checkout notification:", nErr);
    }

    res.json({ success: true, message: "Order placed successfully!", trackingId, orderId: order.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all orders (Admin gets all, Customer/Corporate gets only their own)
router.get("/orders", optionalUser, async (req, res) => {
  try {
    const filter = {};
    if (req.userRole !== "admin") {
      if (!req.userId) {
        return res.status(403).json({ success: false, message: "Access Denied: Please sign in." });
      }
      filter.userId = req.userId;
    }

    const orders = await Order.findAll({
      where: filter,
      include: [
        { model: Recipient, as: "recipient" },
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }]
        }
      ]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get order details by tracking ID
router.get("/orders/track/:trackingId", async (req, res) => {
  try {
    const { trackingId } = req.params;
    const order = await Order.findOne({
      where: { trackingId },
      include: [{ model: Recipient, as: "recipient" }]
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    
    // Fetch items
    const items = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Product }]
    });

    res.json({ success: true, order, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status (Admin fulfillment tracker)
router.put("/orders/:id/status", requireAdmin, async (req, res) => {
  try {
     const { id } = req.params;
     const { status } = req.body; // 'Order Placed', 'Customization', 'Packaging', 'Quality Check', 'Dispatch', 'Delivered'
     const order = await Order.findByPk(id);
     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

     const updates = { status };
     if (order.paymentMethod === "COD") {
       updates.paymentStatus = status === "Delivered" ? "Paid" : "Pending";
     }

     await order.update(updates);
     res.json({ success: true, message: "Status updated successfully", order });
  } catch (err) {
     res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
