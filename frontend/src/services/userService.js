const API_BASE = "http://localhost:5000/api/user";

// Fetch all forms assigned to the current user
export const getAssignedForms = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch assigned forms");
    const data = await res.json();
    return data; // { assignments: [...] }
  } catch (err) {
    console.error(err);
    return { assignments: [] };
  }
};

// Fetch a single assignment with its form details
export const getSingleAssignment = async (token, assignmentId) => {
  try {
    const res = await fetch(`${API_BASE}/assignment?assignmentId=${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch assignment");
    return res.json(); // { form: {...}, assignmentId, status, ... }
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Update the status of a form assignment
export const updateAssignmentStatus = async (token, assignmentId, status) => {
  try {
    const res = await fetch(`${API_BASE}/assignment/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assignmentId, status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json(); // { success: true/false }
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

// --- NEW: Submit a filled form (dynamic UDF) ---
export const submitAssignment = async (token, assignmentId, formData) => {
  try {
    const res = await fetch(`${API_BASE}/assignment/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assignmentId, formData }),
    });
    if (!res.ok) throw new Error("Failed to submit form");
    return res.json(); // { success: true/false, message }
  } catch (err) {
    console.error(err);
    return { success: false, message: "Submission failed" };
  }
};
