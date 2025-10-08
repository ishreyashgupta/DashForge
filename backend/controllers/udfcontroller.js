import UDFForm from "../models/UDFForm.js";

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
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.status(200).json(form);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =======================
// Create a new form
// =======================
export const createUDFForm = async (req, res) => {
  try {
    const payload = cleanFields(req.body);
    const form = await UDFForm.create(payload);
    res.status(201).json(form);
  } catch (err) {
    console.error("Create form error:", err);
    res.status(400).json({ message: err.message });
  }
};

// =======================
// Update a form by ID
// =======================
export const updateUDFForm = async (req, res) => {
  try {
    const payload = cleanFields(req.body);
    const updatedForm = await UDFForm.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updatedForm) return res.status(404).json({ message: "Form not found" });
    res.status(200).json(updatedForm);
  } catch (err) {
    console.error("Update form error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Delete a form by ID
// =======================
export const deleteUDFForm = async (req, res) => {
  try {
    const deletedForm = await UDFForm.findByIdAndDelete(req.params.id);
    if (!deletedForm) return res.status(404).json({ message: "Form not found" });
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
    res.status(500).json({ success: false, message: "Failed to fetch metadata" });
  }
};

// =======================
// Get form list (id + name)
// =======================
export const getFormList = async (_req, res) => {
  try {
    const forms = await UDFForm.find({}, "_id name").sort({ updatedAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching form list:", error);
    res.status(500).json({ success: false, message: "Failed to fetch form list" });
  }
};

// =======================
// Helper: clean fields to match frontend structure
// =======================
function cleanFields(body) {
  const { name, description, fields } = body;

  const cleanedFields = (fields || []).map(f => {
    const field = { ...f };

    // Ensure fieldType exists
    field.fieldType = field.fieldType || "input";

    // Clear options for non-option inputTypes
    if (!["select", "multiselect", "radio", "checkbox"].includes(field.inputType)) {
      field.options = [];
    } else {
      // Ensure options array exists
      field.options = Array.isArray(field.options) ? field.options : [];
    }

    // Ensure validation object exists
    field.validation = field.validation || {};
    ["min", "max", "minLength", "maxLength"].forEach(key => {
      field.validation[key] = field.validation[key] !== "" && field.validation[key] != null
        ? Number(field.validation[key])
        : undefined;
    });

    // Page breaks have empty validation
    if (field.fieldType === "pageBreak") field.validation = {};

    return field;
  });

  return { name, description, fields: cleanedFields };
}
