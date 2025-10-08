import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

// services
import { getAllForms, getFormList, deleteFormByFormId, getAllUsers, assignFormToUser } from "../../../services/adminService";

// hooks
import useAuth from "../../../hooks/useAuth";

// components
import ViewFormModal from "./../../User/Dashboard/ViewFormModal";
import UDFBuilder from "./UDF/UDFBuilder";
import SavedUDFForms from "./UDF/SavedUDFForms";
import ViewResponses from "../Dashboard/ViewResponses/ViewResponses"; // ✅ adjust path if needed
import { Button, Typography, Box } from "@mui/material";

// styles
import "../../../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("manage"); // 👈 Track current section
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  const navigate = useNavigate();
  const { token, role } = useAuth();
  // memoize column helper so it's stable between renders (prevents unnecessary re-creation)
  const columnHelper = useMemo(() => createColumnHelper(), []);

  // ✅ Protect route
  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    } else if (token) {
      fetchForms();
    }
  }, [role, token, navigate]);

  // ✅ Fetch forms
  const fetchForms = async () => {
    try {
      const data = await getAllForms(token);
      setForms(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete
  const handleDelete = async (formId) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteFormByFormId(formId, token);
        fetchForms();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // ✅ Send Mail (placeholder)
  const handleSendMail = async (assignmentId) => {
  try {
    const response = await fetch("http://localhost:5000/api/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignmentId }),
    });

    const data = await response.json();

    if (data.success) {
      alert(`📧 Mail sent successfully for form ID: ${assignmentId}`);
    } else {
      alert(`❌ Mail failed for form ID: ${assignmentId}\nReason: ${data.message}`);
    }
  } catch (error) {
    console.error("Error sending mail:", error);
    alert(`❌ Unexpected error: ${error.message}`);
  }
};


  // ✅ Table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("userId", {
        header: "User ID",
        cell: (info) => info.getValue()?._id,
      }),
      columnHelper.accessor("userId.email", {
        header: "Email",
        cell: (info) => info.row.original.userId?.email,
      }),
      columnHelper.accessor("userId.name", {
        header: "Name",
        cell: (info) => info.row.original.userId?.name,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const form = row.original;
          const formId = form._id;
          return (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setSelectedForm(form);
                  setViewMode(true);
                }}
                className="btn btn-sm btn-primary"
              >
                View
              </button>
              <button
                onClick={() => {
                  if (formId) navigate(`/form/${formId}?edit=true`);
                }}
                className="btn btn-sm btn-warning"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(formId)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
              <button
                onClick={() => handleSendMail(formId)}
                className="btn btn-sm btn-info"
              >
                Send Mail
              </button>
            </div>
          );
        },
      }),
    ],
    [navigate, columnHelper]
  );

  const table = useReactTable({
    data: forms,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ✅ Dummy components for other tabs (you’ll replace later)
  // inside AdminDashboard.jsx (replace the dummy AssignFormSection)

const AssignFormSection = () => {
  const { token } = useAuth();
  const [forms, setForms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch forms + users
  useEffect(() => {
    const loadData = async () => {
      try {
        const [formsData, usersData] = await Promise.all([
          getFormList(token),
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

  // ✅ Assign form to user
  const handleAssign = async () => {
  if (!selectedForm || !selectedUser) {
    alert("Please select both form and user!");
    return;
  }

  try {
    const data = await assignFormToUser(selectedForm, selectedUser, token);
    alert(data.message || "✅ Form assigned successfully!");
    setSelectedForm("");
    setSelectedUser("");
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Something went wrong";
    alert("Error assigning form: " + msg);
  }
};

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>Assign Form to User</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
        <label>Choose Form</label>
        <select
          className="form-control"
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          <option value="">-- Select Form --</option>
          {forms.map((form) => (
            <option key={form._id} value={form._id}>
              {form.name || "Untitled Form"}
            </option>
          ))}
        </select>

        <label>Choose User</label>
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


  const ViewResponsesSection = () => (
    <div>
      <h3>View All Form Responses</h3>
      <SavedUDFForms onBack={() => setActiveTab("manage")} />
    </div>
  );

  const CreateFormSection = () => (
    <div>
      <h3>Create New Form</h3>
      <UDFBuilder />
    </div>
  );

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* 🔹 Tabs Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "manage" ? "active" : ""}`}
          onClick={() => setActiveTab("manage")}
        >
          Manage Forms
        </button>
        <button
          className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create Form
        </button>
        <button
          className={`tab-btn ${activeTab === "assign" ? "active" : ""}`}
          onClick={() => setActiveTab("assign")}
        >
          Assign Form
        </button>
        <button
          className={`tab-btn ${activeTab === "responses" ? "active" : ""}`}
          onClick={() => setActiveTab("responses")}
        >
          View Responses
        </button>
      </div>

      {/* 🔹 Section Renderer */}
      <div className="tab-content">
        {activeTab === "manage" && (
          <>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-striped">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {viewMode && selectedForm && (
              <ViewFormModal
                form={selectedForm}
                onClose={() => {
                  setViewMode(false);
                  setSelectedForm(null);
                }}
              />
            )}
          </>
        )}

        {activeTab === "create" && <CreateFormSection />}
        {activeTab === "assign" && <AssignFormSection />}
        {activeTab === "responses" && <ViewResponsesSection />}
        
      </div>
    </div>
  );
};

export default AdminDashboard;
