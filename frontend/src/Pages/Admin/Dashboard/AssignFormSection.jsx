// src/components/AdminDashboard/AssignFormSection.jsx
import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress, MenuItem, Select, FormControl, InputLabel, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { getAllUsers, assignFormToUser, getFormList, getAllAssignments, deleteAssignment } from "../../../services/adminService";
import useAuth from "../../../hooks/useAuth";
import { Delete } from "@mui/icons-material";

const AssignFormSection = () => {
  const { token } = useAuth();
  const [allForms, setAllForms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loadingAssign, setLoadingAssign] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Load forms and users
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [formsData, usersData] = await Promise.all([
          getFormList(token),
          getAllUsers(token),
        ]);
        setAllForms(formsData);
        setUsers(usersData);
      } catch (err) {
        alert("Error loading data: " + err.message);
      } finally {
        setLoadingAssign(false);
      }
    };

    loadData();
  }, [token]);

  // Load assignments
  useEffect(() => {
    if (!token) return;

    const loadAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const data = await getAllAssignments(token); // fetch assigned forms
        setAssignments(data);
      } catch (err) {
        alert("Error loading assignments: " + err.message);
      } finally {
        setLoadingAssignments(false);
      }
    };

    loadAssignments();
  }, [token]);

  const handleAssign = async () => {
    if (!selectedFormId || !selectedUserId) {
      alert("Please select both form and user!");
      return;
    }
    try {
      const data = await assignFormToUser(selectedFormId, selectedUserId, token);
      alert(data.message || "✅ Form assigned successfully!");
      setSelectedFormId("");
      setSelectedUserId("");
      // Refresh assignment table
      const updated = await getAllAssignments(token);
      setAssignments(updated);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      alert("Error assigning form: " + msg);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;
    try {
      await deleteAssignment(id, token);
      const updated = assignments.filter((a) => a._id !== id);
      setAssignments(updated);
      alert("Assignment deleted ✅");
    } catch (err) {
      alert("Failed to delete assignment: " + err.message);
    }
  };

  if (loadingAssign) return <CircularProgress />;

  // Columns for DataGrid
  const columns = [
    { field: "_id", headerName: "Assignment ID", flex: 1 },
    { field: "formName", headerName: "Form", flex: 1 },
    { field: "userName", headerName: "User", flex: 1 },
    { field: "assignedAt", headerName: "Assigned At", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDeleteAssignment(params.row._id)}
        />,
      ],
    },
  ];

  // Map assignments to rows
  const rows = assignments.map((a) => ({
    _id: a._id,
    formName: a.form?.name || "Untitled Form",
    userName: a.user?.name || "Unknown",
    assignedAt: new Date(a.assignedAt).toLocaleString(),
  }));

  return (
    <Box display="flex" flexDirection="column" gap={4} maxWidth={800}>
      {/* Assign Form Controls */}
      <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
        <FormControl fullWidth>
          <InputLabel>Choose Form</InputLabel>
          <Select
            value={selectedFormId}
            label="Choose Form"
            onChange={(e) => setSelectedFormId(e.target.value)}
          >
            {allForms.map((form) => (
              <MenuItem key={form._id} value={form._id}>
                {form.name || "Untitled Form"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Choose User</InputLabel>
          <Select
            value={selectedUserId}
            label="Choose User"
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleAssign}>
          Assign Form
        </Button>
      </Box>

      {/* Assignments Table */}
      <Box>
        <Typography variant="h6" mb={2}>
          Assigned Forms
        </Typography>
        {loadingAssignments ? (
          <CircularProgress />
        ) : (
          <Box height={400} width="100%">
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AssignFormSection;
