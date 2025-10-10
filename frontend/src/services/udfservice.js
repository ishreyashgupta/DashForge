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
  if (!formId || typeof formId !== "string") {
    console.error("❌ submitUDFResponse called without a valid formId:", formId);
    throw new Error("Invalid formId — cannot submit response.");
  }

  const res = await fetch(`${RESPONSES_API}/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error submitting response:", errorText);
    throw new Error(`Failed to submit response: ${res.statusText}`);
  }

  return res.json();
};

// Get all responses for a form ✅
export const getUDFResponses = async (formId) => {
  if (!formId || typeof formId !== "string") {
    console.error("❌ getUDFResponses called without a valid formId:", formId);
    throw new Error("Invalid formId — cannot fetch responses.");
  }

  const res = await fetch(`${RESPONSES_API}/${formId}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error fetching responses:", errorText);
    throw new Error(`Failed to fetch responses: ${res.statusText}`);
  }

  return res.json();
};
