const mongoose = require("mongoose");
const UDFResponse = require("../models/UDFResponse");
const UDFForm = require("../models/UDFForm");
const FormAssignment = require("../models/FormAssignment");

// Submit a form response
exports.submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;

    // Validate formId
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Invalid or missing formId" });
    }

    // Check if form exists
    const form = await UDFForm.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Save the submitted response
    const response = new UDFResponse({
      formId,
      data: req.body,
      user: req.user?.id || "Anonymous", // optional, track who submitted
    });

    await response.save();

    res.status(201).json({ message: "Response saved successfully", response });
  } catch (error) {
    console.error("Error saving response:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all responses for a form
exports.getResponses = async (req, res) => {
  try {
    const { formId } = req.params;

    // Validate formId
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Invalid or missing formId" });
    }

    const responses = await UDFResponse.find({ formId }).sort({ createdAt: -1 });
    res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.submitResponse = async (req, res) => {
  try {
    const { assignmentId, data } = req.body;

    console.log("📩 Received submission:", { assignmentId, data });

    const assignment = await FormAssignment.findById(assignmentId);
    if (!assignment) {
      console.log("❌ Assignment not found for ID:", assignmentId);
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Create a response linked to both form and assignment
    const response = await UDFResponse.create({
      formId: assignment.formId,
      assignmentId: assignment._id,
      data,
    });

    console.log("✅ Response saved:", response);

    assignment.status = "completed";
    await assignment.save();

    res.status(201).json({
      success: true,
      message: "Response submitted successfully",
      response,
    });
  } catch (error) {
    console.error("❌ Error in submitResponse:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/responseController.js
exports.getResponsesByFormId = async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await UDFResponse.find({ formId })
      .populate("userId", "name email")       // get user name/email
      .populate("assignmentId", "status")     // optional
      .sort({ submittedAt: -1 })              // newest first
      .lean();

    res.status(200).json(responses);
  } catch (err) {
    console.error("❌ Error fetching responses by formId:", err);
    res.status(500).json({ message: "Server error fetching responses" });
  }
};
// controllers/responseController.js


exports.getResponsesByFormId = async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await UDFResponse.find({ formId })
      .populate("userId", "name email")
      .lean();

    // 🔁 Normalize field names so frontend always uses `answers`
    const normalized = responses.map((r) => ({
      ...r,
      answers: r.answers || r.data || {}, // support both field names
    }));

    res.status(200).json(normalized);
  } catch (err) {
    console.error("❌ Error fetching responses:", err);
    res.status(500).json({ message: "Error fetching responses" });
  }
};
