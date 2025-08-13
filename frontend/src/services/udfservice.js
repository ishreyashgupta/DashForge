const API_BASE = "http://localhost:5000/api/udf"; // UDF backend base URL

// Fetch all UDF forms
export const getAllUDFForms = async () => {
  try {
    const res = await fetch(`${API_BASE}/forms`);
    if (!res.ok) throw new Error("Failed to fetch forms");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Fetch single UDF form by ID
export const getUDFFormById = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/forms/${id}`);
    if (!res.ok) throw new Error("Failed to fetch form");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Create new UDF form
export const createUDFForm = async (formData) => {
  try {
    const res = await fetch(`${API_BASE}/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Failed to create form");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Update existing UDF form
export const updateUDFForm = async (id, formData) => {
  try {
    const res = await fetch(`${API_BASE}/forms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Failed to update form");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
