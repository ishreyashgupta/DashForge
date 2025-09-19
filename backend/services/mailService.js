const nodemailer = require("nodemailer");

// ✅ Create transporter using Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,             // or 587
  auth: {
    user: process.env.MAILTRAP_USER,  // from Mailtrap inbox SMTP settings
    pass: process.env.MAILTRAP_PASS,  // from Mailtrap inbox SMTP settings
  },
});


// ✅ Reusable function to send emails
async function sendMail(to, subject, message) {
  try {
    const mailOptions = {
      from: `"UDF Forms" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}:`, info.response);

    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return { success: false, error };
  }
}

module.exports = { sendMail };
