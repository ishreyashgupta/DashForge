const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware");
const userController = require("../controllers/userController");

/**
 * @route   GET /api/user/assignments
 * @desc    Get all assignments for the logged-in user
 */
router.get("/assignments", protect, userController.getMyAssignments);

/**
 * @route   GET /api/user/assignment
 * @desc    Get a single assignment by token or ID
 */
router.get("/assignment", protect, userController.getAssignmentByToken);

/**
 * @route   POST /api/user/assignment/status
 * @desc    Update assignment status
 */
router.post("/assignment/status", protect, userController.updateAssignmentStatus);

/**
 * @route   POST /api/user/assignment/submit
 * @desc    Submit a user form response for an assignment
 */
router.post("/assignment/submit", protect, userController.submitAssignment);

/**
 * @route   PUT /api/user/profile
 * @desc    Update logged-in user's profile
 */
router.put("/profile", protect, userController.updateUserProfile);

/**
 * @route   DELETE /api/user/delete
 * @desc    Delete logged-in user's account
 */
router.delete("/delete", protect, userController.deleteUserAccount);

/**
 * @route   GET /api/user/assignment/responses
 * @desc    Get all responses linked to an assignment
 */
router.get("/assignment/responses", protect, userController.getAssignmentResponses);

/**
 * @route   GET /api/user/assignment/edit-data
 * @desc    Get full form + user’s latest response for editing
 */
router.get("/assignment/edit-data", protect, userController.getUserAssignmentEditData);

router.put("/assignment/update-response", protect, userController.updateAssignmentResponse);



module.exports = router;
