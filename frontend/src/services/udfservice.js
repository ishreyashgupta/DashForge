const API_BASE = "http://localhost:5000/api/udf";
const RESPONSES_API = "http://localhost:5000/api/responses";

// =======================
// UDF Forms
// =======================

// Fetch all forms (full forms)
export const getAllUDFForms = async () => {
  const res = await fetch(`${API_BASE}/`);
  if (!res.ok) throw new Error("Failed to fetch forms");
  return res.json();
};

// Delete form by ID
export const deleteUDFForm = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete form");
  return res.json();
};

// Update form by ID
export const updateUDFForm = async (id, data) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update form");
  return res.json();
};

// Create a new form
export const createUDFForm = async (payload) => {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Get single form by ID
export const getUDFFormById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch UDF form by ID");
  return res.json();
};

// Get metadata for frontend dropdowns
export const getMeta = async () => {
  const res = await fetch(`${API_BASE}/meta`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Submit a response ✅
export const submitUDFResponse = async (formId, values) => {
  const res = await fetch(`${RESPONSES_API}/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error("Failed to submit response");
  return res.json();
};

// Get all responses for a form ✅
export const getUDFResponses = async (formId) => {
  const res = await fetch(`${RESPONSES_API}/${formId}`);
  if (!res.ok) throw new Error("Failed to fetch responses");
  return res.json();
};
