// src/services/formService.js
import axios from "axios";

const FORM_API = "http://localhost:5000/api/form";
const FORMS_API = "http://localhost:5000/api/forms";

const formApi = axios.create({
  baseURL: FORM_API,
  headers: { "Content-Type": "application/json" },
});

// --- Fetch form details (legacy) ---
export const fetchFormDetails = async (token) => {
  try {
    const res = await formApi.get("/check-form", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching form details:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch form details");
  }
};

// --- Submit form (legacy) ---
export const submitForm = async (formData, token) => {
  try {
    const res = await formApi.post("/submit-form", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error submitting form:", err);
    throw new Error(err.response?.data?.message || "Failed to submit form");
  }
};

// --- Update form (legacy) ---
export const updateForm = async (formData, token) => {
  try {
    const res = await formApi.put("/update-form", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error updating form:", err);
    throw new Error(err.response?.data?.message || "Failed to update form");
  }
};

// --- Fetch form by ID (optional) ---
export const fetchFormById = async (formId, token) => {
  try {
    const res = await axios.get(`${FORMS_API}/${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { form: {...} }
  } catch (err) {
    console.error("❌ Error fetching form by ID:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch form by ID");
  }
};
