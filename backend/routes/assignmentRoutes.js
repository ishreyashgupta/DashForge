const express = require("express");
const {
  assignForm,
  bulkAssignForm,
  getUserAssignments,
  validateSurveyToken,
  updateAssignmentStatus,
  getAllAssignments,
  deleteAssignment,
} = require("../controllers/assignmentController");

const { protect } = require("../middleware/authMiddleware"); // JWT/session auth

const router = express.Router();

// ------------------ USER ROUTES ------------------

// Get assignments for a specific user
router.get("/user/:userId", protect, getUserAssignments);

// Validate survey token (can be accessed without login if needed)
router.get("/validate", protect,validateSurveyToken );
// router.get("/assignment/token/:token", );

// Update assignment status (requires login)
router.put("/status", protect, updateAssignmentStatus);

// ------------------ ADMIN ROUTES ------------------

// Assign a form to a single user
router.post("/assign", protect, assignForm);

// Bulk assign a form to multiple users
router.post("/bulk-assign", protect, bulkAssignForm);

// Get all assignments (for admin dashboard)
router.get("/", protect, getAllAssignments);

// Delete an assignment by ID
router.delete("/:id", protect, deleteAssignment);

module.exports = router;
