import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import ViewFormModal from "./ViewFormModal";

// --- MUI Imports ---
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";

function Dashboard() {
  const { token, name, email } = useAuth();
  const [formFilled, setFormFilled] = useState(false);
  const [formDetails, setFormDetails] = useState(null);
  const navigate = useNavigate();

  // --- All your existing logic remains unchanged ---
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("http://localhost:5000/api/form/check-form", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormFilled(data.formFilled);
      })
      .catch((err) => {
        console.error("Form check error:", err);
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleEditForm = () => {
    navigate("/form?edit=true");
  };

  const handleDeleteForm = () => {
    fetch("http://localhost:5000/api/form/delete-form", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Form deleted successfully");
          setFormFilled(false);
          setFormDetails(null);
        } else {
          toast.error("Failed to delete form");
        }
      })
      .catch(() => {
        console.error("Error deleting form");
        toast.error("Failed to delete form");
      });
  };

  const handleShowDetails = () => {
    fetch("http://localhost:5000/api/form/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormDetails(data);
          toast.success("Form details fetched successfully!");
        } else {
          toast.error("No form data found");
        }
      })
      .catch((err) => {
        console.error("Error fetching form details:", err);
        toast.error("Error fetching form data");
      });
  };

  // --- Refactored JSX using MUI ---
  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 10 }}>
      {name ? (
        <Box>
          {/* Logout Button (Fixed Position) */}
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 999,
            }}
          >
            Logout
          </Button>

          {/* Header */}
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>

          {/* User Info */}
          <Typography variant="h6" component="p">
            Welcome, {name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {email}
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/create-form")}
            >
              Create New Form
            </Button>

            {!formFilled ? (
              <Button variant="contained" onClick={() => navigate("/form")}>
                Fill the Form
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={handleEditForm}>
                  Edit Form
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleShowDetails}
                >
                  Show My Details
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteForm}
                >
                  Delete Form
                </Button>
              </>
            )}
          </Stack>

          {/* Modal for viewing form details */}
          {formDetails && (
            <ViewFormModal
              form={formDetails}
              onClose={() => setFormDetails(null)}
            />
          )}
        </Box>
      ) : (
        // Loading State
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;