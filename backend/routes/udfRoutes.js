const express = require("express");
const router = express.Router();
const udfController = require("../controllers/udfController");

// ✅ Route for fetching metadata
router.get("/meta", udfController.getMeta);

// ✅ CRUD routes for UDF forms
router.post("/", udfController.createForm);
router.get("/forms", udfController.getForms);
router.get("/:id", udfController.getFormById);
router.put("/:id", udfController.updateForm);
router.delete("/forms/:id", udfController.deleteForm);



module.exports = router;
