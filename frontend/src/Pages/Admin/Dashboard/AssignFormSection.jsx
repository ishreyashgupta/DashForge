// src/components/AdminDashboard/AssignFormSection.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getAllUsers,
  assignFormToUser,
  getFormList,
  getAllAssignments,
} from "../../../services/adminService";
import useAuth from "../../../hooks/useAuth";

const AssignFormSection = () => {
  const { token } = useAuth();
  const [allForms, setAllForms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]); // for bulk
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
  const loadAssignments = async () => {
    if (!token) return;
    setLoadingAssignments(true);
    try {
      const data = await getAllAssignments(token);
      setAssignments(data.assignments || []);
    } catch (err) {
      alert("Error loading assignments: " + err.message);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [token]);

  // Single assignment
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
      await loadAssignments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      alert("Error assigning form: " + msg);
    }
  };

  // Bulk assignment
  const handleBulkAssign = async () => {
    if (!selectedFormId || selectedUserIds.length === 0) {
      alert("Please select a form and at least one user!");
      return;
    }

    try {
      const data = await assignFormToUser(selectedFormId, selectedUserIds, token, true);
      alert("Bulk assignment completed! Check console for details.");
      console.log("Bulk Assign Results:", data.results);

      setSelectedFormId("");
      setSelectedUserIds([]);
      await loadAssignments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      alert("Error in bulk assignment: " + msg);
    }
  };

  // Map assignments grouped by form
  const groupedRows = Object.values(
    assignments.reduce((acc, a) => {
      if (!acc[a.formName]) {
        acc[a.formName] = {
          _id: a._id,
          formName: a.formName,
          assignedUsers: [a.userName || a.userEmail || "Unknown"],
        };
      } else {
        acc[a.formName].assignedUsers.push(a.userName || a.userEmail || "Unknown");
      }
      return acc;
    }, {})
  );

  const rows = groupedRows.map((g, idx) => ({
    _id: g._id + "-" + idx,
    formName: g.formName,
    assignedUsers: g.assignedUsers.join(", "),
  }));

  const columns = [
    { field: "formName", headerName: "Form", flex: 1 },
    { field: "assignedUsers", headerName: "Assigned Users", flex: 2 },
  ];

  if (loadingAssign) return <CircularProgress />;

  return (
    <Box display="flex" gap={4} alignItems="flex-start">
      {/* Left Column: Assign Form */}
      <Box flex="1" maxWidth={400} display="flex" flexDirection="column" gap={2}>
        {/* Single/Bulk form select */}
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

        {/* Single assign */}
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

        {/* Bulk assign */}
        <FormControl fullWidth>
          <InputLabel>Choose Users (Bulk)</InputLabel>
          <Select
            multiple
            value={selectedUserIds}
            label="Choose Users (Bulk)"
            onChange={(e) => setSelectedUserIds(e.target.value)}
            renderValue={(selected) =>
              users
                .filter((u) => selected.includes(u._id))
                .map((u) => u.name)
                .join(", ")
            }
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="secondary" onClick={handleBulkAssign}>
          Bulk Assign Form
        </Button>
      </Box>

      {/* Right Column: Assignments Table */}
      <Box flex="2">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Assigned Forms</Typography>
          <Button variant="outlined" onClick={loadAssignments}>
            Refresh
          </Button>
        </Box>

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
