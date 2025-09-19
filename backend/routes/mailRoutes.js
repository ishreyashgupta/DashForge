const express = require("express");
const router = express.Router();
const { sendAssignmentMail } = require("../controllers/mailcontroller");

// ✅ Send mail for a given assignmentId
router.post("/send", sendAssignmentMail);

module.exports = router;
