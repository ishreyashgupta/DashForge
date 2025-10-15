import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import DynamicResponsesViewer from "./../../Admin/Dashboard/UDF/DynamicReponsesViewer";
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
  Chip,
} from "@mui/material";

// --- Import UDFFormRenderer ---
import UDFFormRenderer from "../../Admin/Dashboard/UDF/UDFFormRenderer";

function Dashboard() {
  const { token: jwtToken, name, email } = useAuth();
  const [formDetails, setFormDetails] = useState(null); // will store full form
  const [assignedForms, setAssignedForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const tokenFromLink = params.get("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!jwtToken) {
        navigate(
          `/login?redirect=/dashboard${tokenFromLink ? `?token=${tokenFromLink}` : ""}`
        );
        return;
      }

      try {
        // If tokenFromLink exists → fetch assignment by token
        if (tokenFromLink) {
          try {
            const assignmentData = await userService.getAssignmentByToken(tokenFromLink, jwtToken);

            if (assignmentData?.form) {
              setActiveForm({
                ...assignmentData.form,
                assignmentId: assignmentData.assignmentId,
              });
            } else {
              toast.error("Invalid or expired assignment token");
            }
          } catch (err) {
            if (err.response?.status === 403) {
              toast.error("You are not authorized to access this form");
              navigate("/dashboard");
            } else if (err.response?.status === 404) {
              toast.error("Invalid or expired assignment token");
              navigate("/dashboard");
            } else {
              toast.error("Failed to fetch assignment");
              console.error(err);
            }
          }
        }

        // Fetch all normal assigned forms
        const response = await userService.getAssignedForms(jwtToken);
        setAssignedForms(response.assignments || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch assignments");
      }
    };

    fetchData();
  }, [jwtToken, navigate, tokenFromLink]);

  // Updated handleShowDetails → fetch the full form using formId
  const handleShowDetails = async (assignmentId) => {
  try {
    // Fetch assignment
    const assignmentData = await userService.getSingleAssignment(jwtToken, assignmentId);

    if (!assignmentData?.form) {
      toast.error("No form associated with this assignment");
      return;
    }

    // Pass full form along with assignmentId
    setFormDetails({
      ...assignmentData.form,
      assignmentId: assignmentData.assignmentId,
    });

  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch form details");
  }
};


  // Update assignment status
  const handleUpdateStatus = async (assignmentId, status) => {
    try {
      const result = await userService.updateAssignmentStatus(jwtToken, assignmentId, status);
      if (result?.success) {
        toast.success("Status updated successfully!");
        const response = await userService.getAssignedForms(jwtToken);
        setAssignedForms(response.assignments || []);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  // Open a form by assignmentId
  const handleFillForm = async (assignmentId) => {
    try {
      const data = await userService.getSingleAssignment(jwtToken, assignmentId);
      if (data && data.form) setActiveForm({ ...data.form, assignmentId });
      else toast.error("No form found for this assignment");
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
              <Typography variant="body2" color="text.secondary">{email}</Typography>
            </Box>
          </Stack>

          {/* Render UDF Form if activeForm is set */}
          {activeForm ? (
            <Box sx={{ mt: 4 }}>
              <Button variant="outlined" onClick={() => setActiveForm(null)} sx={{ mb: 2 }}>
                Back to Dashboard
              </Button>

              <UDFFormRenderer
                form={activeForm}
                onSubmit={async (payload) => {
                  try {
                    const res = await userService.submitAssignment(jwtToken, activeForm.assignmentId, payload);
                    if (res.success) {
                      toast.success("Form submitted successfully!");
                      setActiveForm(null);
                      const response = await userService.getAssignedForms(jwtToken);
                      setAssignedForms(response.assignments || []);
                    } else toast.error("Failed to submit form");
                  } catch (error) {
                    console.error(error);
                    toast.error("Error submitting form");
                  }
                }}
              />
            </Box>
          ) : (
            <>
              {/* Assigned Forms Table */}
              <TableContainer component={Paper} sx={{ mt: 4, boxShadow: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Form Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedForms.length > 0 ? (
                      assignedForms.map((form) => (
                        <TableRow key={form.assignmentId} hover>
                          <TableCell>{form.formName}</TableCell>
                          <TableCell>{form.formDescription || "No description"}</TableCell>

                          {/* Status with Chip */}
                          <TableCell>
                            <Chip
                              label={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                              color={
                                form.status === "sent"
                                  ? "primary"
                                  : form.status === "completed"
                                  ? "success"
                                  : "warning"
                              }
                              variant="outlined"
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            {form.status === "sent" && (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleFillForm(form.assignmentId)}
                              >
                                Fill Form
                              </Button>
                            )}

                            {form.status === "completed" && (
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant="outlined"
                                  onClick={() => handleFillForm(form.assignmentId)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="contained"
                                  color="info"
                                  onClick={() => handleShowDetails(form.assignmentId)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => handleUpdateStatus(form.assignmentId, "sent")}
                                >
                                  Reopen
                                </Button>
                              </Stack>
                            )}

                            {form.status !== "sent" && form.status !== "completed" && (
                              <CircularProgress size={24} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
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
            <DynamicResponsesViewer
              form={formDetails} // ✅ now contains full form with formId
              onClose={() => setFormDetails(null)}
            />
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;
