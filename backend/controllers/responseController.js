const UDFResponse = require("../models/UDFResponse");
const UDFForm = require("../models/UDFForm");

// Submit a form response
exports.submitResponse = async (req, res) => {
  try {
    const formId = req.params.formId;

    // Check if form exists
    const form = await UDFForm.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Save the submitted response
    const response = new UDFResponse({
      formId,
      data: req.body,
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
    const responses = await UDFResponse.find({ formId: req.params.formId }).sort({ createdAt: -1 });
    res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
