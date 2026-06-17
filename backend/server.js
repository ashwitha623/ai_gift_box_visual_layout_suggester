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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});