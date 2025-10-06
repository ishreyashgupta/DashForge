// src/services/userService.js
const API_BASE = "http://localhost:5000/api/user";

export const getAssignedForms = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch assigned forms");
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSingleAssignment = async (token, assignmentId) => {
  try {
    const res = await fetch(`${API_BASE}/assignment?assignmentId=${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch assignment");
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

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
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};
