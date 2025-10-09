const express = require("express");
const router = express.Router();

const {
  assignForm,
  bulkAssignForm,
  getUserAssignments,
  updateAssignmentStatus,
  getAllAssignments,
  deleteAssignment,
} = require("../controllers/assignmentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ✅ User Routes
router.post("/assign", protect, assignForm);                // Assign a single form to a user
router.post("/bulk-assign", protect, bulkAssignForm);       // Bulk assign forms to users
router.get("/user/:userId", protect, getUserAssignments);  // Get all assignments for a user
router.put("/status", protect, updateAssignmentStatus);     // Update assignment status (sent → opened → completed)

// ✅ Admin-only routes (no /admin prefix)
router.get("/", protect, adminOnly, getAllAssignments);         // Get all assignments
router.delete("/:id", protect, adminOnly, deleteAssignment);    // Delete an assignment

module.exports = router;
