// src/components/AdminDashboard/SendMailSection.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { getAllUsers, getFormList, sendAssignmentMail } from "../../../services/adminService";
import useAuth from "../../../hooks/useAuth";

const SendMailSection = () => {
  const { token } = useAuth(); // ✅ get token like in AssignFormSection
  const [users, setUsers] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentAssignments, setSentAssignments] = useState([]);

  // Fetch users and forms using token
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [usersData, formsData] = await Promise.all([
          getAllUsers(token),
          getFormList(token),
        ]);
        setUsers(usersData);
        setForms(formsData);
      } catch (err) {
        alert("Error fetching data: " + err.message);
      }
    };

    fetchData();
  }, [token]);

  const handleUserChange = (e) => setSelectedUser(e.target.value);

  const handleFormChange = (e) => {
    setSelectedForm(e.target.value);
    const form = forms.find((f) => f._id === e.target.value);
    setSubject(form ? `Please Fill Out: ${form.name}` : "");
    setMessage(
      form
        ? `Hi [User],\n\nYou've been invited to fill out the form: ${form.name}.\n\nClick below to open the form:\n[FORM_LINK]\n\nBest regards,\nUDF Forms Team`
        : ""
    );
  };

  const handleSendMail = async () => {
    if (!selectedUser || !selectedForm) return alert("Select user and form");
    setLoading(true);
    try {
      const response = await sendAssignmentMail({ userId: selectedUser, formId: selectedForm }, token);
      if (response.success) {
        alert("Mail sent successfully!");
        setSentAssignments((prev) => [...prev, response.assignment]);
      } else {
        alert("Failed to send mail: " + response.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Send Mail to Users</Typography>
      
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>User</InputLabel>
          <Select value={selectedUser} onChange={handleUserChange} label="User">
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Form</InputLabel>
          <Select value={selectedForm} onChange={handleFormChange} label="Form">
            {forms.map((form) => (
              <MenuItem key={form._id} value={form._id}>
                {form.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        label="Email Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Email Message"
        multiline
        minRows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={handleSendMail} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Send Mail"}
      </Button>

      {/* Sent Emails Table */}
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" mb={2}>Sent Emails</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Form</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sentAssignments.map((a) => (
              <TableRow key={a.assignmentId}>
                <TableCell>{a.userName}</TableCell>
                <TableCell>{a.userEmail}</TableCell>
                <TableCell>{a.formName}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>{new Date(a.assignedAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default SendMailSection;
