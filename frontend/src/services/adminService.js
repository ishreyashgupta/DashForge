const API = "http://localhost:5000/api/admin";
import axios from "axios";

export const getAllForms = async (token) => {
  const res = await fetch(`${API}/forms`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch forms");

  return res.json();
};

export const getFormByFormId = async (formId, token) => {
  const res = await fetch(`${API}/forms/${formId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch form");

  return res.json();
};

export const updateFormByFormId = async (formId, formData, token) => {
  const res = await fetch(`${API}/forms/${formId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error("Failed to update form");

  return res.json();
};

export const deleteFormByFormId = async (formId, token) => {
  const res = await fetch(`${API}/forms/${formId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete form");

  return res.json();
};


// Assign Form to User
export const assignFormToUser = async (formId, userId, token) => {
  const res = await axios.post(
    `${API}/forms/${formId}/assign`, // ✅ use API, not API_URL
    { userId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Get All Users
export const getAllUsers = async (token) => {
  const res = await axios.get(`${API}/users`, { // ✅ use API
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
