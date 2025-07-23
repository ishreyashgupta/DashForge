const express = require("express");
const {
  getAllForms,
  getFormByFormId,
  updateFormByFormId,
  deleteFormByFormId,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔐 Apply middleware to all admin routes
router.use(protect, adminOnly);

// GET /api/admin/forms → all user forms
router.get("/forms", getAllForms);

// GET /api/admin/forms/:formId → specific user's form
router.get("/forms/:formId", getFormByFormId);

// PUT /api/admin/forms/:formId → update a user’s form
router.put("/forms/:formId", updateFormByFormId);

// DELETE /api/admin/forms/:formId → delete a user’s form
router.delete("/forms/:formId", deleteFormByFormId);

module.exports = router;
