import React, { useEffect, useState } from "react";
import {
  getAllUDFForms,
  deleteUDFForm,
  updateUDFForm,
  getUDFResponses,
  submitUDFResponse
} from "../../../../services/udfservice";

import UDFBuilder from "./UDFBuilder";
import UDFFormRenderer from "./UDFFormRenderer";
import DynamicResponsesViewer from "./DynamicReponsesViewer";

import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Stack,
  TextField,
  TablePagination,
} from "@mui/material";

export default function UDFDashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // list | builder | preview | responses
  const [activeForm, setActiveForm] = useState(null);
  const [responses, setResponses] = useState([]);

  // NEW STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch all forms
  const fetchForms = async () => {
    setLoading(true);
    try {
      const data = await getAllUDFForms();
      setForms(data);
    } catch (err) {
      console.error("Failed to load forms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Handlers
  const handleNewForm = () => {
    setActiveForm(null);
    setMode("builder");
  };

  const handleEdit = (form) => {
    setActiveForm(form);
    setMode("builder");
  };

  const handlePreview = (form) => {
    setActiveForm(form);
    setMode("preview");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      await deleteUDFForm(id);
      await fetchForms();
    } catch (err) {
      alert("Error deleting form: " + err.message);
    }
  };

  const handleResponses = async (form) => {
    setLoading(true);
    try {
      const data = await getUDFResponses(form._id);
      setResponses(data);
      setActiveForm(form);
      setMode("responses");
    } catch (err) {
      alert("Error fetching responses");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (activeForm?._id) {
        await updateUDFForm(activeForm._id, data);
        alert("Form updated successfully!");
      } else {
        alert("Form created successfully!");
      }
      setMode("list");
      fetchForms();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleResponseSubmit = async (formId, data) => {
    try {
      await submitUDFResponse(formId, data);
      alert("Response submitted successfully!");
      setMode("list");
    } catch (err) {
      alert("Error submitting response: " + err.message);
    }
  };

  // Filter + Paginate
  const filteredForms = forms.filter((f) =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedForms = filteredForms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Conditional Views
  if (mode === "builder") {
    return (
      <UDFBuilder
        existingForm={activeForm}
        onSubmit={handleFormSubmit}
        onCancel={() => setMode("list")}
      />
    );
  }

  if (mode === "preview") {
    return (
      <UDFFormRenderer
        form={activeForm}
        onSubmit={(data) => handleResponseSubmit(activeForm._id, data)}
        isEditing={false}
      />
    );
  }

  if (mode === "responses") {
    return (
      <DynamicResponsesViewer
        form={activeForm}
        formId={activeForm._id}
        responses={responses}
        onClose={() => setMode("list")}
      />
    );
  }

  // Default: List View
  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={600}>
          Manage UDF Forms
        </Typography>
        <Button variant="contained" onClick={handleNewForm}>
          + New Form
        </Button>
      </Stack>

      {/* Search Bar */}
      <Box mb={2}>
        <TextField
          label="Search by Form Name"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Table */}
      {filteredForms.length === 0 ? (
        <Typography>No matching forms found.</Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Form Name</TableCell>
                  <TableCell>Fields</TableCell>
                  <TableCell>Responses</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedForms.map((form) => (
                  <TableRow key={form._id} hover>
                    <TableCell>{form.name || "Untitled Form"}</TableCell>
                    <TableCell>{(form.fields || []).length}</TableCell>
                    <TableCell>{form.responsesCount || 0}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleEdit(form)}>
                          Edit
                        </Button>
                        <Button size="small" onClick={() => handlePreview(form)}>
                          Preview
                        </Button>
                        <Button size="small" onClick={() => handleResponses(form)}>
                          Responses
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(form._id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredForms.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </Paper>
  );
}
