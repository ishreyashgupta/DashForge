const UDFForm = require("../models/UDFForm");

// Create new UDF form
exports.createUDFForm = async (req, res) => {
  try {
    const { name, fields, createdBy } = req.body;
    if (!name || !fields) return res.status(400).json({ message: "Form name and fields required" });

    const form = new UDFForm({ name, fields, createdBy });
    await form.save();

    res.status(201).json({ message: "UDF form saved", form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all UDF forms
exports.getUDFForms = async (req, res) => {
  try {
    const forms = await UDFForm.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single UDF form
exports.getUDFFormById = async (req, res) => {
  try {
    const form = await UDFForm.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update UDF form
exports.updateUDFForm = async (req, res) => {
  try {
    const { name, fields } = req.body;
    const updatedForm = await UDFForm.findByIdAndUpdate(
      req.params.id,
      { name, fields },
      { new: true }
    );
    if (!updatedForm) return res.status(404).json({ message: "Form not found" });
    res.json({ message: "UDF form updated", form: updatedForm });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
