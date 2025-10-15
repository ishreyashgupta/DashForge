import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import * as userService from "../../../services/userService";

// --- MUI Imports ---
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

function Profile() {
  const { token: jwtToken, name: currentName, email: currentEmail, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!jwtToken) {
      navigate("/login?redirect=/profile");
      return;
    }
    // Load user info from auth
    setName(currentName);
    setEmail(currentEmail);
    setLoading(false);
  }, [jwtToken, currentName, currentEmail, navigate]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await userService.updateUserProfile(jwtToken, { name, email });
      if (res.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await userService.deleteUserAccount(jwtToken);
      if (res.success) {
        toast.success("Account deleted successfully!");
        logout(); // Clear auth
        navigate("/"); // Redirect to homepage
      } else {
        toast.error("Failed to delete account");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting account");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h5" sx={{ mb: 4 }}>
        My Profile
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Account
        </Button>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAccount}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;
