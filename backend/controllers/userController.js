const mongoose = require("mongoose");


const FormAssignment = require("../models/FormAssignment");
const User = require("../models/User"); // ✅ make sure this path matches your user model
const UDFResponse = require("../models/UDFResponse");

/**
 * Utility: format assignment consistently
 */
const formatAssignment = (assignment) => ({
  assignmentId: assignment._id,
  formId: assignment.formId?._id || assignment.formId,
  formName: assignment.formId?.name,
  formDescription: assignment.formId?.description,
  surveyToken: assignment.surveyToken,
  status: assignment.status,
  assignedAt: assignment.assignedAt,
  completedAt: assignment.completedAt || null,
});

/**
 * Get all forms assigned to the logged-in user
 */
exports.getMyAssignments = async (req, res) => {
  try {
    const userId = req.user._id; // JWT/auth middleware sets req.user

    const assignments = await FormAssignment.find({ userId })
      .populate("formId", "name description")
      .populate("formId") // <-- includes all form fields
      .sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      assignments: assignments.map(formatAssignment),
    });
  } catch (err) {
    console.error("❌ getMyAssignments error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get a single assigned form by assignmentId
 */
exports.getAssignmentByToken = async (req, res) => {
  try {
    const { assignmentId } = req.query;
    const userId = req.user._id;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "assignmentId required" });
    }

    const assignment = await FormAssignment.findById(assignmentId)
      .populate("formId", "name description fields")
      .populate("userId", "name email");

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    if (String(userId) !== String(assignment.userId._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({
      success: true,
      assignment: formatAssignment(assignment),
      form: {
        id: assignment.formId._id,
        name: assignment.formId.name,
        description: assignment.formId.description,
        fields: assignment.formId.fields || [],
      },
    });
  } catch (err) {
    console.error("❌ getAssignmentByToken error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update assignment status for the logged-in user
 */
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId, status } = req.body;
    const userId = req.user._id;

    if (!assignmentId || !status) {
      return res.status(400).json({ success: false, message: "assignmentId and status required" });
    }

    const assignment = await FormAssignment.findById(assignmentId)
      .populate("formId", "name description")
      .populate("userId", "name email");

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    if (String(userId) !== String(assignment.userId._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    assignment.status = status;
    if (status === "completed") assignment.completedAt = new Date();
    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment status updated",
      assignment: formatAssignment(assignment),
    });
  } catch (err) {
    console.error("❌ updateAssignmentStatus error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Submit a filled form (dynamic UDF)
 */

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, formData } = req.body;
    const userId = req.user._id;

    if (!assignmentId || !formData) {
      return res.status(400).json({ success: false, message: "assignmentId and formData required" });
    }

    const assignment = await FormAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    if (String(assignment.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // ✅ 1️⃣ Save the form response
    const newResponse = await UDFResponse.create({
      formId: assignment.formId,
      assignmentId: assignment._id,
      data: formData,
    });

    console.log("✅ Saved user response:", newResponse);

    // ✅ 2️⃣ Update the assignment status
    assignment.status = "completed";
    assignment.completedAt = new Date();
    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Form submitted successfully",
      responseId: newResponse._id,
    });
  } catch (err) {
    console.error("❌ submitAssignment error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------------------------------------------------------
// ✅ ADD THESE BELOW: Profile update and deletion
// ---------------------------------------------------------------------------

/**
 * @desc Update logged-in user's profile
 * @route PUT /api/user/profile
 * @access Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (err) {
    console.error("❌ updateUserProfile error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

/**
 * @desc Delete logged-in user's account
 * @route DELETE /api/user/delete
 * @access Private
 */
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("❌ deleteUserAccount error:", err);
    res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};


/**
 * @desc    Get responses linked to a user's assignment
 * @route   GET /api/user/assignment/responses?assignmentId=<id>
 * @access  Private
 */
exports.getAssignmentResponses = async (req, res) => {
  try {
    const { assignmentId } = req.query;

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: "Valid assignmentId required" });
    }

    const assignment = await FormAssignment.findById(assignmentId).populate("formId", "name description");
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Restrict to the owner of the assignment
    if (assignment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Fetch by assignmentId — not userId or formId
    const responses = await UDFResponse.find({ assignmentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      form: {
        id: assignment.formId._id,
        name: assignment.formId.name,
        description: assignment.formId.description,
      },
      assignment: {
        id: assignment._id,
        userId: assignment.userId,
        status: assignment.status,
      },
      responses,
    });
  } catch (error) {
    console.error("❌ Error in getAssignmentResponses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
