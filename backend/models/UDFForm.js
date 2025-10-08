const mongoose = require("mongoose");

// ✅ Data types for input fields
const DATA_TYPES = [
  "string", "number", "boolean", "date", "datetime",
  "email", "url", "file", "json"
];

// ✅ Input types for form fields
const INPUT_TYPES = [
  "text", "number", "email", "password", "textarea",
  "select", "multiselect", "radio", "checkbox",
  "date", "datetime-local", "file", "url", "color", "range"
];

// ✅ Field types: normal input or pageBreak
const FIELD_TYPES = ["input", "pageBreak"];

// Option sub-schema
const OptionSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false });

// Field schema
const FieldSchema = new mongoose.Schema({
  fieldType: { type: String, enum: FIELD_TYPES, default: "input" },

  // Input fields
  fieldName: {
    type: String,
    trim: true,
    required: function() { return this.fieldType === "input"; },
  },
  label: {
    type: String,
    trim: true,
    required: function() { return this.fieldType === "input"; },
  },
  inputType: {
    type: String,
    enum: INPUT_TYPES,
    required: function() { return this.fieldType === "input"; },
  },
  dataType: {
    type: String,
    enum: DATA_TYPES,
  },

  // Metadata
  placeholder: { type: String, default: "" },
  helpText: { type: String, default: "" },
  required: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  defaultValue: { type: mongoose.Schema.Types.Mixed, default: "" },
  options: { type: [OptionSchema], default: [] },

  // Validation
  validation: {
    type: new mongoose.Schema({
      minLength: { type: Number },
      maxLength: { type: Number },
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String },
    }, { _id: false }),
    default: {},
  },

  // Conditional visibility
  visibleIf: {
    type: new mongoose.Schema({ field: String, equals: mongoose.Schema.Types.Mixed }, { _id: false }),
    default: null,
  },
}, { _id: false });

// Pre-validation for pageBreaks & inputType checks
FieldSchema.pre("validate", function(next) {
  if (this.fieldType === "pageBreak") return next();

  // Options required for multi-choice fields
  const needsOptions = ["select", "multiselect", "radio", "checkbox"].includes(this.inputType);
  if (needsOptions && (!this.options || this.options.length === 0)) {
    return next(new Error(`Field "${this.fieldName}" requires non-empty options for inputType ${this.inputType}`));
  }

  // Input-type vs dataType checks
  if (this.inputType === "checkbox" && this.dataType !== "boolean") {
    return next(new Error(`Field "${this.fieldName}" with inputType checkbox must have dataType boolean`));
  }
  if (this.inputType === "number" && this.dataType !== "number") {
    return next(new Error(`Field "${this.fieldName}" with inputType number must have dataType number`));
  }
  if (this.inputType === "email" && this.dataType !== "email") {
    return next(new Error(`Field "${this.fieldName}" with inputType email must have dataType email`));
  }
  if (this.inputType === "url" && this.dataType !== "url") {
    return next(new Error(`Field "${this.fieldName}" with inputType url must have dataType url`));
  }

  next();
});

// UDFForm schema
const UDFFormSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: "" },
  fields: { type: [FieldSchema], default: [] },
  category: { type: String, default: "default" },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

// Statics for metadata
UDFFormSchema.statics.DATA_TYPES = DATA_TYPES;
UDFFormSchema.statics.INPUT_TYPES = INPUT_TYPES;
UDFFormSchema.statics.FIELD_TYPES = FIELD_TYPES;

module.exports = mongoose.model("UDFForm", UDFFormSchema);
