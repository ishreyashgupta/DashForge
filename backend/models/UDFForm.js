const mongoose = require("mongoose");

// ✅ Add "none" for dataType since pageBreak doesn't need a datatype
const DATA_TYPES = [
  "string", "number", "boolean", "date", "datetime",
  "email", "url", "file", "json", "none" // ✅ Added
];

// ✅ Add "pageBreak" for splitting forms into pages
const INPUT_TYPES = [
  "text", "number", "email", "password", "textarea",
  "select", "multiselect", "radio", "checkbox",
  "date", "datetime-local", "file", "url", "color", "range",
  "pageBreak" // ✅ Added here
];

const OptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const FieldSchema = new mongoose.Schema(
  {
    fieldName: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    dataType: { type: String, enum: DATA_TYPES, required: true },
    inputType: { type: String, enum: INPUT_TYPES, required: true },

    placeholder: { type: String, default: "" },
    helpText: { type: String, default: "" },

    required: { type: Boolean, default: false },
    defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },

    options: { type: [OptionSchema], default: [] },

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

// ✅ Update pre-validation checks
FieldSchema.pre("validate", function (next) {
  // Skip validation for pageBreak fields
  if (this.inputType === "pageBreak") {
    this.dataType = "none"; // ✅ Force datatype to "none" automatically
    return next();
  }

  const needsOptions = ["select", "multiselect", "radio"].includes(this.inputType);
  if (needsOptions && (!this.options || this.options.length === 0)) {
    return next(new Error(`Field "${this.fieldName}" requires non-empty options for inputType ${this.inputType}`));
  }
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

module.exports = mongoose.model("UDFForm", UDFFormSchema);
