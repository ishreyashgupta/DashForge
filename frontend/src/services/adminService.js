import axios from "axios";

const BASE_ADMIN_API = "http://localhost:5000/api/admin";
const BASE_USER_API = "http://localhost:5000/api/user";
const BASE_ASSIGN_API = "http://localhost:5000/api/assignments"; // matches backend
const BASE_UDF_API = "http://localhost:5000/api/udf"; // ✅ UDF API base

// =======================
// Admin Forms (full forms)
// =======================
export const getAllForms = async (token) => {
  const res = await axios.get(`${BASE_ADMIN_API}/forms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getFormByFormId = async (formId, token) => {
  const res = await axios.get(`${BASE_ADMIN_API}/forms/${formId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateFormByFormId = async (formId, formData, token) => {
  const res = await axios.put(`${BASE_ADMIN_API}/forms/${formId}`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteFormByFormId = async (formId, token) => {
  const res = await axios.delete(`${BASE_ADMIN_API}/forms/${formId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// =======================
// Users
// =======================
export const getAllUsers = async (token) => {
  const res = await axios.get(`${BASE_ADMIN_API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// =======================
// Assignments
// =======================
export const assignFormToUser = async (formId, userId, token) => {
  const res = await axios.post(
    `${BASE_ASSIGN_API}/assign`,
    { formId, userId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const bulkAssignForms = async (formId, userIds, token) => {
  const res = await axios.post(
    `${BASE_ASSIGN_API}/bulk-assign`,
    { formId, userIds },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getUserAssignments = async (userId, token) => {
  const res = await axios.get(`${BASE_ASSIGN_API}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateAssignmentStatus = async (tokenValue, status, token) => {
  const res = await axios.put(
    `${BASE_ASSIGN_API}/status`,
    { token: tokenValue, status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// =======================
// UDF Forms (lightweight list)
// =======================
export const getFormList = async (token) => {
  const res = await axios.get(`${BASE_UDF_API}/list`, {  // ✅ updated URL
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // [{ _id, name }, ...]
};

// Optional: Fetch single UDF form by ID (admin)
export const getUDFFormById = async (id, token) => {
  const res = await axios.get(`${BASE_UDF_API}/${id}`, {  // ✅ updated URL
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Optional: Create new UDF form
export const createUDFForm = async (payload, token) => {
  const res = await axios.post(`${BASE_UDF_API}/`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Optional: Update UDF form by ID
export const updateUDFForm = async (id, payload, token) => {
  const res = await axios.put(`${BASE_UDF_API}/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Optional: Delete UDF form by ID
export const deleteUDFForm = async (id, token) => {
  const res = await axios.delete(`${BASE_UDF_API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
// src/services/adminService.js
const API_BASE = "http://localhost:5000/api";

// ✅ Fetch all assignments
export const getAllAssignments = async (token) => {
  const res = await fetch(`${API_BASE}/admin/assignments`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch assignments");
  }

  return res.json();
};

// ✅ Delete a specific assignment by ID
export const deleteAssignment = async (assignmentId, token) => {
  const res = await fetch(`${API_BASE}/admin/assignments/${assignmentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete assignment");
  }

  return res.json();
};
