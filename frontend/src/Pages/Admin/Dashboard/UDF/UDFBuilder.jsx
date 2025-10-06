import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
} from "@mui/material";
import { ArrowUpward, ArrowDownward, Delete, AddCircleOutline } from "@mui/icons-material";
import { getMeta, createUDFForm, updateUDFForm } from "../../../../services/udfservice";
import UDFFormRenderer from "./UDFFormRenderer";

// Unique ID helper
const genId = () => Math.random().toString(36).slice(2);

// The best-practice field structure
const emptyField = () => ({
  id: genId(),
  fieldName: "",
  label: "",
  inputType: "text", // Only one selector: inputType
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
  const [fields, setFields] = useState([emptyField()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (existingForm) {
      setName(existingForm.name || "");
      setDescription(existingForm.description || "");
      setFields(
        existingForm.fields?.length
          ? existingForm.fields.map(f => ({
              ...emptyField(),
              ...f,
              id: genId(),
              validation: { ...emptyField().validation, ...(f.validation || {}) },
              options: Array.isArray(f.options) ? f.options : [],
            }))
          : [emptyField()]
      );
    }
  }, [existingForm]);

  // Field helpers
  const updateField = (id, patch) =>
    setFields(flds => flds.map(f => {
      // If inputType changes, clear options for non-option types
      if (patch.inputType && !["select", "multiselect", "radio", "checkbox"].includes(patch.inputType)) {
        return { ...f, ...patch, options: [] };
      }
      return f.id === id ? { ...f, ...patch } : f;
    }));

  const addField = () => setFields(flds => [...flds, emptyField()]);
  const addPageBreak = () => setFields(flds => [
    ...flds,
    { ...emptyField(), id: genId(), fieldType: "pageBreak", fieldName: `page_break_${flds.length + 1}`, label: "Page Break" }
  ]);
  const removeField = (id) => setFields(flds => flds.length > 1 ? flds.filter(f => f.id !== id) : flds);

  // Option helpers
  const addOption = (id) =>
    updateField(id, { options: [...fields.find(f => f.id === id).options, { label: "", value: "" }] });
  const updateOption = (fid, oid, patch) => {
    const field = fields.find(f => f.id === fid);
    const options = field.options.map((o, i) => (i === oid ? { ...o, ...patch } : o));
    updateField(fid, { options });
  };
  const removeOption = (fid, oid) => {
    const field = fields.find(f => f.id === fid);
    const options = field.options.filter((_, i) => i !== oid);
    updateField(fid, { options });
  };

  // Move fields
  const moveField = (fromIdx, toIdx) => {
    setFields(flds => {
      const arr = [...flds];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
  };

  // Validation
  const validateForm = () => {
    if (!name.trim()) return "Form name required";
    for (const f of fields)
      if (f.fieldType === "input" && !f.fieldName.trim()) return "Each input needs a name";
    return "";
  };

  // Save
  const onSave = async () => {
    setError(""); setMessage(""); setSaving(true);
    const errMsg = validateForm();
    if (errMsg) { setError(errMsg); setSaving(false); return; }
    try {
      const cleaned = fields.map(f => {
        const v = { ...f };
        delete v.id;
        if (v.fieldType === "pageBreak") v.validation = {};
        if (!["select", "multiselect", "radio", "checkbox"].includes(v.inputType)) v.options = [];
        if (v.validation) ["min", "max", "minLength", "maxLength"].forEach(key => v.validation[key] = v.validation[key] !== "" ? Number(v.validation[key]) : undefined);
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
        setName(""); setDescription(""); setFields([emptyField()]);
      }
      if (onSubmit) onSubmit(res);
    } catch (e) { setError(e.message || "Failed to save form"); }
    finally { setSaving(false); }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {existingForm ? "Edit Form" : "Create New Form"}
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Form Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <TextField
          label="Description"
          multiline
          minRows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </Stack>
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Fields</Typography>
      {fields.map((f, idx) => (
        <Paper key={f.id} sx={{ p: 2, mb: 2, background: f.fieldType === "pageBreak" ? "#f7f7f7" : "white" }}>
          {f.fieldType === "pageBreak" ? (
            <Typography align="center" fontWeight="bold">--- Page Break ---</Typography>
          ) : (
            <>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TextField
                  label="Field Name"
                  value={f.fieldName}
                  onChange={e => updateField(f.id, { fieldName: e.target.value })}
                  required
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Label"
                  value={f.label}
                  onChange={e => updateField(f.id, { label: e.target.value })}
                  sx={{ flex: 1 }}
                />
                {/* Only one selector: Input Type */}
                <Select
                  label="Input Type"
                  value={f.inputType}
                  onChange={e => updateField(f.id, { inputType: e.target.value })}
                  sx={{ flex: 1, minWidth: 120 }}
                >
                  {INPUT_TYPES.map(it => (
                    <MenuItem key={it.value} value={it.value}>{it.label}</MenuItem>
                  ))}
                </Select>
                <FormControlLabel
                  control={<Checkbox checked={f.visible} onChange={e => updateField(f.id, { visible: e.target.checked })} />}
                  label="Visible"
                />
                <FormControlLabel
                  control={<Checkbox checked={f.required} onChange={e => updateField(f.id, { required: e.target.checked })} />}
                  label="Required"
                />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Placeholder"
                  value={f.placeholder}
                  onChange={e => updateField(f.id, { placeholder: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Help Text"
                  value={f.helpText}
                  onChange={e => updateField(f.id, { helpText: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Default Value"
                  value={f.defaultValue}
                  onChange={e => updateField(f.id, { defaultValue: e.target.value })}
                  sx={{ flex: 1 }}
                />
              </Stack>
              {/* Validation: show relevant controls based on inputType */}
              {f.inputType === "number" && (
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    label="Min"
                    type="number"
                    value={f.validation.min ?? ""}
                    onChange={e => updateField(f.id, { validation: { ...f.validation, min: e.target.value } })}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    label="Max"
                    type="number"
                    value={f.validation.max ?? ""}
                    onChange={e => updateField(f.id, { validation: { ...f.validation, max: e.target.value } })}
                    sx={{ width: 100 }}
                  />
                </Stack>
              )}
              {(f.inputType === "text" || f.inputType === "textarea" || f.inputType === "email") && (
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    label="Min Length"
                    type="number"
                    value={f.validation.minLength ?? ""}
                    onChange={e => updateField(f.id, { validation: { ...f.validation, minLength: e.target.value } })}
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Max Length"
                    type="number"
                    value={f.validation.maxLength ?? ""}
                    onChange={e => updateField(f.id, { validation: { ...f.validation, maxLength: e.target.value } })}
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Pattern"
                    value={f.validation.pattern}
                    onChange={e => updateField(f.id, { validation: { ...f.validation, pattern: e.target.value } })}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              )}
              {/* Options for select/radio/checkbox/multiselect */}
              {["select", "multiselect", "radio", "checkbox"].includes(f.inputType) && (
                <Box sx={{ mb: 2 }}>
                  <Typography fontWeight="bold">Options</Typography>
                  {f.options.map((o, oIdx) => (
                    <Stack direction="row" spacing={1} alignItems="center" key={oIdx} sx={{ mt: 1 }}>
                      <TextField
                        label="Label"
                        value={o.label}
                        onChange={e => updateOption(f.id, oIdx, { label: e.target.value })}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Value"
                        value={o.value}
                        onChange={e => updateOption(f.id, oIdx, { value: e.target.value })}
                        sx={{ flex: 1 }}
                      />
                      <IconButton onClick={() => removeOption(f.id, oIdx)} color="error">
                        <Delete />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button
                    startIcon={<AddCircleOutline />}
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() => addOption(f.id)}
                  >
                    Add Option
                  </Button>
                </Box>
              )}
            </>
          )}
          {/* Move and remove */}
          <Stack direction="row" spacing={1}>
            <IconButton disabled={idx === 0} onClick={() => moveField(idx, idx - 1)}>
              <ArrowUpward />
            </IconButton>
            <IconButton disabled={idx === fields.length - 1} onClick={() => moveField(idx, idx + 1)}>
              <ArrowDownward />
            </IconButton>
            <IconButton onClick={() => removeField(f.id)} color="error">
              <Delete />
            </IconButton>
          </Stack>
        </Paper>
      ))}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={addField}>Add Field</Button>
        <Button variant="contained" onClick={addPageBreak}>Add Page Break</Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : existingForm ? "Update Form" : "Save Form"}
        </Button>
        {onCancel && (
          <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
        )}
        <Button variant="outlined" onClick={() => setPreviewOpen(true)}>Preview</Button>
      </Stack>
      {message && <Typography color="success.main">{message}</Typography>}
      {error && <Typography color="error.main">{error}</Typography>}
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Form Preview — {name || "Untitled"}</DialogTitle>
        <DialogContent>
          <UDFFormRenderer
            form={{ name, description, fields }}
            isEditing={false}
            previewMode={true}
            onSubmit={data => {
              console.log("Preview submit", data);
              setPreviewOpen(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}