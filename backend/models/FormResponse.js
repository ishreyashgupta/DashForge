const mongoose = require("mongoose");

const responseFieldSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const formResponseSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FormTemplate",
    required: true
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null // null for anonymous responses
  },
  respondentEmail: { type: String }, // for anonymous users
  responses: [responseFieldSchema],
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model("FormResponse", formResponseSchema);
