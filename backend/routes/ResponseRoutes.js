const express = require("express");
const router = express.Router();
const { submitResponse, getResponses } = require("../controllers/responseController");

// Submit a form response
router.post("/:formId", submitResponse);

// Get all responses for a specific form
router.get("/:formId", getResponses);

module.exports = router;
