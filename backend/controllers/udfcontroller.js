import UDFForm from "../models/UDFForm.js"; // ✅ Use import instead of require

// =======================
// Get all forms
// =======================
export const getForms = async (_req, res) => {
  try {
    const forms = await UDFForm.find().sort({ updatedAt: -1 });
    res.status(200).json(forms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Get single form by ID
// =======================
export const getFormById = async (req, res) => {
  try {
    const form = await UDFForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(200).json(form);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =======================
// Create a new form
// =======================
export const createForm = async (req, res) => {
  try {
    const form = await UDFForm.create(req.body);
    res.status(201).json(form);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =======================
// Update a form by ID
// =======================
export const updateForm = async (req, res) => {
  try {
    const updatedForm = await UDFForm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json(updatedForm);
  } catch (err) {
    console.error("Update form error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Delete a form by ID
// =======================
export const deleteForm = async (req, res) => {
  try {
    const deletedForm = await UDFForm.findByIdAndDelete(req.params.id);
    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(200).json({ message: "Form deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =======================
// Get metadata for dropdowns
// =======================
export const getMeta = async (_req, res) => {
  try {
    res.status(200).json({
      success: true,
      dataTypes: UDFForm.DATA_TYPES,
      inputTypes: UDFForm.INPUT_TYPES,
    });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch metadata",
    });
  }
};
