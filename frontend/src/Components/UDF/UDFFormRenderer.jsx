import React, { useState, useEffect } from "react";
import { getUDFFormById } from "../../services/udfservice"; // UDF API service

function UDFFormRenderer({ formId, onSubmit }) {
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (formId) {
      getUDFFormById(formId)
        .then((data) => {
          setForm(data);
          // Initialize formData with default values
          const initData = {};
          data.fields.forEach((f) => {
            initData[f.fieldName] = f.properties.defaultValue || "";
          });
          setFormData(initData);
        })
        .catch((err) => console.error(err));
    }
  }, [formId]);

  if (!form) return <p>Loading form...</p>;

  // Handle input change
  const handleChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    else alert(JSON.stringify(formData, null, 2));
  };

  return (
    <div>
      <h2>{form.name}</h2>
      <form onSubmit={handleSubmit}>
        {form.fields.map((field) => {
          const { fieldName, inputType, properties } = field;

          // Required indicator
          const required = properties.required;

          // Render based on input type
          switch (inputType) {
            case "text":
            case "varchar":
            case "int":
            case "float":
            case "date":
              return (
                <div key={fieldName} style={{ marginBottom: "10px" }}>
                  <label>
                    {fieldName} {required && "*"}
                  </label>
                  <br />
                  <input
                    type={inputType === "date" ? "date" : "text"}
                    value={formData[fieldName]}
                    onChange={(e) => handleChange(fieldName, e.target.value)}
                    required={required}
                  />
                </div>
              );

            case "textarea":
              return (
                <div key={fieldName} style={{ marginBottom: "10px" }}>
                  <label>
                    {fieldName} {required && "*"}
                  </label>
                  <br />
                  <textarea
                    value={formData[fieldName]}
                    onChange={(e) => handleChange(fieldName, e.target.value)}
                    required={required}
                  />
                </div>
              );

            case "checkbox":
              return (
                <div key={fieldName} style={{ marginBottom: "10px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData[fieldName]}
                      onChange={(e) => handleChange(fieldName, e.target.checked)}
                    />{" "}
                    {fieldName} {required && "*"}
                  </label>
                </div>
              );

            case "dropdown":
              return (
                <div key={fieldName} style={{ marginBottom: "10px" }}>
                  <label>
                    {fieldName} {required && "*"}
                  </label>
                  <br />
                  <select
                    value={formData[fieldName]}
                    onChange={(e) => handleChange(fieldName, e.target.value)}
                    required={required}
                  >
                    {/* If you want, you can extend properties to include options */}
                    <option value="">Select...</option>
                  </select>
                </div>
              );

            case "multiselect":
              return (
                <div key={fieldName} style={{ marginBottom: "10px" }}>
                  <label>
                    {fieldName} {required && "*"}
                  </label>
                  <br />
                  <select
                    multiple
                    value={formData[fieldName]}
                    onChange={(e) =>
                      handleChange(
                        fieldName,
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                    required={required}
                  >
                    {/* You can add options via properties.options */}
                  </select>
                </div>
              );

            default:
              return null;
          }
        })}

        <button type="submit" style={{ marginTop: "10px" }}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default UDFFormRenderer;
