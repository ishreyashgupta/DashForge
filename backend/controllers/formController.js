const FormData = require("../models/FormData");

// ✅ Submit or Update Form
// ✅ Submit or Update Form
exports.submitForm = async (req, res) => {
  try {
    const existingForm = await FormData.findOne({ userId: req.user._id });

    if (existingForm) {
      const updatedForm = await FormData.findOneAndUpdate(
        { userId: req.user._id },
        req.body,
        { new: true } // ✅ return updated doc
      );
      return res.json({
        message: "Form updated successfully",
        formId: updatedForm._id, // ✅ always return formId
      });
    }
 
    const formData = new FormData({
      ...req.body,
      userId: req.user._id,
    });

    await formData.save();
    res.status(201).json({
      message: "Form submitted successfully",
      formId: formData._id, // ✅ return new form's id
    });
  } catch (err) {
    console.error("Form Submission Error:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
};

exports.updateForm = async (req, res) => {
  try {
    const updated = await FormData.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Form not found" });
    res.json({ message: "Form updated successfully", form: updated });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Failed to update form" });
  }
};

// ✅ Delete a user's form
exports.deleteForm = async (req, res) => {
  try {
    await FormData.deleteOne({ userId: req.user._id });
    res.json({ success: true, message: "Form deleted successfully" });
  } catch (err) {

    console.error("Form Delete Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete form" });
  }
};


// ✅ Check if user has submitted a form 
exports.checkForm = async (req, res) => {
  try {
    const form = await FormData.findOne({ userId: req.user._id });
    res.json({
      formFilled: !!form,
      form,
      formId: form?._id, // ✅ added for frontend redirection
    });
  } catch (err) {
    console.error("Check Form Error:", err);
    res.status(500).json({ message: "Failed to check form" });
  }
};



// ✅ Get current user's form data
exports.getFormDetails = async (req, res) => {
  try {
    const form = await FormData.findOne({ userId: req.user._id });

    if (!form) {
      return res.status(404).json({ message: "Form data not found" });
    }

    res.json(form);
  } catch (err) {
    console.error("Get Form Details Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Admin: Get all submitted forms
exports.getAllForms = async (req, res) => {
  try {
    const allForms = await FormData.find().populate("userId", "name email role"); // optional
    res.json(allForms);
  } catch (err) {
    console.error("Get All Forms Error:", err);
    res.status(500).json({ message: "Failed to get all forms" });
  }
};
