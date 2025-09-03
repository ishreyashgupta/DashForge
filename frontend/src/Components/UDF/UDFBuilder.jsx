import React, { useEffect, useState } from "react";
import { createUDFForm, updateUDFForm, getMeta } from "../../services/udfservice";
import UDFFormRenderer from "./UDFFormRenderer";

const emptyField = {
  fieldName: "",
  label: "",
  dataType: "string",
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
};

export default function UDFBuilder({ existingForm, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([{ ...emptyField }]);
  const [meta, setMeta] = useState({ dataTypes: [], inputTypes: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (existingForm) {
      setName(existingForm.name || "");
      setDescription(existingForm.description || "");
      setFields(
        existingForm.fields?.length > 0
          ? existingForm.fields.map((f) => ({
              ...emptyField,
              ...f,
              options: Array.isArray(f.options) ? f.options : [],
              validation: { ...emptyField.validation, ...(f.validation || {}) },
            }))
          : [{ ...emptyField }]
      );
    }
  }, [existingForm]);

  useEffect(() => {
    getMeta()
      .then(setMeta)
      .catch(console.error);
  }, []);

  const updateField = (idx, patch) => {
    setFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...patch } : f))
    );
  };

  const addField = () => setFields((prev) => [...prev, { ...emptyField }]);

  const addPageBreak = () => {
    setFields((prev) => [
      ...prev,
      {
        ...emptyField,
        fieldName: `page_break_${prev.length + 1}`,
        label: "Page Break",
        fieldType: "pageBreak",
        inputType: "pageBreak",
        dataType: "none",
        options: [],
        required: false,
        defaultValue: "",
      },
    ]);
  };

  const removeField = (idx) => setFields((prev) => prev.filter((_, i) => i !== idx));

  const addOption = (idx) => {
    const f = fields[idx];
    updateField(idx, {
      options: [...(f.options || []), { label: "", value: "" }],
    });
  };

  const updateOption = (fIdx, oIdx, patch) => {
    const f = fields[fIdx];
    const opts = (f.options || []).map((o, i) =>
      i === oIdx ? { ...o, ...patch } : o
    );
    updateField(fIdx, { options: opts });
  };

  const removeOption = (fIdx, oIdx) => {
    const f = fields[fIdx];
    const opts = (f.options || []).filter((_, i) => i !== oIdx);
    updateField(fIdx, { options: opts });
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const cleaned = fields.map((f) => {
        const v = { ...f };
        if (v.validation) {
          if (v.validation.min !== "") v.validation.min = Number(v.validation.min);
          if (v.validation.max !== "") v.validation.max = Number(v.validation.max);
          if (v.validation.minLength !== "") v.validation.minLength = Number(v.validation.minLength);
          if (v.validation.maxLength !== "") v.validation.maxLength = Number(v.validation.maxLength);
        }
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
        setFields([{ ...emptyField }]);
      }

      if (onSubmit) onSubmit(res);
    } catch (e) {
      setMessage(e.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>{existingForm ? "Edit UDF Form" : "Create UDF Form"}</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Form name"
          value={name || ""}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <h3 style={{ marginTop: 24 }}>Fields</h3>
      {fields.map((f, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            background: f.fieldType === "pageBreak" ? "#f8f9fa" : "transparent",
          }}
        >
          {f.fieldType === "pageBreak" ? (
            <div style={{ textAlign: "center", fontWeight: "bold" }}>
              --- Page Break ---
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <input
                placeholder="Field name"
                value={f.fieldName || ""}
                onChange={(e) => updateField(idx, { fieldName: e.target.value })}
              />
              <input
                placeholder="Label"
                value={f.label || ""}
                onChange={(e) => updateField(idx, { label: e.target.value })}
              />
              <select
                value={f.dataType || "string"}
                onChange={(e) => updateField(idx, { dataType: e.target.value })}
              >
                {meta.dataTypes.length > 0 ? (
                  meta.dataTypes.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))
                ) : (
                  <option value="string">string</option>
                )}
              </select>
              <select
                value={f.inputType || "text"}
                onChange={(e) => updateField(idx, { inputType: e.target.value })}
              >
                {meta.inputTypes.length > 0 ? (
                  meta.inputTypes.map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))
                ) : (
                  <option value="text">text</option>
                )}
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={!!f.visible}
                  onChange={(e) =>
                    updateField(idx, { visible: e.target.checked })
                  }
                />{" "}
                Visible
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!!f.required}
                  onChange={(e) =>
                    updateField(idx, { required: e.target.checked })
                  }
                />{" "}
                Required
              </label>
            </div>
          )}

          {["select", "multiselect", "radio", "checkbox"].includes(f.inputType) && f.fieldType !== "pageBreak" && (
            <div style={{ marginTop: 12 }}>
              <strong>Options</strong>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {(f.options || []).map((o, oIdx) => (
                  <div
                    key={oIdx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: 8,
                    }}
                  >
                    <input
                      placeholder="Label"
                      value={o.label || ""}
                      onChange={(e) =>
                        updateOption(idx, oIdx, { label: e.target.value })
                      }
                    />
                    <input
                      placeholder="Value"
                      value={o.value || ""}
                      onChange={(e) =>
                        updateOption(idx, oIdx, { value: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(idx, oIdx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addOption(idx)}>
                  + Add Option
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button type="button" onClick={() => removeField(idx)}>
              Remove Field
            </button>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={addField}>
          + Add Field
        </button>
        <button type="button" onClick={addPageBreak}>
          + Add Page Break
        </button>
        <button type="button" disabled={saving} onClick={onSave}>
          {saving ? "Saving..." : existingForm ? "Update Form" : "Save Form"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="button" onClick={() => setShowPreview(true)}>
          Preview Form
        </button>
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      {showPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) =>
            e.target === e.currentTarget && setShowPreview(false)
          }
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              maxWidth: 800,
              width: "95%",
              maxHeight: "85vh",
              overflow: "auto",
            }}
          >
            <h3>Form Preview — {name || "Untitled"}</h3>
            <UDFFormRenderer
              form={{ name, description, fields }}
              isEditing={false}
              previewMode={true}
              onSubmit={(data) => {
                // callback when preview submit is pressed
                console.log("Preview Submit:", data);
                setShowPreview(false);
              }}
            />
            <button
              style={{ marginTop: 12 }}
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
