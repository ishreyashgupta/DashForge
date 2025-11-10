import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, Select, MenuItem, Checkbox,
  FormControlLabel, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper, Stack, Fab, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer
} from "@mui/material";
import { Add, Edit, Delete, DragIndicator } from "@mui/icons-material";
import { createUDFForm, updateUDFForm } from "../../../../services/udfservice";
import UDFFormRenderer from "./UDFFormRenderer";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const genId = () => Math.random().toString(36).slice(2);

const emptyField = () => ({
  id: genId(),
  fieldName: "",
  label: "",
  inputType: "text",
  fieldType: "input",
  placeholder: "",
  helpText: "",
  required: false,
  defaultValue: "",
  options: [],
  validation: {
    min: undefined,
    max: undefined,
    minLength: undefined,
    maxLength: undefined,
    pattern: "",
  },
  visible: true,
});

const INPUT_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "multiselect", label: "Multi Select" },
  { value: "textarea", label: "Textarea" },
  { value: "file", label: "File Upload" },
];

export default function FormBuilderMUI({ existingForm, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState(emptyField());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (existingForm) {
      setName(existingForm.name || "");
      setDescription(existingForm.description || "");
      setFields(
        existingForm.fields?.map(f => ({
          ...emptyField(),
          ...f,
          id: genId(),
          options: Array.isArray(f.options) ? f.options : [],
          validation: { ...emptyField().validation, ...(f.validation || {}) },
        })) || []
      );
    }
  }, [existingForm]);

  // Dialog controls
  const openDialog = (field = null) => {
    setEditingField(field);
    setFormData(field ? { ...field } : emptyField());
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (editingField) {
      setFields(prev => prev.map(f => (f.id === editingField.id ? { ...formData } : f)));
    } else {
      setFields(prev => [...prev, { ...formData, id: genId() }]);
    }
    setDialogOpen(false);
    setEditingField(null);
    setFormData(emptyField());
  };

  const handleDelete = id => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      setFields(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleInlineChange = (id, key, value) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const validateForm = () => {
    if (!name.trim()) return "Form name required";
    if (fields.length === 0) return "At least one field required";
    for (const f of fields)
      if (!f.fieldName.trim()) return "Each field needs a name";
    return "";
  };

  const onSave = async () => {
    setError("");
    setMessage("");
    setSaving(true);
    const err = validateForm();
    if (err) {
      setError(err);
      setSaving(false);
      return;
    }
    try {
      const cleaned = fields.map(f => {
        const v = { ...f };
        delete v.id;
        return v;
      });
      const payload = { name, description, fields: cleaned };
      let res;
      if (existingForm) {
        res = await updateUDFForm(existingForm._id, payload);
        setMessage(`Updated form: ${res.name}`);
      } else {
        res = await createUDFForm(payload);
        setMessage(`Saved form: ${res.name}`);
        setName("");
        setDescription("");
        setFields([]);
      }
      if (onSubmit) onSubmit(res);
    } catch (e) {
      setError(e.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  // === Field Editor (full stack UI inside modal) ===
  const renderFullFieldEditor = () => (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField label="Field Name" value={formData.fieldName} onChange={e => setFormData({ ...formData, fieldName: e.target.value })} required />
      <TextField label="Label" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} />
      <Select value={formData.inputType} onChange={e => setFormData({ ...formData, inputType: e.target.value })}>
        {INPUT_TYPES.map(it => (
          <MenuItem key={it.value} value={it.value}>{it.label}</MenuItem>
        ))}
      </Select>
      <Stack direction="row" spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={formData.required} onChange={e => setFormData({ ...formData, required: e.target.checked })} />}
          label="Required"
        />
        <FormControlLabel
          control={<Checkbox checked={formData.visible} onChange={e => setFormData({ ...formData, visible: e.target.checked })} />}
          label="Visible"
        />
      </Stack>

      <TextField label="Placeholder" value={formData.placeholder} onChange={e => setFormData({ ...formData, placeholder: e.target.value })} />
      <TextField label="Help Text" value={formData.helpText} onChange={e => setFormData({ ...formData, helpText: e.target.value })} />
      <TextField label="Default Value" value={formData.defaultValue} onChange={e => setFormData({ ...formData, defaultValue: e.target.value })} />

      {/* Validation fields */}
      {formData.inputType === "number" && (
        <Stack direction="row" spacing={2}>
          <TextField
            label="Min"
            type="number"
            value={formData.validation.min ?? ""}
            onChange={e => setFormData({
              ...formData,
              validation: { ...formData.validation, min: e.target.value },
            })}
          />
          <TextField
            label="Max"
            type="number"
            value={formData.validation.max ?? ""}
            onChange={e => setFormData({
              ...formData,
              validation: { ...formData.validation, max: e.target.value },
            })}
          />
        </Stack>
      )}

      {(formData.inputType === "text" || formData.inputType === "textarea" || formData.inputType === "email") && (
        <Stack direction="row" spacing={2}>
          <TextField
            label="Min Length"
            type="number"
            value={formData.validation.minLength ?? ""}
            onChange={e => setFormData({
              ...formData,
              validation: { ...formData.validation, minLength: e.target.value },
            })}
          />
          <TextField
            label="Max Length"
            type="number"
            value={formData.validation.maxLength ?? ""}
            onChange={e => setFormData({
              ...formData,
              validation: { ...formData.validation, maxLength: e.target.value },
            })}
          />
          <TextField
            label="Pattern"
            value={formData.validation.pattern}
            onChange={e => setFormData({
              ...formData,
              validation: { ...formData.validation, pattern: e.target.value },
            })}
          />
        </Stack>
      )}

      {["select", "multiselect", "radio", "checkbox"].includes(formData.inputType) && (
        <Box>
          <Typography fontWeight="bold">Options</Typography>
          {formData.options.map((o, idx) => (
            <Stack direction="row" spacing={1} key={idx} alignItems="center">
              <TextField
                label="Label"
                value={o.label}
                onChange={e => {
                  const newOpts = [...formData.options];
                  newOpts[idx].label = e.target.value;
                  setFormData({ ...formData, options: newOpts });
                }}
              />
              <TextField
                label="Value"
                value={o.value}
                onChange={e => {
                  const newOpts = [...formData.options];
                  newOpts[idx].value = e.target.value;
                  setFormData({ ...formData, options: newOpts });
                }}
              />
              <IconButton color="error" onClick={() => {
                const newOpts = formData.options.filter((_, i) => i !== idx);
                setFormData({ ...formData, options: newOpts });
              }}>
                <Delete />
              </IconButton>
            </Stack>
          ))}
          <Button
            sx={{ mt: 1 }}
            variant="outlined"
            onClick={() => setFormData({
              ...formData,
              options: [...formData.options, { label: "", value: "" }],
            })}
          >
            Add Option
          </Button>
        </Box>
      )}
    </Stack>
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {existingForm ? "Edit Form" : "Create New Form"}
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField label="Form Name" value={name} onChange={e => setName(e.target.value)} required />
        <TextField label="Description" multiline minRows={2} value={description} onChange={e => setDescription(e.target.value)} />
      </Stack>

      <Typography variant="h6" gutterBottom>Fields</Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"></TableCell>
              <TableCell>#</TableCell>
              <TableCell>Field Name</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Required</TableCell>
              <TableCell align="center">Visible</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          {/* Drag and Drop TableBody */}
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) return;
              const reordered = Array.from(fields);
              const [moved] = reordered.splice(result.source.index, 1);
              reordered.splice(result.destination.index, 0, moved);
              setFields(reordered);
            }}
          >
            <Droppable droppableId="fields-table">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {fields.map((f, idx) => (
                    <Draggable key={f.id} draggableId={f.id} index={idx}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            backgroundColor: snapshot.isDragging ? "#f7f7f7" : "inherit",
                            cursor: "grab",
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          <TableCell
                            {...provided.dragHandleProps}
                            align="center"
                            sx={{ width: 40, color: "#888" }}
                          >
                            <DragIndicator />
                          </TableCell>

                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{f.fieldName}</TableCell>
                          <TableCell>{f.label}</TableCell>
                          <TableCell>{f.inputType}</TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={f.required}
                              onChange={(e) =>
                                handleInlineChange(f.id, "required", e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={f.visible}
                              onChange={(e) =>
                                handleInlineChange(f.id, "visible", e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" onClick={() => openDialog(f)}>
                              <Edit />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(f.id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {fields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No fields added yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => openDialog()}>Add Field</Button>
        <Button variant="contained" color="primary" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : existingForm ? "Update Form" : "Save Form"}
        </Button>
        {onCancel && <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>}
        <Button variant="outlined" onClick={() => setPreviewOpen(true)}>Preview</Button>
      </Stack>

      {message && <Typography color="success.main">{message}</Typography>}
      {error && <Typography color="error.main">{error}</Typography>}

      {/* Floating Add Button */}
      <Fab color="primary" onClick={() => openDialog()} sx={{ position: "fixed", bottom: 32, right: 32 }}>
        <Add />
      </Fab>

      {/* Full-Feature Modal */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingField ? "Edit Field" : "Add New Field"}</DialogTitle>
        <DialogContent
          dividers
          sx={{
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {renderFullFieldEditor()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDialogSave}>
            {editingField ? "Update Field" : "Add Field"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Form Preview — {name || "Untitled"}</DialogTitle>
        <DialogContent>
          <UDFFormRenderer form={{ name, description, fields }} previewMode />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
