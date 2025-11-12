// src/services/mailService.js
import axios from "axios";

// Base API for admin routes
const BASE_API = "http://localhost:5000/api/admin";

// ✅ Create a reusable Axios instance
const adminApi = axios.create({
  baseURL: BASE_API,
  headers: { "Content-Type": "application/json" },
});

// ===========================
// 📬 Fetch all users
// ===========================
export const getAllUsers = async () => {
  try {
    const res = await adminApi.get("/users");
    return res.data.users || []; // expected backend response: { users: [...] }
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return [];
  }
};

// ===========================
// 📄 Fetch all UDF forms
// ===========================
export const getAllUDFForms = async () => {
  try {
    const res = await adminApi.get("/forms");
    return res.data.forms || []; // expected backend response: { forms: [...] }
  } catch (err) {
    console.error("❌ Error fetching UDF forms:", err);
    return [];
  }
};

// ===========================
// ✉️ Send assignment mail
// ===========================
export const sendAssignmentMail = async ({ userId, formId }) => {
  if (!userId || !formId) {
    console.error("❌ sendAssignmentMail called with missing parameters:", { userId, formId });
    return { success: false, message: "userId and formId are required" };
  }

  try {
    const res = await adminApi.post("/send-assignment-mail", { userId, formId });
    return res.data; // expected: { success: true, message: "Mail sent successfully" }
  } catch (err) {
    console.error("❌ Error sending assignment mail:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to send assignment mail",
    };
  }
};
