// controllers/formAssignmentController.js
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const UDFForm = require("../models/UDFForm");
const FormAssignment = require("../models/FormAssignment");
const UDFResponse = require("../models/UDFResponse"); // ✅ Make sure to import this at the top

/**
 * Utility: format assignment response consistently
 */
const formatAssignment = (assignment, form) => ({
  assignmentId: assignment._id,
  formId: form ? form._id : assignment.formId,
  formName: form ? form.name : undefined,
  formDescription: form ? form.description : undefined,
  surveyToken: assignment.surveyToken, 
  status: assignment.status,
  assignedAt: assignment.assignedAt,
  completedAt: assignment.completedAt || null,
});

/**
 * Assign form to a single user (admin dashboard)
 */
exports.assignForm = async (req, res) => {
  try {
    const { formId, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(formId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid formId or userId" });
    }

    const form = await UDFForm.findById(formId);
    if (!form) return res.status(404).json({ success: false, message: "Form not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Prevent duplicate assignment
    let assignment = await FormAssignment.findOne({ userId, formId });
    if (!assignment) {
      assignment = new FormAssignment({
        userId,
        formId,
        surveyToken: crypto.randomUUID(),
        status: "sent",
      });
      await assignment.save();
    }

    res.status(201).json({
      success: true,
      message: "Form assigned successfully",
      assignment: formatAssignment(assignment, form),
    });
  } catch (error) {
    console.error("❌ Error in assignForm:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Bulk assign forms to multiple users
 */
exports.bulkAssignForm = async (req, res) => {
  try {
    const { formId, userIds } = req.body;
    if (!formId || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "formId and userIds[] are required" });
    }

    const form = await UDFForm.findById(formId);
    if (!form) return res.status(404).json({ success: false, message: "Form not found" });

    const results = [];

    for (const userId of userIds) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        results.push({ userId, status: "failed", reason: "Invalid userId" });
        continue;
      }

      const user = await User.findById(userId);
      if (!user) {
        results.push({ userId, status: "failed", reason: "User not found" });
        continue;
      }

      let existing = await FormAssignment.findOne({ userId, formId });
      if (!existing) {
        const assignment = new FormAssignment({
          userId,
          formId,
          surveyToken: crypto.randomUUID(),
          status: "sent",
        });
        await assignment.save();
        results.push({ userId, status: "success", assignment: formatAssignment(assignment, form) });
      } else {
        results.push({ userId, status: "skipped", reason: "Already assigned", assignment: formatAssignment(existing, form) });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk assignment completed",
      results,
    });
  } catch (error) {
    console.error("❌ Error in bulkAssignForm:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all assignments for a user
 */
exports.getUserAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const assignments = await FormAssignment.find({ userId })
      .populate("formId", "name description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      assignments: assignments.map(a => formatAssignment(a, a.formId)),
    });
  } catch (error) {
    console.error("❌ Error in getUserAssignments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update assignment status (sent → opened → completed)
 */
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { token, status } = req.body;
    if (!token || !status) {
      return res.status(400).json({ success: false, message: "token and status required" });
    }

    const assignment = await FormAssignment.findOne({ surveyToken: token }).populate("formId", "name description");
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

    assignment.status = status;
    if (status === "completed") assignment.completedAt = new Date();
    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment status updated",
      assignment: formatAssignment(assignment, assignment.formId),
    });
  } catch (error) {
    console.error("❌ Error in updateAssignmentStatus:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Validate survey token (no JWT needed)
 */
exports.validateSurveyToken = async (req, res) => {
  try {
    const { token } = req.query;
    const loggedInUserId = req.user?._id; // populated by authMiddleware if user is logged in

    if (!token) return res.status(400).json({ success: false, message: "Token required" });

    const assignment = await FormAssignment.findOne({ surveyToken: token })
      .populate("formId", "name description")
      .populate("userId", "name email");

    if (!assignment) return res.status(404).json({ success: false, message: "Invalid or expired token" });

    // ✅ Protection: ensure logged-in user matches the assigned user
    if (loggedInUserId && assignment.userId._id.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this form",
      });
    }

    res.status(200).json({
      success: true,
      form: {
        id: assignment.formId._id,
        name: assignment.formId.name,
        description: assignment.formId.description,
      },
      assignment: {
        id: assignment._id,
        status: assignment.status,
        userEmail: assignment.userId.email,
        userName: assignment.userId.name,
      },
    });
  } catch (err) {
    console.error("❌ validateSurveyToken error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/**
 * Get all assignments (admin dashboard)
 */
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await FormAssignment.find()
      .populate("formId", "name description")
      .populate("userId", "name email")
      .sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      assignments: assignments.map(a => ({
        _id: a._id,
        formName: a.formId?.name,
        userName: a.userId?.name,
        userEmail: a.userId?.email,
        assignedAt: a.assignedAt,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error("❌ Error in getAllAssignments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete an assignment by ID
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await FormAssignment.findById(id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

    await assignment.deleteOne();
    res.status(200).json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteAssignment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get assignment by token (frontend uses after login to fetch form)
 */
exports.getAssignmentByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const assignment = await FormAssignment.findOne({ surveyToken: token }).populate("formId");

    if (!assignment) return res.status(404).json({ success: false, message: "Invalid or expired assignment token" });

    res.status(200).json({ success: true, assignment });
  } catch (error) {
    console.error("❌ Error in getAssignmentByToken:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get responses for a given assignment (safe type-compatible addition)
 */
exports.getAssignmentResponses = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await FormAssignment.findById(assignmentId)
      .populate("formId", "name description");
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const formId = assignment.formId?._id || assignment.formId;
    if (!formId) {
      return res.status(404).json({ success: false, message: "No form linked to this assignment" });
    }

    // Optionally restrict access for non-admins
    // if (!req.user.isAdmin && assignment.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Not authorized to view these responses" });
    // }

    // ✅ Fetch responses linked to this form
    const responses = await UDFResponse.find({ assignmentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      form: {
        id: formId,
        name: assignment.formId?.name,
        description: assignment.formId?.description,
      },
      assignment: {
        id: assignment._id,
        userId: assignment.userId,
        status: assignment.status,
      },
      responses, // ✅ type remains identical to getUDFResponses(formId)
    });
  } catch (error) {
    console.error("❌ Error in getAssignmentResponses:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assignment responses" });
  }
};