import axios from "axios";

const API_BASE = "http://localhost:5000/api/user";

// --- Fetch all forms assigned to the current user ---
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

// --- Fetch a single assignment with its form details ---
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

// --- Update the status of a form assignment ---
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

// --- Submit a filled form (dynamic UDF) ---
export const submitAssignment = async (token, assignmentId, formData) => {
  try {
    const res = await fetch(`http://localhost:5000/api/user/assignment/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assignmentId, formData }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to submit form");
    return data; // { success, message, responseId }
  } catch (err) {
    console.error("❌ Error submitting assignment:", err);
    return { success: false, message: err.message };
  }
};

// --- Validate assignment token ---
export const getAssignmentByToken = async (token) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/assignments/validate?token=${token}`);
    if (res.data?.success && res.data.assignment) {
      return {
        assignmentId: res.data.assignment.id,
        status: res.data.assignment.status,
        form: res.data.form,
      };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to fetch assignment" };
  }
};

/// --- ✅ Update user profile ---
export const updateUserProfile = async (token, userData) => {
  try {
    const res = await fetch(`http://localhost:5000/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error("Failed to update profile");
    const data = await res.json();
    return data; // expected: { success: true, user: {...} }
  } catch (err) {
    console.error("Error updating profile:", err);
    return { success: false, message: err.message };
  }
};

// --- ✅ Delete user account ---
export const deleteUserAccount = async (token) => {
  try {
    const res = await fetch(`http://localhost:5000/api/user/delete`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete account");
    const data = await res.json();
    return data; // expected: { success: true }
  } catch (err) {
    console.error("Error deleting account:", err);
    return { success: false, message: err.message };
  }
};
export const getUserAssignmentResponses = async (jwtToken, assignmentId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/user/assignment/responses?assignmentId=${assignmentId}`,
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch responses");
  return data;
};

