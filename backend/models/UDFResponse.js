const mongoose = require("mongoose");

const UDFResponseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UDFForm",
      required: true,
    },
    data: {
      type: Object, // Stores all field values submitted by user
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UDFResponse", UDFResponseSchema);
