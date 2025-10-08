// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware"); // ✅ correct file name
const userController = require("../controllers/userController");

/**
 * @route   GET /api/user/assignments
 * @desc    Get all forms assigned to the logged-in user
 * @access  Private
 */
router.get("/assignments", protect, userController.getMyAssignments);

/**
 * @route   GET /api/user/assignment
 * @desc    Get a single assignment by surveyToken
 * @query   token
 * @access  Private
 */
router.get("/assignment", protect, userController.getAssignmentByToken);

/**
 * @route   POST /api/user/assignment/status
 * @desc    Update assignment status (sent → opened → completed)
 * @body    { surveyToken, status }
 * @access  Private
 */
router.post("/assignment/status", protect, userController.updateAssignmentStatus);

/**
 * @route   POST /api/user/assignment/submit
 * @desc    Submit a filled form and mark assignment completed
 * @body    { assignmentId, formData }
 * @access  Private
 */
router.post("/assignment/submit", protect, userController.submitAssignment);







module.exports = router;
