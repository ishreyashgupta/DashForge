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
// Lightweight UDF Forms (only id + title)
// =======================
export const getFormList = async (token) => {
  const res = await axios.get(`${BASE_UDF_API}/forms/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // [{ _id, name }, ...]
};
