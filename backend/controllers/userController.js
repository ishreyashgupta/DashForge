// controllers/userController.js
const FormAssignment = require("../models/FormAssignment");

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
        .populate("formId") // <-- this will include all fields of the UDFForm, including 'fields'

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
    const { assignmentId } = req.query; // <-- updated to match frontend
    const userId = req.user._id;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "assignmentId required" });
    }

    const assignment = await FormAssignment.findById(assignmentId)
      .populate("formId", "name description")
      .populate("userId", "name email")
      .populate("formId") ;// <-- this will include all fields of the UDFForm, including 'fields'

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
 * (sent → opened → completed)
 */
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId, status } = req.body; // <-- updated
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

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, formData } = req.body;
    const userId = req.user._id;

    if (!assignmentId || !formData) {
      return res.status(400).json({ success: false, message: "assignmentId and formData required" });
    }

    const assignment = await FormAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    if (String(assignment.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    assignment.response = formData; 
    assignment.status = "completed";
    assignment.completedAt = new Date();
    await assignment.save();

    res.status(200).json({ success: true, message: "Form submitted successfully" });
  } catch (err) {
    console.error("❌ submitAssignment error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
