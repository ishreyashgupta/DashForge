// src/services/adminService.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";
const BASE_ADMIN_API = `${API_BASE}/admin`;
const BASE_ASSIGN_API = `${API_BASE}/assignments`;
const BASE_UDF_API = `${API_BASE}/udf`;
const BASE_MAIL_API = `${API_BASE}/mail`;
// =======================
// Forms
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

export const getAllAssignments = async (token) => {
  const res = await fetch(`${BASE_ASSIGN_API}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch assignments");
  }

  return res.json();
};

export const deleteAssignment = async (assignmentId, token) => {
  const res = await fetch(`${BASE_ASSIGN_API}/${assignmentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete assignment");
  }

  return res.json();
};

// =======================
// UDF Forms (lightweight)
// =======================

export const getFormList = async (token) => {
  const res = await axios.get(`${BASE_UDF_API}/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUDFFormById = async (id, token) => {
  const res = await axios.get(`${BASE_UDF_API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createUDFForm = async (payload, token) => {
  const res = await axios.post(`${BASE_UDF_API}/`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateUDFForm = async (id, payload, token) => {
  const res = await axios.put(`${BASE_UDF_API}/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const deleteUDFForm = async (id, token) => {
  const res = await axios.delete(`${BASE_UDF_API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// =======================
// Send Assignment Mail
// =======================

export const sendAssignmentMail = async ({ formId, userId }, token) => {
  try {
    const res = await axios.post(
      `${BASE_MAIL_API}/send`,
      { formId, userId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data; // { success, assignment, message, ... }
  } catch (error) {
    console.error("Error sending assignment mail:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
