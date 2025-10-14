import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import ViewFormModal from "./ViewFormModal";
import DynamicResponsesViewer from "../../Admin/Dashboard/UDF/DynamicReponsesViewer";
import * as userService from "../../../services/userService";
// --- MUI Imports ---
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@mui/material";

// --- Import your UDFFormRenderer ---
import UDFFormRenderer from "../../Admin/Dashboard/UDF/UDFFormRenderer";

function Dashboard() {
  const { token, name, email } = useAuth();
  const [formDetails, setFormDetails] = useState(null); // For modal view
  const [assignedForms, setAssignedForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null); // For dynamic UDF form rendering
  const navigate = useNavigate();

  // Fetch assigned forms on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAssignedForms = async () => {
      try {
        const response = await userService.getAssignedForms(token);
        setAssignedForms(response.assignments || []);
      } catch (error) {
        console.error("Error fetching assigned forms:", error);
        toast.error("Failed to fetch assigned forms");
      }
    };

    fetchAssignedForms();
  }, [token, navigate]);

  // Show form details in modal (read-only)
  const handleShowDetails = async (assignmentId) => {
    try {
      const data = await userService.getSingleAssignment(token, assignmentId);
      if (data) {
        setFormDetails(data);
        toast.success("Form details fetched successfully!");
      } else {
        toast.error("No form data found");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch form details");
    }
  };

  // Update assignment status
  const handleUpdateStatus = async (assignmentId, status) => {
    try {
      const result = await userService.updateAssignmentStatus(
        token,
        assignmentId,
        status
      );
      if (result?.success) {
        toast.success("Status updated successfully!");
        // Refresh assigned forms
        const response = await userService.getAssignedForms(token);
        setAssignedForms(response.assignments || []);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  // Render the dynamic UDF form
  const handleFillForm = async (assignmentId) => {
    try {
      const data = await userService.getSingleAssignment(token, assignmentId);
      if (data && data.form) {
        setActiveForm({ ...data.form, assignmentId }); // Include assignmentId for submission
      } else {
        toast.error("No form found for this assignment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch form");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {name ? (
        <Box>
          {/* User Info */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>{name[0].toUpperCase()}</Avatar>
            <Box>
              <Typography variant="h6">{name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>
            </Box>
          </Stack>

          {/* Render UDF Form if activeForm is set */}
          {activeForm ? (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveForm(null)}
                sx={{ mb: 2 }}
              >
                Back to Dashboard
              </Button>

              <UDFFormRenderer
                form={activeForm}
                onSubmit={async (payload) => {
                  try {
                    const res = await userService.submitAssignment(
                      token,
                      activeForm.assignmentId,
                      payload
                    );

                    if (res.success) {
                      toast.success("Form submitted successfully!");
                      setActiveForm(null);

                      // Refresh assigned forms
                      const response = await userService.getAssignedForms(token);
                      setAssignedForms(response.assignments || []);
                    } else {
                      toast.error("Failed to submit form");
                    }
                  } catch (error) {
                    console.error(error);
                    toast.error("Error submitting form");
                  }
                }}
              />
            </Box>
          ) : (
            <>
              {/* Table for Assigned Forms */}
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Form Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedForms.length > 0 ? (
                      assignedForms.map((form) => (
                        <TableRow key={form.assignmentId}>
                          <TableCell>{form.formName}</TableCell>
                          <TableCell>{form.formDescription || "No description"}</TableCell>
                          <TableCell align="center">
                            {form.status === "sent" ? (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleFillForm(form.assignmentId)}
                              >
                                Fill Form
                              </Button>
                            ) : form.status === "completed" ? (
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant="outlined"
                                  onClick={() => handleFillForm(form.assignmentId)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleShowDetails(form.assignmentId)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() =>
                                    handleUpdateStatus(form.assignmentId, "sent")
                                  }
                                >
                                  Reopen
                                </Button>
                              </Stack>
                            ) : (
                              <CircularProgress size={24} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No assigned forms.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Form Details Modal */}
          {formDetails && (
            <DynamicResponsesViewer form={formDetails} onClose={() => setFormDetails(null)} />
          )}
        </Box>
      ) : (
        <Box
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;
