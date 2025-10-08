const express = require("express");
const router = express.Router();
const udfController = require("../controllers/udfController");

// ✅ Fetch metadata for frontend dropdowns
router.get("/meta", udfController.getMeta);

// ✅ CRUD routes for UDF forms
router.get("/", udfController.getForms);          // Get all forms
router.get("/list", udfController.getFormList);  // Lightweight list: _id + name
router.get("/:id", udfController.getFormById);   // Get single form by ID
router.post("/", udfController.createUDFForm);   // Create new form
router.put("/:id", udfController.updateUDFForm); // Update form
router.delete("/:id", udfController.deleteUDFForm); // Delete form

module.exports = router;
