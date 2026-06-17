module.exports = {
  requireAdmin: (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (role === "admin") {
      next();
    } else {
      res.status(403).json({ success: false, message: "Access Denied: Admin role required." });
    }
  },
  optionalUser: (req, res, next) => {
    req.userId = req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"]) : null;
    req.userRole = req.headers["x-user-role"] || null;
    next();
  }
};
