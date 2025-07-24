const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date'],
    required: true
  },
  label: { type: String, required: true },
  placeholder: { type: String, default: "" },
  required: { type: Boolean, default: false },
  options: [{ type: String }], // for select, radio, checkbox
  validation: {
    minLength: Number,
    maxLength: Number,
    pattern: String
  }
}, { _id: false });

const formTemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  fields: [fieldSchema],
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false },
  allowAnonymous: { type: Boolean, default: true },
  maxResponses: { type: Number, default: null },
  responseCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model("FormTemplate", formTemplateSchema);
