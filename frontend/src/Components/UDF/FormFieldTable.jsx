import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import {
  createUDFForm,
  updateUDFForm,
  getUDFFormById,
} from "../../services/udfservice";

const DATA_TYPES = ["varchar", "int", "float", "boolean", "date"];
const INPUT_TYPES = ["text", "dropdown", "multiselect", "checkbox", "textarea"];

function FormFieldTable({ formId }) {
  const { role } = useAuth();
  const [fields, setFields] = useState([]);
  const [formName, setFormName] = useState("");

  // Load existing form if editing
  useEffect(() => {
    if (formId) {
      getUDFFormById(formId)
        .then((data) => {
          setFormName(data.name);
          setFields(data.fields || []);
        })
        .catch((err) => console.error(err));
    }
  }, [formId]);

  if (!role || role !== "admin") {
    return <p>You are not authorized to access this form builder.</p>;
  }

  // Add new field
  const addField = () => {
    setFields([
      ...fields,
      {
        name: "",
        label: "",
        dataType: "varchar",
        inputType: "text",
        properties: {
          required: false,
          defaultValue: "",
          options: [], // for dropdown/multiselect
        },
      },
    ]);
  };

  // Update main field attributes
  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  // Update properties
  const updateProperties = (index, key, value) => {
    const updated = [...fields];
    updated[index].properties[key] = value;
    setFields(updated);
  };

  // Remove field
  const removeField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  // Save form (create or update)
  const handleSave = async () => {
    if (!formName) return alert("Form name required");

    try {
      if (formId) {
        await updateUDFForm(formId, { name: formName, fields, createdBy: role });
        alert("Form updated successfully!");
      } else {
        await createUDFForm({ name: formName, fields, createdBy: role });
        alert("Form created successfully!");
        setFormName("");
        setFields([]);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving form");
    }
  };

  return (
    <div>
      <h2>{formId ? "Edit Form" : "User Defined Form Builder"}</h2>
      <input
        placeholder="Form Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px", width: "50%" }}
      />

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Name (key)</th>
            <th>Label</th>
            <th>Data Type</th>
            <th>Input Type</th>
            <th>Properties</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={index}>
              <td>
                <input
                  value={field.name}
                  onChange={(e) => updateField(index, "name", e.target.value)}
                  placeholder="Unique key"
                />
              </td>
              <td>
                <input
                  value={field.label}
                  onChange={(e) => updateField(index, "label", e.target.value)}
                  placeholder="Field label"
                />
              </td>
              <td>
                <select
                  value={field.dataType}
                  onChange={(e) => updateField(index, "dataType", e.target.value)}
                >
                  {DATA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={field.inputType}
                  onChange={(e) => updateField(index, "inputType", e.target.value)}
                >
                  {INPUT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={field.properties.required}
                    onChange={(e) =>
                      updateProperties(index, "required", e.target.checked)
                    }
                  />{" "}
                  Required
                </label>
                <br />
                {field.inputType === "checkbox" ? (
                  <label>
                    Default:
                    <input
                      type="checkbox"
                      checked={field.properties.defaultValue || false}
                      onChange={(e) =>
                        updateProperties(index, "defaultValue", e.target.checked)
                      }
                    />
                  </label>
                ) : (
                  <input
                    placeholder="Default value"
                    value={field.properties.defaultValue}
                    onChange={(e) =>
                      updateProperties(index, "defaultValue", e.target.value)
                    }
                  />
                )}
                {(field.inputType === "dropdown" ||
                  field.inputType === "multiselect") && (
                  <input
                    placeholder="Options (comma separated)"
                    value={field.properties.options.join(",")}
                    onChange={(e) =>
                      updateProperties(
                        index,
                        "options",
                        e.target.value.split(",")
                      )
                    }
                    style={{ marginTop: "5px" }}
                  />
                )}
              </td>
              <td>
                <button onClick={() => removeField(index)}>Remove</button>
              </td>
            </tr>
          ))}
          {fields.length === 0 && (
            <tr>
              <td colSpan="6" align="center">
                No fields added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button onClick={addField} style={{ marginTop: "10px" }}>
        Add Field
      </button>
      <button onClick={handleSave} style={{ marginLeft: "10px" }}>
        Save Form
      </button>
    </div>
  );
}

export default FormFieldTable;
