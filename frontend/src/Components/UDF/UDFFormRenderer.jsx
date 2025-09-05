import React, { useEffect, useMemo, useRef, useState } from "react";

export default function UDFFormRenderer({ form = {}, onSubmit, isEditing = false, previewMode = false }) {
  const containerRef = useRef(null);
  const fields = Array.isArray(form.fields) ? form.fields : [];

  // 1) Group fields into pages using "pageBreak"
  const pages = useMemo(() => {
    const p = [[]];
    for (const f of fields) {
      if (!f) continue;

      // Treat pageBreak as a separator, not an input
      if (f.fieldType === "pageBreak") {
        if (p[p.length - 1].length > 0) p.push([]);
      } else if (f.visible !== false) {
        p[p.length - 1].push(f);
      }
    }
    return p.filter((pg) => pg.length > 0);
  }, [fields]);

  // 2) Form state for all fields (skip pageBreaks)
  const [formState, setFormState] = useState(() => {
    const s = {};
    for (const f of fields) {
      if (!f || f.fieldType === "pageBreak") continue;
      const name = f.fieldName || f.label || "";
      if (!name) continue;

      if (s[name] === undefined) {
        if (f.inputType === "checkbox") s[name] = !!f.defaultValue;
        else if (f.inputType === "multiselect") s[name] = Array.isArray(f.defaultValue) ? f.defaultValue : [];
        else s[name] = f.defaultValue ?? "";
      }
    }
    return s;
  });

  // Keep state in sync when form updates
  useEffect(() => {
    setFormState((prev) => {
      const next = { ...prev };
      for (const f of fields) {
        if (!f || f.fieldType === "pageBreak") continue;
        const name = f.fieldName || f.label || "";
        if (!name) continue;

        if (next[name] === undefined) {
          if (f.inputType === "checkbox") next[name] = !!f.defaultValue;
          else if (f.inputType === "multiselect") next[name] = Array.isArray(f.defaultValue) ? f.defaultValue : [];
          else next[name] = f.defaultValue ?? "";
        }
      }
      return next;
    });
  }, [fields]);

  const [pageIndex, setPageIndex] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPageIndex((p) => Math.min(p, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [pageIndex]);

  // ----------------- VALIDATION -----------------
  function validateField(f, value) {
    if (!f || f.fieldType === "pageBreak") return null;

    const label = f.label || f.fieldName || "Field";
    if (f.required) {
      if (value === undefined || value === null) return `${label} is required`;
      if (typeof value === "string" && value.trim() === "") return `${label} is required`;
      if (Array.isArray(value) && value.length === 0) return `${label} is required`;
    }

    if (f.validation) {
      const { min, max, minLength, maxLength, pattern } = f.validation;

      // Numeric checks
      if ((f.dataType === "number" || f.inputType === "number") && value !== "" && value !== undefined && value !== null) {
        const num = Number(value);
        if (!Number.isNaN(num)) {
          if (min !== undefined && num < Number(min)) return `${label} must be ≥ ${min}`;
          if (max !== undefined && num > Number(max)) return `${label} must be ≤ ${max}`;
        }
      }

      // Length checks
      if (typeof value === "string" || Array.isArray(value)) {
        if (minLength && value.length < Number(minLength)) return `${label} must have at least ${minLength} characters`;
        if (maxLength && value.length > Number(maxLength)) return `${label} must have at most ${maxLength} characters`;
      }

      // Pattern checks
      if (pattern) {
        try {
          const re = new RegExp(pattern);
          if (typeof value === "string" && value !== "" && !re.test(value)) return `${label} does not match required format`;
        } catch {}
      }
    }

    return null;
  }

  function validatePage(pageFields) {
    const errs = {};
    for (const f of pageFields) {
      if (!f || f.fieldType === "pageBreak") continue;
      const name = f.fieldName || f.label;
      const val = formState[name];
      const msg = validateField(f, val);
      if (msg) errs[name] = msg;
    }
    return errs;
  }

  const currentPageFields = pages[pageIndex] || [];
  const pageValidation = validatePage(currentPageFields);
  const isPageValid = Object.keys(pageValidation).length === 0;

  // ----------------- HANDLERS -----------------
  const handleChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleNext = () => {
    const errs = validatePage(currentPageFields);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setPageIndex((p) => Math.min(p + 1, pages.length - 1));
    }
  };

  const handleBack = () => setPageIndex((p) => Math.max(0, p - 1));

  const handleFinalSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const errs = validatePage(currentPageFields);
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      const payload = {};
      for (const f of fields) {
        if (!f || f.fieldType === "pageBreak") continue;
        const name = f.fieldName || f.label;
        payload[name] = formState[name];
      }
      onSubmit?.(payload);
    }
  };

  // Disable Enter key for multi-step navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const active = document.activeElement;
      if (active && active.tagName === "TEXTAREA") return;

      if (pageIndex < pages.length - 1) {
        e.preventDefault();
        e.stopPropagation();
        if (isPageValid) handleNext();
      }
    }
  };

  // ----------------- RENDER INPUTS -----------------
  function renderInput(f) {
    if (f.fieldType === "pageBreak") return null;

    const name = f.fieldName || f.label || "";
    const val = formState[name];
    const sharedProps = {
      id: name,
      value: val ?? "",
      onChange: (e) => handleChange(name, e.target.type === "checkbox" ? e.target.checked : e.target.value),
      onKeyDown: handleKeyDown,
      style: { width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8, border: "1px solid #d0d0d0" },
    };

    switch (f.inputType) {
      case "textarea":
        return <textarea {...sharedProps} rows={4} placeholder={f.placeholder || ""} />;
      case "select":
        return (
          <select {...sharedProps} value={val ?? ""}>
            <option value="">Select</option>
            {(f.options || []).map((o, i) => (
              <option key={i} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "multiselect":
        return (
          <select
            multiple
            value={Array.isArray(val) ? val : []}
            onChange={(e) => handleChange(name, Array.from(e.target.selectedOptions, (o) => o.value))}
            onKeyDown={handleKeyDown}
            style={sharedProps.style}
          >
            {(f.options || []).map((o, i) => (
              <option key={i} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div>
            {(f.options || []).map((o, i) => (
              <label key={i} style={{ display: "block", marginBottom: 6 }}>
                <input type="radio" name={name} value={o.value} checked={val === o.value} onChange={() => handleChange(name, o.value)} />
                <span style={{ marginLeft: 8 }}>{o.label}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        if (Array.isArray(f.options) && f.options.length > 0) {
          const cur = Array.isArray(val) ? val : [];
          return (
            <div>
              {(f.options || []).map((o, i) => (
                <label key={i} style={{ display: "block", marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={cur.includes(o.value)}
                    onChange={(e) => {
                      const next = e.target.checked ? [...cur, o.value] : cur.filter((v) => v !== o.value);
                      handleChange(name, next);
                    }}
                  />
                  <span style={{ marginLeft: 8 }}>{o.label}</span>
                </label>
              ))}
            </div>
          );
        }
        return <input type="checkbox" checked={!!val} onChange={(e) => handleChange(name, e.target.checked)} />;
      default:
        return <input {...sharedProps} type={f.inputType || "text"} placeholder={f.placeholder || ""} />;
    }
  }

  // ----------------- RENDER UI -----------------
  const cardStyle = { background: "#fff", border: "1px solid #e6e6e6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderRadius: 10, padding: 16 };

  return (
    <div ref={containerRef} style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>{form.name || "Untitled Form"}</h3>
            {form.description && <p style={{ margin: "8px 0", color: "#666" }}>{form.description}</p>}
          </div>

          {!isEditing && (
            <div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>
              Step {pageIndex + 1} of {pages.length}
            </div>
          )}
        </div>

        {/* Fields container */}
        <form onSubmit={handleFinalSubmit} style={{ marginTop: 12 }} onKeyDown={handleKeyDown}>
          <div>
            {currentPageFields.length === 0 ? (
              <div style={{ color: "#888" }}>No fields on this page.</div>
            ) : (
              currentPageFields.map((f, idx) => {
                if (f.fieldType === "pageBreak") return null;
                const name = f.fieldName || f.label || `field_${idx}`;
                return (
                  <div key={name} style={{ marginBottom: 12 }}>
                    <label htmlFor={name} style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                      {f.label || name}
                      {f.required && <span style={{ color: "#d32f2f", marginLeft: 6 }}>*</span>}
                    </label>
                    {renderInput(f)}
                    {f.helpText && <div style={{ marginTop: 6, color: "#777", fontSize: 13 }}>{f.helpText}</div>}
                    {errors[name] && <div style={{ marginTop: 6, color: "#d32f2f", fontSize: 13 }}>{errors[name]}</div>}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom toolbar */}
          {!isEditing && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <div />
              <div style={{ display: "flex", gap: 8 }}>
                {pageIndex > 0 && (
                  <button type="button" onClick={handleBack} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #cfcfcf", background: "#f8f8f8" }}>
                    Back
                  </button>
                )}

                {pageIndex < pages.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isPageValid}
                    style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: isPageValid ? "#1976d2" : "#e0e0e0", color: isPageValid ? "#fff" : "#888" }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isPageValid}
                    style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: isPageValid ? "#1976d2" : "#e0e0e0", color: isPageValid ? "#fff" : "#888" }}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {isEditing && (
        <div style={{ marginTop: 12, color: "#666" }}>
          Editing mode — use Builder to modify fields.
        </div>
      )}
    </div>
  );
}
