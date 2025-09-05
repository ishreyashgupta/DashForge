const mongoose = require("mongoose");

// ✅ Data types for actual input fields only
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

// ✅ Field types: Distinguish between "input" fields & "pageBreak"
const FIELD_TYPES = ["input", "pageBreak"];

const OptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const FieldSchema = new mongoose.Schema(
  {
    // ✅ Distinguish between normal fields & page breaks
    fieldType: { type: String, enum: FIELD_TYPES, default: "input" },

    // ✅ These are only required for input fields
    fieldName: {
      type: String,
      trim: true,
      required: function () {
        return this.fieldType === "input";
      },
    },
    label: {
      type: String,
      trim: true,
      required: function () {
        return this.fieldType === "input";
      },
    },
    dataType: {
      type: String,
      enum: DATA_TYPES,
      required: function () {
        return this.fieldType === "input";
      },
    },
    inputType: {
      type: String,
      enum: INPUT_TYPES,
      required: function () {
        return this.fieldType === "input";
      },
    },

    // ✅ Optional metadata
    placeholder: { type: String, default: "" },
    helpText: { type: String, default: "" },
    required: { type: Boolean, default: false },
    defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },
    options: { type: [OptionSchema], default: [] },

    // ✅ Validation rules for input fields only
    validation: {
      type: new mongoose.Schema(
        {
          minLength: { type: Number },
          maxLength: { type: Number },
          min: { type: Number },
          max: { type: Number },
          pattern: { type: String },
        },
        { _id: false }
      ),
      default: {},
    },

    // ✅ Conditional visibility
    visibleIf: {
      type: new mongoose.Schema(
        { field: String, equals: mongoose.Schema.Types.Mixed },
        { _id: false }
      ),
      default: null,
    },
  },
  { _id: false }
);

// ✅ Pre-validation: Skip checks for pageBreak fields
FieldSchema.pre("validate", function (next) {
  if (this.fieldType === "pageBreak") {
    return next(); // No validation needed for page breaks
  }

  // 🔹 Validation for option-based fields
  const needsOptions = ["select", "multiselect", "radio"].includes(this.inputType);
  if (needsOptions && (!this.options || this.options.length === 0)) {
    return next(
      new Error(`Field "${this.fieldName}" requires non-empty options for inputType ${this.inputType}`)
    );
  }

  // 🔹 Input-type-specific validation
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

const UDFFormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    fields: { type: [FieldSchema], default: [] },
    category: { type: String, default: "default" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UDFFormSchema.statics.DATA_TYPES = DATA_TYPES;
UDFFormSchema.statics.INPUT_TYPES = INPUT_TYPES;
UDFFormSchema.statics.FIELD_TYPES = FIELD_TYPES;

module.exports = mongoose.model("UDFForm", UDFFormSchema);
