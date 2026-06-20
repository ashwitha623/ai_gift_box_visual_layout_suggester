const express = require("express");
const cors = require("cors");
const { initDb } = require("./models");

// Import Routes
const layoutRoutes = require("./routes/layoutRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const crmRoutes = require("./routes/crmRoutes");
const returnRoutes = require("./routes/returnRoutes");
const aiRoutes = require("./routes/aiRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const designApprovalRoutes = require("./routes/designApprovalRoutes");
const productionRoutes = require("./routes/productionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

app.get("/", (req, res) => {
  res.send("Gift Box Backend Running");
});

// Register routes
app.use("/api", layoutRoutes);
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", campaignRoutes);
app.use("/api", crmRoutes);
app.use("/api", returnRoutes);
app.use("/api", aiRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", designApprovalRoutes);
app.use("/api", productionRoutes);
app.use("/api", notificationRoutes);
app.use("/api", reportRoutes);

// Background Scheduler for CRM reminders
const { CRMContact, Notification } = require("./models");
const { Op } = require("sequelize");

setInterval(async () => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    // Find all scheduled contacts where occasionDate matches or is past and reminderSent = false
    const dueContacts = await CRMContact.findAll({
      where: {
        reminderSent: false,
        occasionDate: {
          [Op.lte]: todayStr
        }
      }
    });

    for (const contact of dueContacts) {
      await contact.update({ reminderSent: true, status: "Sent" });
      
      // Automatically create a notification in the Notification Center
      await Notification.create({
        userId: contact.userId,
        type: "Occasion Reminder",
        message: `Occasion Alert: It's ${contact.name}'s ${contact.occasionType}! Time to send a luxury Paper Plane gift.`,
        channel: "Browser Push",
        status: "Unread"
      });
      console.log(`[Scheduler] Triggered browser notification for ${contact.name}'s ${contact.occasionType}`);
    }
  } catch (err) {
    console.error("[Scheduler Error]", err);
  }
}, 15000); // Run check every 15 seconds

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});