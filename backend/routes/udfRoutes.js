const express = require("express");
const router = express.Router();
const {
  createUDFForm,
  getUDFForms,
  getUDFFormById,
  updateUDFForm,
} = require("../controllers/udfController");

// Base URL: /api/udf
router.post("/forms", createUDFForm);
router.get("/forms", getUDFForms);
router.get("/forms/:id", getUDFFormById);
router.put("/forms/:id", updateUDFForm);

module.exports = router;
