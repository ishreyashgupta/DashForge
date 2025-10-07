const express = require("express");
const {
  getAllForms,
  getFormByFormId,
  updateFormByFormId,
  deleteFormByFormId,
  getAllUsers, // ✅ import the new controller function
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔐 Apply middleware to all admin routes
router.use(protect, adminOnly);

// Forms routes
router.get("/forms", getAllForms);
router.get("/forms/:formId", getFormByFormId);
router.put("/forms/:formId", updateFormByFormId);
router.delete("/forms/:formId", deleteFormByFormId);
// ✅ New route to get all users
router.get("/users", getAllUsers);

module.exports = router;
