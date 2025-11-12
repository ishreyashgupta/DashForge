import axios from "axios";

const API_BASE = "http://localhost:5000/api/user";

// Create a reusable axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ✅ Automatically attach token to each request
function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// --- Fetch all forms assigned to the current user ---
export const getAssignedForms = async (token) => {
  try {
    const res = await api.get("/assignments", authHeaders(token));
    return res.data; // { assignments: [...] }
  } catch (err) {
    console.error("Error fetching assigned forms:", err);
    return { assignments: [] };
  }
};

// --- Fetch a single assignment with its form details ---
export const getSingleAssignment = async (token, assignmentId) => {
  try {
    const res = await api.get("/assignment", {
      ...authHeaders(token),
      params: { assignmentId },
    });
    return res.data; // { form: {...}, assignmentId, status, ... }
  } catch (err) {
    console.error("Error fetching single assignment:", err);
    return null;
  }
};

// --- Update the status of a form assignment ---
export const updateAssignmentStatus = async (token, assignmentId, status) => {
  try {
    const res = await api.put(
      "/assignment/status",
      { assignmentId, status },
      authHeaders(token)
    );
    return res.data; // { success: true/false }
  } catch (err) {
    console.error("Error updating assignment status:", err);
    return { success: false };
  }
};

// --- Submit a filled form (dynamic UDF) ---
export const submitAssignment = async (token, assignmentId, formData) => {
  try {
    const res = await api.post(
      "/assignment/submit",
      { assignmentId, formData },
      authHeaders(token)
    );
    return res.data; // { success, message, responseId }
  } catch (err) {
    console.error("❌ Error submitting assignment:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

// --- Validate assignment token ---
export const getAssignmentByToken = async (token) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/assignments/validate`,
      { params: { token } }
    );
    return res.data;
  } catch (err) {
    console.error("Error validating assignment:", err);
    return { success: false, message: "Failed to fetch assignment" };
  }
};

// --- ✅ Update user profile ---
export const updateUserProfile = async (token, userData) => {
  try {
    const res = await api.put("/profile", userData, authHeaders(token));
    return res.data; // { success: true, user: {...} }
  } catch (err) {
    console.error("Error updating profile:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

// --- ✅ Delete user account ---
export const deleteUserAccount = async (token) => {
  try {
    const res = await api.delete("/delete", authHeaders(token));
    return res.data; // { success: true }
  } catch (err) {
    console.error("Error deleting account:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

// --- Fetch responses for an assignment ---
export const getUserAssignmentResponses = async (token, assignmentId) => {
  try {
    const res = await api.get("/assignment/responses", {
      ...authHeaders(token),
      params: { assignmentId },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching responses:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

// --- ✅ Get assignment edit data ---
export const getAssignmentEditData = async (token, assignmentId) => {
  try {
    if (!assignmentId) throw new Error("Assignment ID is required");

    const res = await api.get("/assignment/edit-data", {
      ...authHeaders(token),
      params: { assignmentId },
    });
    return res.data; // expected: { success, form, responses, etc. }
  } catch (err) {
    console.error("Error fetching edit data:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

// --- ✅ Update an existing assignment response (edit mode) ---
export const updateAssignmentResponse = async (token, assignmentId, payload) => {
  try {
    const res = await api.put(
      "/assignment/update-response",
      payload,
      {
        ...authHeaders(token),
        params: { assignmentId },
      }
    );
    return res.data; // { success, message, updatedResponse }
  } catch (err) {
    console.error("Error updating assignment response:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};
