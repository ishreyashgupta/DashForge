const express = require("express");
const {
  register,
  login,
  getDashboard
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Shared register/login route for both users and admins
router.post("/register", register); // check adminKey in body if role === "admin"
router.post("/login", login);

// ✅ Protected dashboard route (only for logged-in users)
router.get("/dashboard", protect, getDashboard);

module.exports = router;
