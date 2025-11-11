import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import DynamicResponsesViewer from "./../../Admin/Dashboard/UDF/DynamicReponsesViewer";
import * as userService from "../../../services/userService";
import UDFFormRenderer from "../../Admin/Dashboard/UDF/UDFFormRenderer";

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

function Dashboard() {
  const { token: jwtToken, name, email } = useAuth();
  const [formDetails, setFormDetails] = useState(null);
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
        if (tokenFromLink) {
          const assignmentData = await userService.getAssignmentByToken(tokenFromLink, jwtToken);
          if (assignmentData?.form) {
            setActiveForm({
              ...assignmentData.form,
              assignmentId: assignmentData.assignmentId,
            });
          } else toast.error("Invalid or expired assignment token");
        }

        const response = await userService.getAssignedForms(jwtToken);
        setAssignedForms(response.assignments || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch assignments");
      }
    };
    fetchData();
  }, [jwtToken, navigate, tokenFromLink]);

  const handleShowDetails = async (assignmentId) => {
  try {
    // New unified API call — pulls form + responses
    const data = await userService.getUserAssignmentResponses(jwtToken, assignmentId);

    if (!data?.form) {
      toast.error("No form linked to this assignment");
      return;
    }

    // ✅ Store both form and responses
    setFormDetails({
      ...data.form,
      assignmentId: data.assignment?.id,
      responses: data.responses || [],
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to load responses");
  }
};


  const handleFillForm = async (assignmentId) => {
  try {
    // ✅ Fetch both form and user's previous responses
    const data = await userService.getUserAssignmentResponses(jwtToken, assignmentId);

    if (!data?.form) {
      toast.error("No form found for this assignment");
      return;
    }

    // ✅ Pass form + previous responses
    setActiveForm({
      ...data.form,
      assignmentId,
      prefillData: data.responses?.[0]?.responseData || {}, // assuming your backend returns an array of responses
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch form for editing");
  }
};


  // 🔹 RENDER START
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {!name ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* --- Header Section (User Info) --- */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              p: 2,
              borderRadius: 3,
              backgroundColor: "background.paper",
              boxShadow: 2,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                {name[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {email}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* --- Active Form Renderer --- */}
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
                      jwtToken,
                      activeForm.assignmentId,
                      payload
                    );
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
              {/* --- Assigned Forms Table --- */}
              <TableContainer
                component={Paper}
                sx={{
                  mt: 4,
                  boxShadow: 3,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "primary.main" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>
                        Form Name
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ color: "white", fontWeight: 600 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {assignedForms.length > 0 ? (
                      assignedForms.map((form) => (
                        <TableRow
                          key={form.assignmentId}
                          hover
                          sx={{
                            "&:hover": { backgroundColor: "rgba(0,0,0,0.03)" },
                          }}
                        >
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {form.formName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {form.formDescription || "No description"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                form.status.charAt(0).toUpperCase() + form.status.slice(1)
                              }
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
                          <TableCell align="center">
                            {/* --- Button Logic Simplified --- */}
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
                                  color="primary"
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
                              </Stack>
                            )}

                            {form.status !== "sent" &&
                              form.status !== "completed" && <CircularProgress size={24} />}
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

          {/* --- Form Details Modal --- */}
          {formDetails && (
            <DynamicResponsesViewer
              form={formDetails}
              responses={formDetails.responses}
              onClose={() => setFormDetails(null)}
            />
          )}
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;
