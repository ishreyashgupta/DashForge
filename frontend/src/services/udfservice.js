import axios from "axios";

const API_BASE = "http://localhost:5000/api/udf";
const RESPONSES_API = "http://localhost:5000/api/responses";

// ✅ Create reusable Axios instances for UDF and Responses
const udfApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

const responseApi = axios.create({
  baseURL: RESPONSES_API,
  headers: { "Content-Type": "application/json" },
});

// =======================
// 🧩 UDF Forms
// =======================

// --- Get all forms ---
export const getAllUDFForms = async () => {
  try {
    const res = await udfApi.get("/");
    return res.data; // { forms: [...] }
  } catch (err) {
    console.error("❌ Error fetching all UDF forms:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch forms");
  }
};

// --- Delete form by ID ---
export const deleteUDFForm = async (id) => {
  try {
    const res = await udfApi.delete(`/${id}`);
    return res.data; // { success: true }
  } catch (err) {
    console.error("❌ Error deleting UDF form:", err);
    throw new Error(err.response?.data?.message || "Failed to delete form");
  }
};

// --- Update form by ID ---
export const updateUDFForm = async (id, data) => {
  try {
    const res = await udfApi.put(`/${id}`, data);
    return res.data; // { success, updatedForm }
  } catch (err) {
    console.error("❌ Error updating UDF form:", err);
    throw new Error(err.response?.data?.message || "Failed to update form");
  }
};

// --- Create a new form ---
export const createUDFForm = async (payload) => {
  try {
    const res = await udfApi.post("/", payload);
    return res.data; // { success, form }
  } catch (err) {
    console.error("❌ Error creating UDF form:", err);
    throw new Error(err.response?.data?.message || "Failed to create form");
  }
};

// --- Get single form by ID ---
export const getUDFFormById = async (id) => {
  try {
    const res = await udfApi.get(`/${id}`);
    return res.data; // { success, form }
  } catch (err) {
    console.error("❌ Error fetching UDF form by ID:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch UDF form by ID");
  }
};

// --- Get metadata (for dropdowns etc.) ---
export const getMeta = async () => {
  try {
    const res = await udfApi.get("/meta");
    return res.data; // { metaData: {...} }
  } catch (err) {
    console.error("❌ Error fetching UDF meta:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch metadata");
  }
};

// =======================
// 🧾 Responses
// =======================

// --- Submit a response ---
export const submitUDFResponse = async (formId, values) => {
  if (!formId || typeof formId !== "string") {
    console.error("❌ submitUDFResponse called without valid formId:", formId);
    throw new Error("Invalid formId — cannot submit response.");
  }

  try {
    const res = await responseApi.post(`/${formId}`, values);
    return res.data; // { success, message, responseId }
  } catch (err) {
    console.error("❌ Error submitting response:", err);
    throw new Error(err.response?.data?.message || "Failed to submit response");
  }
};

// --- Get all responses for a form ---
export const getUDFResponses = async (formId) => {
  if (!formId || typeof formId !== "string") {
    throw new Error("Invalid formId — cannot fetch responses.");
  }

  try {
    const res = await responseApi.get(`/${formId}`);
    console.log("✅ Responses fetched for form:", formId, res.data);
    return res.data; // { success, responses: [...] }
  } catch (err) {
    console.error("❌ Error fetching UDF responses:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch responses");
  }
};
