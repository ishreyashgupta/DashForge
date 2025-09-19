// controllers/formAssignmentController.js
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const UDFForm = require("../models/UDFForm");
const FormAssignment = require("../models/FormAssignment");

/**
 * Utility: format assignment response consistently
 */
const formatAssignment = (assignment, form) => ({
  assignmentId: assignment._id,
  formId: form ? form._id : assignment.formId,
  formName: form ? form.name : undefined,
  formDescription: form ? form.description : undefined,
  surveyToken: assignment.surveyToken,   // 👈 add this line
  status: assignment.status,
  assignedAt: assignment.assignedAt,
  completedAt: assignment.completedAt || null,
});

/**
 * Assign form to a single user (dashboard only, no mail here)
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

    // Prevent duplicate
    let assignment = await FormAssignment.findOne({ userId, formId });
    if (assignment) {
      return res.status(200).json({
        success: true,
        message: "Form already assigned to this user",
        assignment: formatAssignment(assignment, form),
      });
    }

    // Create new
    assignment = new FormAssignment({
      userId,
      formId,
      surveyToken: crypto.randomUUID(),
      status: "sent",
    });
    await assignment.save();

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

      // Prevent duplicate
      let existing = await FormAssignment.findOne({ userId, formId });
      if (existing) {
        results.push({ userId, status: "skipped", reason: "Already assigned", assignment: formatAssignment(existing, form) });
        continue;
      }

      // New assignment
      const assignment = new FormAssignment({
        userId,
        formId,
        surveyToken: crypto.randomUUID(),
        status: "sent",
      });
      await assignment.save();
      results.push({ userId, status: "success", assignment: formatAssignment(assignment, form) });
    }

    res.status(200).json({
      success: true,
      message: "Bulk assignment completed (no mail sent)",
      results,
    });
  } catch (error) {
    console.error("❌ Error in bulkAssignForm:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all assignments for a user (with form details)
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
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

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

exports.validateSurveyToken = async (req, res) => {
  try {
    const { token } = req.query;
    const loggedInUserId = req.user?._id; // from auth middleware if you use JWT/session

    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }

    const assignment = await FormAssignment.findOne({ surveyToken: token })
      .populate("formId", "name description")
      .populate("userId", "email name");

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Invalid or expired token" });
    }

    // ✅ Extra validation: ensure logged-in user matches assigned user
    if (loggedInUserId && String(loggedInUserId) !== String(assignment.userId._id)) {
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