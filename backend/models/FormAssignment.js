const mongoose = require("mongoose");

const formAssignmentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    formId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "UDFForm", 
      required: true 
    },
    surveyToken: { 
      type: String, 
      required: true, 
      unique: true 
    },

    // ✅ Single status field (sent → opened → completed)
    status: { 
      type: String, 
      enum: ["sent", "opened", "completed"], 
      default: "sent" 
    },

    // Track expiry if needed
    expiresAt: { 
      type: Date, 
      default: null 
    },

    // Track when assigned & completed
    assignedAt: { 
      type: Date, 
      default: Date.now 
    },
    completedAt: { 
      type: Date 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormAssignment", formAssignmentSchema);
