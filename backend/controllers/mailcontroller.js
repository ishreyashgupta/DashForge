// controllers/mailController.js
const mongoose = require("mongoose");
const FormAssignment = require("../models/FormAssignment");
const UDFForm = require("../models/UDFForm");
const User = require("../models/User");
const { sendMail } = require("../services/mailService");
const crypto = require("crypto");

// ✅ Formatter function
const formatAssignment = (assignment, form, user) => ({
  assignmentId: assignment._id,
  formId: form ? form._id : assignment.formId,
  formName: form ? form.name : undefined,
  formDescription: form ? form.description : undefined,
  userId: user ? user._id : assignment.userId,
  userName: user ? user.name : undefined,
  userEmail: user ? user.email : undefined,
  status: assignment.status,
  assignedAt: assignment.assignedAt,
  completedAt: assignment.completedAt || null,
  surveyToken: assignment.surveyToken,
});

exports.sendAssignmentMail = async (req, res) => {
  try {
    const { formId, userId } = req.body;

    // ✅ Check required fields
    if (!formId || !userId) {
      return res.status(400).json({ success: false, message: "formId and userId are required" });
    }

    // ✅ Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ success: false, message: "Invalid formId" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // ✅ Fetch form and user
    const form = await UDFForm.findById(formId);
    if (!form) return res.status(404).json({ success: false, message: "Form not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Check if assignment already exists
    let assignment = await FormAssignment.findOne({ userId, formId });
    if (!assignment) {
      assignment = new FormAssignment({
        userId,
        formId,
        surveyToken: crypto.randomUUID(),
        status: "sent",
      });
      await assignment.save();
    }

    // ✅ Prepare email
    
    const formLink = `http://localhost:5173/form?token=${assignment.surveyToken}`;
    const subject = `Please Fill Out: ${form.name}`;
    const message = `
Hi ${user.name || "User"},

You've been invited to fill out the form: ${form.name}.

Click below to open the form:
${formLink}

Best regards,  
UDF Forms Team
    `;

    // ✅ Send email
    const emailResult = await sendMail(user.email, subject, message);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Email sending failed",
        error: emailResult.error,
      });
    }

    // ✅ Success response
    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      assignment: formatAssignment(assignment, form, user),
    });
  } catch (error) {
    console.error("❌ Error in sendAssignmentMail:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
