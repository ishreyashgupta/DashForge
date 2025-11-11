const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware");
const userController = require("../controllers/userController");

/**
 * @route   GET /api/user/assignments
 */
router.get("/assignments", protect, userController.getMyAssignments);

/**
 * @route   GET /api/user/assignment
 */
router.get("/assignment", protect, userController.getAssignmentByToken);

/**
 * @route   POST /api/user/assignment/status
 */
router.post("/assignment/status", protect, userController.updateAssignmentStatus);

/**
 * @route   POST /api/user/assignment/submit
 */
router.post("/assignment/submit", protect, userController.submitAssignment);

/**
 * @route   PUT /api/user/profile
 * @desc    Update logged-in user's profile
 * @access  Private
 */
router.put("/profile", protect, userController.updateUserProfile);

/**
 * @route   DELETE /api/user/delete
 * @desc    Delete logged-in user's account
 * @access  Private
 */
router.delete("/delete", protect, userController.deleteUserAccount);


/**
 * @route   GET /api/user/assignment/responses
 * @desc    Get responses for a specific assignment
 * @access  Private
 */
router.get("/assignment/responses", protect, userController.getAssignmentResponses);



module.exports = router;
