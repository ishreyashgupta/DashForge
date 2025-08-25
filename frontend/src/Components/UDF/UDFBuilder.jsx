import React, { useEffect, useState } from "react";
import { createUDFForm, getMeta } from "../../services/udfservice";

const emptyField = {
  fieldName: "",
  label: "",
  dataType: "string",
  inputType: "text",
  placeholder: "",
  helpText: "",
  required: false,
  defaultValue: "",
  options: [],
  validation: {
    minLength: undefined,
    maxLength: undefined,
    min: undefined,
    max: undefined,
    pattern: "",
  },
  visible: true,
};

export default function UDFBuilder() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([{ ...emptyField }]);
  const [meta, setMeta] = useState({ dataTypes: [], inputTypes: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    getMeta().then(setMeta).catch(console.error);
  }, []);

  const updateField = (idx, patch) => {
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));
  };

  const addField = () => setFields(prev => [...prev, { ...emptyField }]);
  const removeField = (idx) => setFields(prev => prev.filter((_, i) => i !== idx));

  const addOption = (idx) => {
    const f = fields[idx];
    updateField(idx, { options: [...(f.options || []), { label: "", value: "" }] });
  };
  const updateOption = (fIdx, oIdx, patch) => {
    const f = fields[fIdx];
    const opts = f.options.map((o, i) => i === oIdx ? { ...o, ...patch } : o);
    updateField(fIdx, { options: opts });
  };
  const removeOption = (fIdx, oIdx) => {
    const f = fields[fIdx];
    const opts = f.options.filter((_, i) => i !== oIdx);
    updateField(fIdx, { options: opts });
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const cleaned = fields.map(f => {
        const v = { ...f };
        if (v.validation.min !== undefined) v.validation.min = Number(v.validation.min);
        if (v.validation.max !== undefined) v.validation.max = Number(v.validation.max);
        if (v.validation.minLength !== undefined) v.validation.minLength = Number(v.validation.minLength);
        if (v.validation.maxLength !== undefined) v.validation.maxLength = Number(v.validation.maxLength);
        return v;
      });
      const payload = { name, description, fields: cleaned };
      const res = await createUDFForm(payload);
      setMessage(`Saved form: ${res.name}`);
      setName(""); setDescription(""); setFields([{ ...emptyField }]);
    } catch (e) {
      setMessage(e.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const renderPreviewField = (f, idx) => {
    if (!f.visible) return null;

    const commonProps = {
      placeholder: f.placeholder,
      defaultValue: f.defaultValue,
      required: f.required,
      minLength: f.validation.minLength,
      maxLength: f.validation.maxLength,
      pattern: f.validation.pattern,
      min: f.validation.min,
      max: f.validation.max,
    };

    if (["text", "number", "email", "password"].includes(f.inputType)) {
      return (
        <div key={idx} style={{ marginBottom: 12 }}>
          <label>{f.label}{f.required && "*"}</label>
          <input type={f.inputType} {...commonProps} />
          {f.helpText && <small>{f.helpText}</small>}
        </div>
      );
    }

    if (f.inputType === "textarea") {
      return (
        <div key={idx} style={{ marginBottom: 12 }}>
          <label>{f.label}{f.required && "*"}</label>
          <textarea {...commonProps}></textarea>
          {f.helpText && <small>{f.helpText}</small>}
        </div>
      );
    }

    if (["select", "multiselect", "radio"].includes(f.inputType)) {
      return (
        <div key={idx} style={{ marginBottom: 12 }}>
          <label>{f.label}{f.required && "*"}</label>
          {f.inputType === "radio" ? (
            f.options.map((o, i) => (
              <label key={i} style={{ display: "block" }}>
                <input type="radio" name={f.fieldName} value={o.value} /> {o.label}
              </label>
            ))
          ) : (
            <select {...commonProps} multiple={f.inputType === "multiselect"}>
              {f.options.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
            </select>
          )}
          {f.helpText && <small>{f.helpText}</small>}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>Create UDF Form</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <input placeholder="Form name" value={name} onChange={e => setName(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <h3 style={{ marginTop: 24 }}>Fields</h3>
      {fields.map((f, idx) => (
        <div key={idx} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
            <input placeholder="Field name (key)" value={f.fieldName} onChange={e => updateField(idx, { fieldName: e.target.value })} />
            <input placeholder="Label" value={f.label} onChange={e => updateField(idx, { label: e.target.value })} />
            <select value={f.dataType} onChange={e => updateField(idx, { dataType: e.target.value })}>
              {meta.dataTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
            </select>
            <select value={f.inputType} onChange={e => updateField(idx, { inputType: e.target.value })}>
              {meta.inputTypes.map(it => <option key={it} value={it}>{it}</option>)}
            </select>
            <label>
              <input type="checkbox" checked={f.visible} onChange={e => updateField(idx, { visible: e.target.checked })} /> Visible
            </label>
            <label>
              <input type="checkbox" checked={f.required} onChange={e => updateField(idx, { required: e.target.checked })} /> Required
            </label>
          </div>

          {["select", "multiselect", "radio"].includes(f.inputType) && (
            <div style={{ marginTop: 12 }}>
              <strong>Options</strong>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {(f.options || []).map((o, oIdx) => (
                  <div key={oIdx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                    <input placeholder="Label" value={o.label} onChange={e => updateOption(idx, oIdx, { label: e.target.value })} />
                    <input placeholder="Value" value={o.value} onChange={e => updateOption(idx, oIdx, { value: e.target.value })} />
                    <button type="button" onClick={() => removeOption(idx, oIdx)}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => addOption(idx)}>+ Add Option</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <strong>Validation</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 9 }}>
              <input type="number" placeholder="minLength" value={f.validation.minLength ?? ""} onChange={e => updateField(idx, { validation: { ...f.validation, minLength: e.target.value } })} />
              <input type="number" placeholder="maxLength" value={f.validation.maxLength ?? ""} onChange={e => updateField(idx, { validation: { ...f.validation, maxLength: e.target.value } })} />
              <input type="number" placeholder="min" value={f.validation.min ?? ""} onChange={e => updateField(idx, { validation: { ...f.validation, min: e.target.value } })} />
              <input type="number" placeholder="max" value={f.validation.max ?? ""} onChange={e => updateField(idx, { validation: { ...f.validation, max: e.target.value } })} />
              <input placeholder="pattern (regex)" value={f.validation.pattern ?? ""} onChange={e => updateField(idx, { validation: { ...f.validation, pattern: e.target.value } })} />
            </div>
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button type="button" onClick={() => removeField(idx)}>Remove Field</button>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={addField}>+ Add Field</button>
        <button type="button" disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save Form"}</button>
        <button type="button" onClick={() => setShowPreview(true)}>Preview Form</button>
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      {showPreview && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }} onClick={e => e.target === e.currentTarget && setShowPreview(false)}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, maxWidth: 800, width: "95%", maxHeight: "85vh", overflow: "auto" }}>
            <h3>Form Preview — {name || "Untitled"}</h3>
            {fields.map(renderPreviewField)}
            <button style={{ marginTop: 12 }} onClick={() => setShowPreview(false)}>Close Preview</button>
          </div>
        </div>
      )}
    </div>
  );
}
