// src/services/adminService.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";
const BASE_ADMIN_API = `${API_BASE}/admin`;
const BASE_ASSIGN_API = `${API_BASE}/assignments`;
const BASE_UDF_API = `${API_BASE}/udf`;
const BASE_MAIL_API = `${API_BASE}/mail`;

// ✅ Axios instance (optional centralization)
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// =======================
// 👥 Users
// =======================
export const getAllUsers = async (token) => {
  try {
    const res = await api.get("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch users");
  }
};

// =======================
// 🧾 Assignments
// =======================
export const assignFormToUser = async (formId, userId, token) => {
  try {
    const res = await api.post(
      "/assignments/assign",
      { formId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("❌ Error assigning form:", err);
    throw new Error(err.response?.data?.message || "Failed to assign form");
  }
};

export const bulkAssignForms = async (formId, userIds, token) => {
  try {
    const res = await api.post(
      "/assignments/bulk-assign",
      { formId, userIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("❌ Error bulk-assigning forms:", err);
    throw new Error(err.response?.data?.message || "Failed to bulk assign forms");
  }
};

export const getUserAssignments = async (userId, token) => {
  try {
    const res = await api.get(`/assignments/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching user assignments:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch user assignments");
  }
};

export const updateAssignmentStatus = async (tokenValue, status, token) => {
  try {
    const res = await api.put(
      "/assignments/status",
      { token: tokenValue, status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("❌ Error updating assignment status:", err);
    throw new Error(err.response?.data?.message || "Failed to update status");
  }
};

export const getAllAssignments = async (token) => {
  try {
    const res = await api.get("/assignments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching assignments:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch assignments");
  }
};

export const deleteAssignment = async (assignmentId, token) => {
  try {
    const res = await api.delete(`/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error deleting assignment:", err);
    throw new Error(err.response?.data?.message || "Failed to delete assignment");
  }
};

// =======================
// 🧩 UDF Forms
// =======================
export const getFormList = async (token) => {
  try {
    const res = await api.get("/udf/list", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching UDF form list:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch form list");
  }
};

export const getUDFFormById = async (id, token) => {
  try {
    const res = await api.get(`/udf/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching UDF form by ID:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch form by ID");
  }
};

export const createUDFForm = async (payload, token) => {
  try {
    const res = await api.post("/udf", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error creating UDF form:", err);
    throw new Error(err.response?.data?.message || "Failed to create form");
  }
};

export const updateUDFForm = async (id, payload, token) => {
  try {
    const res = await api.put(`/udf/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error updating UDF form:", err);
    throw new Error(err.response?.data?.message || "Failed to update form");
  }
};

export const deleteUDFForm = async (id, token) => {
  try {
    const res = await api.delete(`/udf/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error deleting UDF form:", err);
    throw new Error(err.response?.data?.message || "Failed to delete form");
  }
};

// =======================
// ✉️ Send Assignment Mail
// =======================
export const sendAssignmentMail = async ({ formId, userId }, token) => {
  try {
    const res = await api.post(
      "/mail/send",
      { formId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; // { success, message, ... }
  } catch (err) {
    console.error("❌ Error sending assignment mail:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};
