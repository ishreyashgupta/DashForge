import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Delete, Visibility, Edit, Mail } from "@mui/icons-material";

import useAuth from "../../../hooks/useAuth";
import { 
  getAllForms, 
  deleteFormByFormId, 
} from "../../../services/adminService";

import UDFBuilder from "./UDF/UDFBuilder";
import SavedUDFForms from "./UDF/SavedUDFForms";
import ViewFormModal from "./../../User/Dashboard/ViewFormModal";
import AssignFormSection from "./AssignFormSection";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Manage, 1: Create, 2: Assign, 3: Responses
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  const { token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    } else if (token) {
      fetchForms();
    }
  }, [role, token, navigate]);

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

  const handleSendMail = async (formId) => {
    try {
      const response = await fetch("http://localhost:5000/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: formId }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`📧 Mail sent successfully for form ID: ${formId}`);
      } else {
        alert(`❌ Mail failed for form ID: ${formId}\nReason: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert(`❌ Unexpected error: ${error.message}`);
    }
  };

  // ✅ Manage Forms Table
  const columns = [
    { field: "_id", headerName: "Form ID", flex: 1 },
    { field: "name", headerName: "Form Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View"
          onClick={() => {
            setSelectedForm(params.row);
            setViewMode(true);
          }}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => navigate(`/form/${params.row._id}?edit=true`)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row._id)}
        />,
        <GridActionsCellItem
          icon={<Mail />}
          label="Send Mail"
          onClick={() => handleSendMail(params.row._id)}
        />,
      ],
    },
  ];

  // ✅ Assign Form Tab
  {activeTab === 2 && (
  <Box>
    <Typography variant="h5" mb={2}>
      Assign Form to User
    </Typography>
    <AssignFormSection token={token} />
  </Box>
)}
  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Admin Dashboard
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Manage Forms" />
        <Tab label="Create Form" />
        <Tab label="Assign Form" />
        <Tab label="View Responses" />
      </Tabs>

      <Box>
        {/* Manage Forms */}
        {activeTab === 0 && (
          <Box height={500} width="100%">
            {loading ? (
              <CircularProgress />
            ) : (
              <DataGrid
                rows={forms}
                columns={columns}
                getRowId={(row) => row._id}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
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
          </Box>
        )}

        {/* Create Form */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" mb={2}>
              Create New Form
            </Typography>
            <UDFBuilder />
          </Box>
        )}

        {/* Assign Form */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" mb={2}>
              Assign Form to User
            </Typography>
            <AssignFormSection />
          </Box>
        )}

        {/* View Responses */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" mb={2}>
              View Responses
            </Typography>
            <SavedUDFForms onBack={() => setActiveTab(0)} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
