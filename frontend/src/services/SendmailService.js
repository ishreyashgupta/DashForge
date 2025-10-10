// src/services/mailService.js
import axios from "axios";

const BASE_API = "http://localhost:5000/api/admin"; // adjust if needed

// ===========================
// Fetch all users
// ===========================
export const getAllUsers = async () => {
  try {
    const res = await axios.get(`${BASE_API}/users`);
    return res.data.users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// ===========================
// Fetch all forms
// ===========================
export const getAllUDFForms = async () => {
  try {
    const res = await axios.get(`${BASE_API}/forms`);
    return res.data.forms || [];
  } catch (error) {
    console.error("Error fetching forms:", error);
    return [];
  }
};

// ===========================
// Send assignment mail
// ===========================
export const sendAssignmentMail = async ({ userId, formId }) => {
  try {
    const res = await axios.post(`${BASE_API}/send-assignment-mail`, { userId, formId });
    return res.data;
  } catch (error) {
    console.error("Error sending assignment mail:", error);
    return { success: false, message: error.message || "Failed to send mail" };
  }
};
