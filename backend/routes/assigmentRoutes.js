const express = require("express");
const router = express.Router();
const {
  assignForm,
  bulkAssignForm,
  getUserAssignments,
  updateAssignmentStatus,
} = require("../controllers/assignmentController");

// ✅ Assign a single form to a user
router.post("/assign", assignForm);

// ✅ Bulk assign forms to users
router.post("/bulk-assign", bulkAssignForm);

// ✅ Get all assignments for a user
router.get("/user/:userId", getUserAssignments);

// ✅ Update assignment status (sent → opened → completed)
router.put("/status", updateAssignmentStatus);

module.exports = router;
