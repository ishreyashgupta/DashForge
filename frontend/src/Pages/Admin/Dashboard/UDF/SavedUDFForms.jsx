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
  Chip
} from "@mui/material";

export default function SavedUDFForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewerForm, setViewerForm] = useState(null);
  const [responses, setResponses] = useState([]);

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
    } catch (err) {
      alert("Error submitting response: " + err.message);
    }
  };

  const handleOpenForm = (form) => {
    setActiveForm(form);
    setIsEditing(false);
  };

  const handleEditForm = (form) => {
    setActiveForm(form);
    setIsEditing(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateUDFForm(activeForm._id, data);
        alert("Form updated successfully!");
      }
      setActiveForm(null);
      setIsEditing(false);
      refresh();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleViewResponses = async (form) => {
    try {
      const data = await getUDFResponses(form._id);
      setResponses(data);
      setViewerForm(form);
    } catch (error) {
      alert("Error fetching responses");
    }
  };

  if (loading) return <CircularProgress />;

  if (activeForm && isEditing) {
    return (
      <UDFBuilder
        existingForm={activeForm}
        onSubmit={handleSubmit}
        onCancel={() => {
          setActiveForm(null);
          setIsEditing(false);
        }}
      />
    );
  }

  if (activeForm && !isEditing) {
    return (
      <UDFFormRenderer
        form={activeForm}
        onSubmit={(data) => handleResponseSubmit(activeForm._id, data)}
        isEditing={false}
      />
    );
  }

  if (viewerForm) {
    return (
      <DynamicResponsesViewer
        form={viewerForm}
        formId={viewerForm._id}
        responses={responses}
        onClose={() => setViewerForm(null)}
      />
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 1000, margin: "0 auto", padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Saved UDF Forms
      </Typography>
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
                  <Button size="small" onClick={() => handleOpenForm(f)}>
                    Open
                  </Button>
                  <Button size="small" onClick={() => handleEditForm(f)}>
                    Edit
                  </Button>
                  <Button size="small" onClick={() => handleViewResponses(f)}>
                    Responses
                  </Button>
                  <Button size="small" color="error" onClick={() => remove(f._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
