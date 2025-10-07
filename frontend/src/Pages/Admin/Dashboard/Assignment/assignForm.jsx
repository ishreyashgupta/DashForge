import React, { useState, useEffect } from "react";
import { getAllForms, getAllUsers, assignFormToUser } from "../../../services/adminService";
import useAuth from "../../../hooks/useAuth";

const AssignForm = () => {
  const { token } = useAuth();
  const [forms, setForms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [formsData, usersData] = await Promise.all([
          getAllForms(token),
          getAllUsers(token),
        ]);
        setForms(formsData);
        setUsers(usersData);
      } catch (err) {
        alert("Error loading data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleAssign = async () => {
    if (!selectedForm || !selectedUser) {
      alert("Please select both form and user!");
      return;
    }

    try {
      await assignFormToUser(selectedForm, selectedUser, token);
      alert("✅ Form assigned successfully!");
      setSelectedForm("");
      setSelectedUser("");
    } catch (err) {
      alert("Error assigning form: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "2rem", background: "#fff", borderRadius: 8 }}>
      <h2>Assign Form to User</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>
          <strong>Choose Form</strong>
        </label>
        <select
          className="form-control"
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          <option value="">-- Select Form --</option>
          {forms.map((form) => (
            <option key={form._id} value={form._id}>
              {form.title || form._id}
            </option>
          ))}
        </select>

        <label>
          <strong>Choose User</strong>
        </label>
        <select
          className="form-control"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>

        <button onClick={handleAssign} className="btn btn-primary mt-3">
          Assign Form
        </button>
      </div>
    </div>
  );
};

export default AssignForm;