import React, { useEffect, useMemo, useState } from "react";
import { getUDFFormById } from "../../services/udfservice";

export default function UDFFormRenderer({ formId, form, onSubmit }) {
  const [loadedForm, setLoadedForm] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form when `form` prop is passed
  useEffect(() => {
    if (form) {
      setLoadedForm(form);
      const init = {};
      (form.fields || []).forEach(field => {
        if (field.inputType === "checkbox") init[field.fieldName] = !!field.defaultValue;
        else if (field.inputType === "multiselect") init[field.fieldName] = Array.isArray(field.defaultValue) ? field.defaultValue : [];
        else init[field.fieldName] = field.defaultValue ?? "";
      });
      setValues(init);
    }
  }, [form]);

  // Fetch form by formId if not passed
  useEffect(() => {
    if (!formId || form) return;
    getUDFFormById(formId)
      .then(f => {
        setLoadedForm(f);
        const init = {};
        (f.fields || []).forEach(field => {
          if (field.inputType === "checkbox") init[field.fieldName] = !!field.defaultValue;
          else if (field.inputType === "multiselect") init[field.fieldName] = Array.isArray(field.defaultValue) ? field.defaultValue : [];
          else init[field.fieldName] = field.defaultValue ?? "";
        });
        setValues(init);
      })
      .catch(console.error);
  }, [formId, form]);

  const currentForm = useMemo(() => loadedForm || form, [loadedForm, form]);

  if (!currentForm) return <div>Loading form...</div>;

  const setValue = (name, val) => setValues(prev => ({ ...prev, [name]: val }));

  const runValidation = () => {
    const err = {};
    (currentForm.fields || []).forEach(f => {
      const v = values[f.fieldName];

      // Required validation
      if (f.required) {
        const empty = f.inputType === "checkbox"
          ? v !== true && v !== false
          : (v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0));
        if (empty) err[f.fieldName] = "Required";
      }

      if (v != null && v !== "") {
        if (f.validation?.minLength && String(v).length < f.validation.minLength)
          err[f.fieldName] = `Min length ${f.validation.minLength}`;
        if (f.validation?.maxLength && String(v).length > f.validation.maxLength)
          err[f.fieldName] = `Max length ${f.validation.maxLength}`;
        if (f.validation?.min != null && Number(v) < f.validation.min)
          err[f.fieldName] = `Min value ${f.validation.min}`;
        if (f.validation?.max != null && Number(v) > f.validation.max)
          err[f.fieldName] = `Max value ${f.validation.max}`;
        if (f.validation?.pattern) {
          try {
            const re = new RegExp(f.validation.pattern);
            if (!re.test(String(v))) err[f.fieldName] = "Invalid format";
          } catch (_) {}
        }
        if (f.dataType === "email") {
          const re = /\S+@\S+\.\S+/;
          if (!re.test(String(v))) err[f.fieldName] = "Invalid email";
        }
        if (f.dataType === "url") {
          try { new URL(String(v)); } catch { err[f.fieldName] = "Invalid URL"; }
        }
      }
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!runValidation()) return;
    onSubmit?.(values);
    if (!onSubmit) alert(JSON.stringify(values, null, 2));
  };

  const renderField = (f) => {
    const common = {
      name: f.fieldName,
      value: values[f.fieldName] ?? "",
      onChange: (e) => setValue(f.fieldName, e.target.value),
      placeholder: f.placeholder || "",
    };

    switch (f.inputType) {
      case "textarea":
        return <textarea {...common} rows={4} />;
      case "number":
        return <input type="number" {...common} />;
      case "email":
        return <input type="email" {...common} />;
      case "password":
        return <input type="password" {...common} />;
      case "url":
        return <input type="url" {...common} />;
      case "date":
        return <input type="date" {...common} />;
      case "datetime-local":
        return <input type="datetime-local" {...common} />;
      case "color":
        return <input type="color" {...common} />;
      case "range":
        return <input type="range" {...common} min={f.validation?.min} max={f.validation?.max} />;
      case "checkbox":
        return <input type="checkbox" checked={!!values[f.fieldName]} onChange={(e) => setValue(f.fieldName, e.target.checked)} />;
      case "select":
        return (
          <select {...common}>
            <option value="">Select...</option>
            {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case "multiselect":
        return (
          <select multiple value={values[f.fieldName] || []} onChange={(e) => {
            const arr = Array.from(e.target.selectedOptions).map(o => o.value);
            setValue(f.fieldName, arr);
          }}>
            {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case "radio":
        return (
          <div style={{ display: "flex", gap: 12 }}>
            {(f.options || []).map(o => (
              <label key={o.value}>
                <input type="radio" name={f.fieldName} value={o.value} checked={values[f.fieldName] === String(o.value)} onChange={(e)=> setValue(f.fieldName, e.target.value)} />{" "}
                {o.label}
              </label>
            ))}
          </div>
        );
      case "file":
        return <input type="file" onChange={(e) => setValue(f.fieldName, e.target.files?.[0] || null)} />;
      default:
        return <input type="text" {...common} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h3>{currentForm.name || "Untitled Form"}</h3>
      {currentForm.description && <p>{currentForm.description}</p>}

      {(currentForm.fields || []).map(f => (
        <div key={f.fieldName || Math.random()} style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontWeight: 600 }}>
            {f.label || f.fieldName}{f.required ? " *" : ""}
          </label>
          {renderField(f)}
          {f.helpText && <small style={{ display: "block", opacity: 0.75 }}>{f.helpText}</small>}
          {errors[f.fieldName] && <div style={{ color: "crimson" }}>{errors[f.fieldName]}</div>}
        </div>
      ))}

      <button type="submit">Submit</button>
    </form>
  );
}
