import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { getAllForms, deleteFormByFormId } from "../services/adminService";
import "../styles/AdminDashboard.css";
import useAuth from "../hooks/useAuth"; // ✅ custom hook for auth
import ViewFormModal from "../components/ViewFormModal";

const AdminDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  const navigate = useNavigate();
  const { token, role } = useAuth(); // ✅ get token and role
  const columnHelper = createColumnHelper();

  // ✅ Protect route - only allow admins
  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    } else if (token) {
      fetchForms();
    }
  }, [role, token, navigate]);

  // ✅ Fetch all user forms
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

  // ✅ Delete form by ID
  const handleDelete = async (formId) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteFormByFormId(formId, token);
        fetchForms(); // Refresh list after delete
      } catch (err) {
        alert(err.message);
      }
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
                  if (formId) {
                    navigate(`/personal-form/${formId}?edit=true`); // ✅ FIXED
                  } else {
                    console.error("❌ Missing form ID");
                  }
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
            </div>
          );
        },
      }),
    ],
    [navigate]
  );

  const table = useReactTable({
    data: forms,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard - User Form Submissions</h2>

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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* View Modal */}
      {viewMode && selectedForm && (
        <ViewFormModal
          form={selectedForm}
          onClose={() => {
            setViewMode(false);
            setSelectedForm(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
