const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  required: { type: Boolean, default: false },
  defaultValue: { type: String, default: "" },
});

const fieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  dataType: { type: String, required: true },
  inputType: { type: String, required: true },
  properties: propertySchema,
});

const udfFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [fieldSchema],
  createdBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("UDFForm", udfFormSchema);
