const API = "http://localhost:5000/api/admin";

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
