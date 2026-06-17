const express = require("express");
const router = express.Router();
const { User, CustomerProfile, Order, CRMContact, OrderItem, Product, Notification } = require("../models");
const { requireAdmin, optionalUser } = require("../middleware/auth");

// --- Original CRM Calendar Endpoints ---

// Get CRM contacts/reminders
router.get("/crm", async (req, res) => {
  try {
    const contacts = await CRMContact.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }]
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add CRM contact/reminder
router.post("/crm", async (req, res) => {
  try {
    const { userId, name, relationship, occasionType, occasionDate } = req.body;
    const contact = await CRMContact.create({
      userId,
      name,
      relationship,
      occasionType,
      occasionDate,
      reminderSent: false,
      status: "Scheduled",
      autoSchedule: true
    });
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger mock reminder notification
router.post("/crm/:id/reminder", async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await CRMContact.findByPk(id);
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

    await contact.update({ reminderSent: true, status: "Sent" });

    // Automatically create a notification in the Notification Center!
    await Notification.create({
      userId: contact.userId,
      type: "Occasion Reminder",
      message: `Occasion Alert: It's ${contact.name}'s ${contact.occasionType}! Time to send a luxury Paper Plane gift.`,
      channel: "WhatsApp",
      status: "Unread"
    });

    res.json({ success: true, message: `Reminder notification triggered successfully for ${contact.name}'s ${contact.occasionType}!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// --- New Extended Customer Record Management (CRM) Endpoints ---

// Get all customers (Admin only)
router.get("/crm/customers", requireAdmin, async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: "customer" },
      attributes: ["id", "username", "email"],
      include: [
        { model: CustomerProfile, as: "profile" },
        { model: Order, as: "orders" }
      ]
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get customer profile detail page
router.get("/crm/customers/:id", optionalUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Authorization check
    if (req.userRole !== "admin" && req.userId !== parseInt(id)) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const customer = await User.findByPk(id, {
      attributes: ["id", "username", "email"],
      include: [
        { model: CustomerProfile, as: "profile" },
        {
          model: Order,
          as: "orders",
          include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }]
        },
        { model: CRMContact, as: "contacts" }
      ]
    });

    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update customer profile preferences
router.put("/crm/customers/:id/profile", optionalUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, address, favoriteColors, favoriteCategories, preferredPackagingStyle } = req.body;

    if (req.userRole !== "admin" && req.userId !== parseInt(id)) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    let profile = await CustomerProfile.findOne({ where: { userId: id } });
    if (!profile) {
      profile = await CustomerProfile.create({ userId: id });
    }

    await profile.update({
      phone,
      address,
      favoriteColors: favoriteColors ? JSON.stringify(favoriteColors) : profile.favoriteColors,
      favoriteCategories: favoriteCategories ? JSON.stringify(favoriteCategories) : profile.favoriteCategories,
      preferredPackagingStyle: preferredPackagingStyle || profile.preferredPackagingStyle
    });

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
