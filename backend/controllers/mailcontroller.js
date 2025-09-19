// controllers/mailController.js
const FormAssignment = require("../models/FormAssignment");
const UDFForm = require("../models/UDFForm");
const User = require("../models/User");
const { sendMail } = require("../services/mailService");

// ✅ Use the same formatter from assignment controller
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
});

/**
 * Send mail for a given assignment
 */
exports.sendAssignmentMail = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "assignmentId is required" });
    }

    const assignment = await FormAssignment.findById(assignmentId)
      .populate("formId", "name description")
      .populate("userId", "name email");
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

  const formLink = `http://localhost:5173/form?token=${assignment.surveyToken}`;
    const subject = `Please Fill Out: ${assignment.formId.name}`;
    const message = `
Hi ${assignment.userId.name || "User"},

You've been invited to fill out the form: ${assignment.formId.name}.

Click below to open the form:
${formLink}

Best regards,  
UDF Forms Team
    `;

    const emailResult = await sendMail(assignment.userId.email, subject, message);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Email sending failed",
        error: emailResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      assignment: formatAssignment(assignment, assignment.formId, assignment.userId),
    });
  } catch (error) {
    console.error("❌ Error in sendAssignmentMail:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
