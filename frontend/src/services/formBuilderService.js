// frontend/src/services/formBuilderService.js
const API_BASE = "http://localhost:5000/api/form-builder";

// Template operations
export const createTemplate = async (templateData, token) => {
  const res = await fetch(`${API_BASE}/template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(templateData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create template");
  }
  
  return res.json();
};

export const getUserTemplates = async (token) => {
  const res = await fetch(`${API_BASE}/my-templates`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
};

export const getTemplateById = async (templateId, token = null) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}/template/${templateId}`, { headers });
  
  if (!res.ok) throw new Error("Failed to fetch template");
  return res.json();
};

export const updateTemplate = async (templateId, templateData, token) => {
  const res = await fetch(`${API_BASE}/template/${templateId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(templateData),
  });
  
  if (!res.ok) throw new Error("Failed to update template");
  return res.json();
};

export const deleteTemplate = async (templateId, token) => {
  const res = await fetch(`${API_BASE}/template/${templateId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) throw new Error("Failed to delete template");
  return res.json();
};

// Response operations
export const submitResponse = async (templateId, responseData, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}/template/${templateId}/respond`, {
    method: "POST",
    headers,
    body: JSON.stringify(responseData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to submit response");
  }
  
  return res.json();
};

export const getTemplateResponses = async (templateId, token) => {
  const res = await fetch(`${API_BASE}/template/${templateId}/responses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) throw new Error("Failed to fetch responses");
  return res.json();
};

export const getPublicTemplates = async (page = 1, search = "") => {
  const params = new URLSearchParams({ page, limit: 10 });
  if (search) params.append("search", search);
  
  const res = await fetch(`${API_BASE}/public?${params}`);
  
  if (!res.ok) throw new Error("Failed to fetch public templates");
  return res.json();
};