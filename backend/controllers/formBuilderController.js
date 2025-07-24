// backend/controllers/formBuilderController.js
const FormTemplate = require("../models/FormTemplate");
const FormResponse = require("../models/FormResponse");
const mongoose = require("mongoose");

// CREATE new form template
exports.createTemplate = async (req, res) => {
  try {
    const { title, description, fields, isPublic, allowAnonymous, maxResponses } = req.body;

    // Validate required fields
    if (!title || !fields || fields.length === 0) {
      return res.status(400).json({ 
        message: "Title and at least one field are required" 
      });
    }

    // Validate field structure
    for (let field of fields) {
      if (!field.id || !field.type || !field.label) {
        return res.status(400).json({ 
          message: "Each field must have id, type, and label" 
        });
      }
    }

    const template = new FormTemplate({
      userId: req.user._id,
      title,
      description,
      fields,
      isPublic: isPublic || false,
      allowAnonymous: allowAnonymous !== false,
      maxResponses: maxResponses || null
    });

    await template.save();

    res.status(201).json({
      message: "Form template created successfully",
      template
    });
  } catch (err) {
    console.error("Create template error:", err);
    res.status(500).json({ message: "Failed to create form template" });
  }
};

// GET user's templates
exports.getUserTemplates = async (req, res) => {
  try {
    const templates = await FormTemplate.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({ templates });
  } catch (err) {
    console.error("Get templates error:", err);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};

// GET single template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await FormTemplate.findById(templateId).populate("userId", "name email");

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check if user can access this template
    const canAccess = template.isPublic || 
                     template.userId._id.toString() === req.user._id.toString() ||
                     req.user.role === "admin";

    if (!canAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ template });
  } catch (err) {
    console.error("Get template error:", err);
    res.status(500).json({ message: "Failed to fetch template" });
  }
};

// UPDATE template
exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { title, description, fields, isPublic, allowAnonymous, maxResponses } = req.body;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await FormTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check ownership
    if (template.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update fields
    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (fields) template.fields = fields;
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (allowAnonymous !== undefined) template.allowAnonymous = allowAnonymous;
    if (maxResponses !== undefined) template.maxResponses = maxResponses;

    await template.save();

    res.json({
      message: "Template updated successfully",
      template
    });
  } catch (err) {
    console.error("Update template error:", err);
    res.status(500).json({ message: "Failed to update template" });
  }
};

// DELETE template
exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await FormTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check ownership
    if (template.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await FormTemplate.findByIdAndDelete(templateId);
    // Also delete all responses for this template
    await FormResponse.deleteMany({ templateId });

    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ message: "Failed to delete template" });
  }
};

// SUBMIT response to template
exports.submitResponse = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { responses, respondentEmail } = req.body;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await FormTemplate.findById(templateId);

    if (!template || !template.isActive) {
      return res.status(404).json({ message: "Form not found or inactive" });
    }

    // Check max responses limit
    if (template.maxResponses && template.responseCount >= template.maxResponses) {
      return res.status(400).json({ message: "Maximum responses reached" });
    }

    // Validate responses against template fields
    const processedResponses = [];
    for (let field of template.fields) {
      const response = responses.find(r => r.fieldId === field.id);
      
      if (field.required && (!response || !response.value)) {
        return res.status(400).json({ 
          message: `Field "${field.label}" is required` 
        });
      }

      if (response && response.value) {
        processedResponses.push({
          fieldId: field.id,
          fieldLabel: field.label,
          value: response.value
        });
      }
    }

    const formResponse = new FormResponse({
      templateId,
      respondentId: req.user ? req.user._id : null,
      respondentEmail: respondentEmail || (req.user ? req.user.email : null),
      responses: processedResponses,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await formResponse.save();

    // Increment response count
    await FormTemplate.findByIdAndUpdate(templateId, { 
      $inc: { responseCount: 1 } 
    });

    res.status(201).json({
      message: "Response submitted successfully",
      responseId: formResponse._id
    });
  } catch (err) {
    console.error("Submit response error:", err);
    res.status(500).json({ message: "Failed to submit response" });
  }
};

// GET responses for a template
exports.getTemplateResponses = async (req, res) => {
  try {
    const templateId = req.params.templateId;
    
    const template = await FormTemplate.findById(templateId)
      .populate("userId", "name email");

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const userId = req.user?._id?.toString();
    const isAdmin = req.user?.role === "admin";

    const canAccess = template.isPublic ||
      (userId && template.userId._id.toString() === userId) ||
      isAdmin;

    if (!canAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Fetch related responses
    const responses = await FormResponse.find({ templateId })
      .populate("respondentId", "name email");

    // ✅ Return both
    res.json({
      template,
      responses
    });

  } catch (err) {
    console.error("Error in getTemplateResponses:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET public templates (for browsing)
exports.getPublicTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = { isPublic: true, isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const templates = await FormTemplate.find(query)
      .populate("userId", "name")
      .select('title description responseCount createdAt userId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FormTemplate.countDocuments(query);

    res.json({
      templates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error("Get public templates error:", err);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};