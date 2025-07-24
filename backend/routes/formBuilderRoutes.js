// backend/routes/formBuilderRoutes.js
const express = require("express");

const {
  createTemplate,
  getUserTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  submitResponse,
  getTemplateResponses,
  getPublicTemplates
} = require("../controllers/formBuilderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { maybeProtect } = require("../middleware/maybeProtect"); // 👈 add this import at the top

const router = express.Router();

// Public routes
router.get("/public", getPublicTemplates);
router.get("/template/:templateId", maybeProtect, getTemplateById); // ✅ optional token support
router.post("/template/:templateId/respond", submitResponse); // Anonymous allowed

// Protected routes
router.use(protect); // Apply to all routes below

// Template CRUD
router.post("/template", createTemplate);
router.get("/my-templates", getUserTemplates);
router.put("/template/:templateId", updateTemplate);
router.delete("/template/:templateId", deleteTemplate);
router.get("/template/:templateId/responses", getTemplateResponses);

// Response management
router.get("/template/:templateId/responses", getTemplateResponses);

module.exports = router;