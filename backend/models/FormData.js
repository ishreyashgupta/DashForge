const mongoose = require("mongoose");

// ✅ Address Sub-schema
const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
}, { _id: false }); // prevents extra _id fields for subdocs


// ✅ Main Form Schema
const formDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // ✅ Ensures one form per user
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  email: { type: String, required: true },
  maritalStatus: {
    type: String,
    enum: ["Married", "Single"],
    required: true,
  },
  communicationAddress: {
    type: addressSchema,
    required: true,
  },
  presentAddress: {
    type: addressSchema,
    required: true,
  },
}, {
  timestamps: true // ✅ adds createdAt and updatedAt fields
});

module.exports = mongoose.model("FormData", formDataSchema);
