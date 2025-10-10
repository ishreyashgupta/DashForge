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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Chip,
  Tabs,
  Tab,
  Box
} from "@mui/material";

export default function UDFDashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewerForm, setViewerForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  const refresh = () => {
    setLoading(true);
    getAllUDFForms()
      .then(setForms)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this form?")) return;
    await deleteUDFForm(id);
    refresh();
  };

  const handleResponseSubmit = async (formId, responseData) => {
    try {
      await submitUDFResponse(formId, responseData);
      alert("Response submitted successfully!");
      setActiveForm(null);
      setTabIndex(0);
    } catch (err) {
      alert("Error submitting response: " + err.message);
    }
  };

  const handleOpenForm = (form) => {
    setActiveForm(form);
    setIsEditing(false);
    setTabIndex(1); // switch to View tab
  };

  const handleEditForm = (form) => {
    setActiveForm(form);
    setIsEditing(true);
    setTabIndex(1); // switch to Edit tab
  };

  const handleViewResponses = async (form) => {
    try {
      const data = await getUDFResponses(form._id);
      setResponses(data);
      setViewerForm(form);
      setTabIndex(2); // switch to Responses tab
    } catch (error) {
      alert("Error fetching responses");
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateUDFForm(activeForm._id, data);
        alert("Form updated successfully!");
      }
      setActiveForm(null);
      setIsEditing(false);
      setTabIndex(0); // back to main tab
      refresh();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ maxWidth: 1200, margin: "0 auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        UDF Forms Dashboard
      </Typography>

      <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)}>
        <Tab label="Forms" />
        <Tab label={isEditing ? "Edit Form" : "View Form"} disabled={!activeForm} />
        <Tab label="Responses" disabled={!viewerForm} />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 && (
          <TableContainer>
            {forms.length === 0 ? (
              <Typography>No forms yet.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Form Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Fields</TableCell>
                    <TableCell>Responses</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forms.map((f) => (
                    <TableRow key={f._id} hover>
                      <TableCell>{f.name || "Untitled Form"}</TableCell>
                      <TableCell>
                        <Chip
                          label={f.isActive ? "Online" : "Offline"}
                          color={f.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{(f.fields || []).length}</TableCell>
                      <TableCell>{f.responsesCount || 0}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleOpenForm(f)}>Open</Button>
                        <Button size="small" onClick={() => handleEditForm(f)}>Edit</Button>
                        <Button size="small" onClick={() => handleViewResponses(f)}>Responses</Button>
                        <Button size="small" color="error" onClick={() => remove(f._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        )}

        {tabIndex === 1 && activeForm && (
          isEditing ? (
            <UDFBuilder
              existingForm={activeForm}
              onSubmit={handleSubmit}
              onCancel={() => { setActiveForm(null); setIsEditing(false); setTabIndex(0); }}
            />
          ) : (
            <UDFFormRenderer
              form={activeForm}
              onSubmit={(data) => handleResponseSubmit(activeForm._id, data)}
              isEditing={false}
            />
          )
        )}

        {tabIndex === 2 && viewerForm && (
          <DynamicResponsesViewer
            form={viewerForm}
            formId={viewerForm._id}
            responses={responses}
            onClose={() => { setViewerForm(null); setTabIndex(0); }}
          />
        )}
      </Box>
    </Paper>
  );
}
