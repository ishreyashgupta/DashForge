import React, { useEffect, useState } from "react";

/**
 * Props:
 * - form: { name, description, fields: [] }
 * - onSubmit: function(formData)  // called when user submits (final page)
 * - isEditing: boolean           // if true, show editing UI for fields
 * - previewMode: boolean         // if true, hide internal submit and show Prev/Next/Submit controls (used by preview modal)
 *
 * NOTE: Page-break detection will look for any of:
 *   field.fieldType === "pageBreak" ||
 *   field.inputType === "pageBreak" ||
 *   field.type === "pageBreak"
 */
export default function UDFFormRenderer({
  form = {},
  onSubmit,
  isEditing = false,
  previewMode = false,
}) {
  const incomingFields = Array.isArray(form.fields) ? form.fields : [];

  // pages: array of arrays of fields (page-break fields are not included in page content)
  const [pages, setPages] = useState([incomingFields]);
  const [currentPage, setCurrentPage] = useState(0);

  // formData: persistent values for all fields across pages
  const [formData, setFormData] = useState({});
  // fields state for editing mode (so we can mutate structure)
  const [fields, setFields] = useState(incomingFields);

  useEffect(() => {
    // When form changes (new form passed), reinitialize fields/pages/formData
    const flds = Array.isArray(form.fields) ? form.fields : [];
    setFields(flds);
  }, [form]);

  // split fields into pages whenever fields array changes
  useEffect(() => {
    const pagesArr = splitFieldsToPages(fields);
    setPages(pagesArr);
    // clamp currentPage if out of range
    setCurrentPage((p) => Math.min(p, Math.max(0, pagesArr.length - 1)));
    // initialize formData with defaults if not present
    setFormData((prev) => {
      const next = { ...prev };
      fields.forEach((f) => {
        const name = f.fieldName || f.label || "";
        // skip pageBreak meta fields
        if (
          (f.fieldType && f.fieldType === "pageBreak") ||
          (f.inputType && f.inputType === "pageBreak") ||
          (f.type && f.type === "pageBreak")
        ) {
          return;
        }
        if (next[name] === undefined) {
          if (f.inputType === "checkbox") next[name] = !!f.defaultValue;
          else if (f.inputType === "multiselect") next[name] = Array.isArray(f.defaultValue) ? f.defaultValue : [];
          else next[name] = f.defaultValue ?? "";
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  // helper: split into pages by pageBreak sentinel (pageBreak itself not included in pages)
  function splitFieldsToPages(flds) {
    const result = [];
    let current = [];
    for (let i = 0; i < flds.length; i++) {
      const f = flds[i];
      const isPageBreak =
        (f.fieldType && f.fieldType === "pageBreak") ||
        (f.inputType && f.inputType === "pageBreak") ||
        (f.type && f.type === "pageBreak");
      if (isPageBreak) {
        // push current page (even if empty — but avoid creating empty leading/trailing pages)
        if (current.length > 0) {
          result.push(current);
        } else {
          // If current empty and result is empty (leading page break), create an empty page
          if (result.length === 0) result.push([]);
          // else skip adding empty page to avoid duplications
        }
        current = [];
      } else {
        current.push(f);
      }
    }
    // push last
    if (current.length > 0) result.push(current);
    // if no page breaks and no fields => one empty page
    if (result.length === 0) result.push([]);
    return result;
  }

  // Update a field's structure while in editing mode
  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        fieldName: `field_${prev.length + 1}`,
        label: "New Field",
        dataType: "string",
        inputType: "text",
        placeholder: "",
        required: false,
        defaultValue: "",
        options: [],
        validation: {},
        visible: true,
      },
    ]);
  };

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (fIdx) => {
    const f = fields[fIdx];
    const opts = Array.isArray(f.options) ? f.options.slice() : [];
    opts.push({ label: "", value: "" });
    handleFieldChange(fIdx, "options", opts);
  };

  const updateOption = (fIdx, oIdx, patch) => {
    const f = fields[fIdx];
    const opts = (f.options || []).map((o, i) => (i === oIdx ? { ...o, ...patch } : o));
    handleFieldChange(fIdx, "options", opts);
  };

  const removeOption = (fIdx, oIdx) => {
    const f = fields[fIdx];
    const opts = (f.options || []).filter((_, i) => i !== oIdx);
    handleFieldChange(fIdx, "options", opts);
  };

  // Input change handler for user filling the form
  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Validate current page for required fields (basic)
  const validateCurrentPage = () => {
    const pageFlds = pages[currentPage] || [];
    for (let f of pageFlds) {
      if (!f) continue;
      const name = f.fieldName || f.label;
      if (f.required) {
        const val = formData[name];
        if (
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (Array.isArray(val) && val.length === 0) === true
        ) {
          return { ok: false, message: `${f.label || name} is required` };
        }
      }
      // You can extend validation (min/max etc.) here if needed
    }
    return { ok: true };
  };

  const goNext = () => {
    const validation = validateCurrentPage();
    if (!validation.ok) {
      // minimal feedback: alert (you can replace with nicer UI)
      alert(validation.message);
      return;
    }
    setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
  };

  const goBack = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const validation = validateCurrentPage();
    if (!validation.ok) {
      alert(validation.message);
      return;
    }
    if (onSubmit) onSubmit(formData);
  };

  // Render a single input based on field config
  const renderInput = (field) => {
    const name = field.fieldName || field.label || "";
    const value = formData[name];

    switch (field.inputType) {
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder || ""}
            required={field.required}
            value={value ?? ""}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
      case "select":
        return (
          <select value={value ?? ""} onChange={(e) => handleChange(name, e.target.value)}>
            <option value="">Select an option</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "multiselect":
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => handleChange(name, Array.from(e.target.selectedOptions, (o) => o.value))}
          >
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (field.options || []).map((opt, i) => (
          <label key={i} style={{ marginRight: 10 }}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => handleChange(name, opt.value)}
            />
            {opt.label}
          </label>
        ));
      case "checkbox":
        // If options exist for checkbox group -> render as multiple checkboxes
        if (Array.isArray(field.options) && field.options.length > 0) {
          const current = Array.isArray(value) ? value : [];
          return (field.options || []).map((opt, i) => (
            <label key={i} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={current.includes(opt.value)}
                onChange={(e) => {
                  const next = e.target.checked ? [...current, opt.value] : current.filter((v) => v !== opt.value);
                  handleChange(name, next);
                }}
              />
              {opt.label}
            </label>
          ));
        }
        // Single boolean checkbox
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(name, e.target.checked)}
          />
        );
      default:
        return (
          <input
            type={field.inputType || "text"}
            placeholder={field.placeholder || ""}
            required={field.required}
            value={value ?? ""}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
    }
  };

  // Render editing UI for a field (when isEditing)
  const renderFieldEditor = (field, index) => {
    return (
      <div
        key={index}
        style={{
          marginBottom: 12,
          padding: 8,
          border: "1px solid #ccc",
          borderRadius: 6,
          background: (field.fieldType === "pageBreak" || field.inputType === "pageBreak" || field.type === "pageBreak") ? "#fafafa" : "transparent",
        }}
      >
        { (field.fieldType === "pageBreak" || field.inputType === "pageBreak" || field.type === "pageBreak") ? (
          <div style={{ textAlign: "center", padding: 8 }}>
            📄 <strong>Page Break</strong>
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => removeField(index)}>Remove Page Break</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <input value={field.fieldName || ""} onChange={(e) => handleFieldChange(index, "fieldName", e.target.value)} placeholder="Field name" />
              <input value={field.label || ""} onChange={(e) => handleFieldChange(index, "label", e.target.value)} placeholder="Label" />
              <select value={field.inputType || "text"} onChange={(e) => handleFieldChange(index, "inputType", e.target.value)}>
                <option value="text">text</option>
                <option value="textarea">textarea</option>
                <option value="number">number</option>
                <option value="email">email</option>
                <option value="select">select</option>
                <option value="multiselect">multiselect</option>
                <option value="radio">radio</option>
                <option value="checkbox">checkbox</option>
                <option value="date">date</option>
                <option value="pageBreak">pageBreak</option>
              </select>
              <label>
                <input type="checkbox" checked={!!field.required} onChange={(e) => handleFieldChange(index, "required", e.target.checked)} /> Required
              </label>
            </div>

            {["select", "multiselect", "radio", "checkbox"].includes(field.inputType) && (
              <div style={{ marginTop: 12 }}>
                <strong>Options</strong>
                <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                  {(field.options || []).map((o, oIdx) => (
                    <div key={oIdx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                      <input placeholder="Label" value={o.label || ""} onChange={(e) => updateOption(index, oIdx, { label: e.target.value })} />
                      <input placeholder="Value" value={o.value || ""} onChange={(e) => updateOption(index, oIdx, { value: e.target.value })} />
                      <button type="button" onClick={() => removeOption(index, oIdx)}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(index)}>+ Add Option</button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => removeField(index)}>Remove Field</button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render the current page's form (or editor)
  const currentPageFields = pages[currentPage] || [];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h3>{form.name || "Untitled Form"}</h3>
      <p>{form.description}</p>

      {isEditing ? (
        <>
          <div>
            <button type="button" onClick={addField}>+ Add Field</button>
            <button
              type="button"
              onClick={() =>
                setFields((prev) => [
                  ...prev,
                  {
                    fieldName: `page_break_${prev.length + 1}`,
                    label: "Page Break",
                    fieldType: "pageBreak",
                    inputType: "pageBreak",
                  },
                ])
              }
            >
              + Add Page Break
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            {fields.map((f, idx) => renderFieldEditor(f, idx))}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Preview of pages:</strong>
            <div style={{ marginTop: 8 }}>
              {splitFieldsToPages(fields).map((pg, idx) => (
                <div key={idx} style={{ padding: 8, border: "1px dashed #ccc", marginBottom: 8 }}>
                  <strong>Page {idx + 1}</strong> — fields: {pg.map((f) => f.label || f.fieldName).join(", ")}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Non-editing (regular form) rendering with pagination
        <form onSubmit={handleSubmit}>
          {currentPageFields.length === 0 ? (
            <p style={{ color: "#888" }}>No fields on this page.</p>
          ) : (
            currentPageFields.map((field, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 12,
                  padding: 8,
                  border: "1px solid #eee",
                  borderRadius: 6,
                }}
              >
                <label style={{ display: "block", marginBottom: 6 }}>
                  <strong>{field.label || field.fieldName}</strong>
                  {field.required && <span style={{ color: "red" }}> *</span>}
                </label>
                {renderInput(field)}
                {field.helpText && <div style={{ fontSize: 12, color: "#666" }}>{field.helpText}</div>}
              </div>
            ))
          )}

          {/* If previewMode is true, hide the in-form submit and show navigation controls instead.
              If previewMode is false and not editing, show the original submit button here. */}
          {!previewMode && (
            <div style={{ marginTop: 16 }}>
              <button
                type="submit"
                style={{
                  padding: "8px 14px",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Submit Response
              </button>
            </div>
          )}
        </form>
      )}

      {/* Navigation controls (used in previewMode OR you can use them when not editing but previewMode true) */}
      {(!isEditing) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <div>
            <button type="button" onClick={goBack} disabled={currentPage === 0}>
              ← Back
            </button>
          </div>

          <div>
            <span style={{ marginRight: 12 }}>
              Page {currentPage + 1} of {pages.length}
            </span>

            {currentPage < pages.length - 1 ? (
              <button type="button" onClick={goNext}>
                Next →
              </button>
            ) : (
              // final page => show Submit (final)
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  padding: "8px 12px",
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
