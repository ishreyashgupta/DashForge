const express = require("express");
const {
  submitForm,
  deleteForm,
  updateForm,
  checkForm,
  getFormDetails,
  getAllForms
} = require("../controllers/formController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ User Routes
router.post("/submit-form", protect, submitForm);      // Submit or update form
router.put ("/update-form", protect, updateForm);      // Update form
router.delete("/delete-form", protect, deleteForm);    // Delete form
router.get("/check-form", protect, checkForm);         // Check if form is filled
router.get("/me", protect, getFormDetails);            // Get own form details

// ✅ Admin Route - Get all submitted forms
router.get("/admin/forms", protect, adminOnly, getAllForms); 

module.exports = router;
