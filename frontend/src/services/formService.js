// src/services/formService.js

export const fetchFormDetails = async (token) => {
  try {
    const res = await fetch("http://localhost:5000/api/form/check-form", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  } catch (err) {
    console.error("Fetch form error:", err);
    throw err;
  }
};

export const submitForm = async (formData, token) => {
  return fetch("http://localhost:5000/api/form/submit-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
};

export const updateForm = async (formData, token) => {
  return fetch("http://localhost:5000/api/form/update-form", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
};

export const fetchFormById = async (formId, token) => {
  try {
    const res = await fetch(`http://localhost:5000/api/forms/${formId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch form.");
    }

    return res.json(); // should return { form: { ... } }
  } catch (err) {
    console.error("Fetch form by ID error:", err);
    throw err;
  }
};
