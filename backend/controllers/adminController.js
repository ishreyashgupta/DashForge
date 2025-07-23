const mongoose = require("mongoose");
const FormData = require("../models/FormData");

// GET /api/admin/forms
exports.getAllForms = async (req, res) => {
  try {
    const forms = await FormData.find().populate("userId", "name email");
    res.status(200).json(forms);
  } catch (err) {
    console.error("Admin getAllForms error:", err);
    res.status(500).json({ message: "Failed to fetch all forms" });
  }
};

// GET /api/admin/forms/:formId
exports.getFormByFormId = async (req, res) => {
  try {
    const { formId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }

    const form = await FormData.findById(formId).populate("userId", "name email");

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({ form });
  } catch (err) {
    console.error("Admin getFormByFormId error:", err);
    res.status(500).json({ message: "Failed to fetch user form" });
  }
};

// PUT /api/admin/forms/:formId
exports.updateFormByFormId = async (req, res) => {
  try {
    const { formId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }

    const updatedForm = await FormData.findByIdAndUpdate(
      formId,
      req.body,
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({
      message: "Form updated successfully",
      updatedForm,
    });
  } catch (err) {
    console.error("Admin updateFormByFormId error:", err);
    res.status(500).json({ message: "Failed to update form" });
  }
};

// DELETE /api/admin/forms/:formId
exports.deleteFormByFormId = async (req, res) => {
  try {
    const { formId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }

    const result = await FormData.findByIdAndDelete(formId);

    if (!result) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({ success: true, message: "Form deleted successfully" });
  } catch (err) {
    console.error("Admin deleteFormByFormId error:", err);
    res.status(500).json({ message: "Failed to delete form" });
  }
};
