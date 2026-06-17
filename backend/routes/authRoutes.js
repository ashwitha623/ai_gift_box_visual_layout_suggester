const express = require("express");
const router = express.Router();
const { User } = require("../models");

// Signup API
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }
    const user = await User.create({ username, email, password, role: role || "customer" });
    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login API
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
