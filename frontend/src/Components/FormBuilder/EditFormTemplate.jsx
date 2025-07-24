// frontend/src/Components/FormBuilder/EditFormTemplate.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTemplateById, updateTemplate } from "../../services/formBuilderService";
import useAuth from "../../hooks/useAuth";
import FieldEditor from "./FieldEditor";
import "../../styles/FormBuilder.css";

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'textarea', label: 'Long Text', icon: '📄' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'radio', label: 'Radio Button', icon: '⚪' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'date', label: 'Date', icon: '📅' }
];

function EditFormTemplate() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [template, setTemplate] = useState({
    title: "",
    description: "",
    isPublic: false,
    allowAnonymous: true,
    maxResponses: null
  });
  
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTemplate();
  }, [templateId, token]);

  const fetchTemplate = async () => {
    try {
      const data = await getTemplateById(templateId, token);
      const t = data.template;
      
      setTemplate({
        title: t.title,
        description: t.description || "",
        isPublic: t.isPublic,
        allowAnonymous: t.allowAnonymous,
        maxResponses: t.maxResponses
      });
      
      setFields(t.fields || []);
    } catch (err) {
      toast.error(err.message);
      navigate("/my-forms");
    } finally {
      setLoading(false);
    }
  };

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: "",
      placeholder: "",
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1'] : []
    };
    setFields([...fields, newField]);
  };

  const updateField = (index, updatedField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const handleSave = async () => {
    if (!template.title.trim()) {
      toast.error("Form title is required");
      return;
    }
    
    if (fields.length === 0) {
      toast.error("Add at least one field");
      return;
    }
    
    for (let field of fields) {
      if (!field.label.trim()) {
        toast.error("All fields must have labels");
        return;
      }
    }

    setSaving(true);
    try {
      const templateData = {
        ...template,
        fields,
        maxResponses: template.maxResponses || null
      };
      
      await updateTemplate(templateId, templateData, token);
      toast.success("Form updated successfully!");
      navigate("/my-forms");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading form template...</div>;

  return (
    <div className="form-builder">
      <div className="form-builder-header">
        <h2>Edit Form Template</h2>
        <button onClick={() => navigate("/my-forms")} className="btn btn-secondary">
          ← Back to My Forms
        </button>
      </div>

      {/* Form Settings */}
      <div className="form-settings">
        <div className="form-group">
          <label>Form Title *</label>
          <input
            type="text"
            value={template.title}
            onChange={(e) => setTemplate({...template, title: e.target.value})}
            placeholder="Enter form title"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={template.description}
            onChange={(e) => setTemplate({...template, description: e.target.value})}
            placeholder="Optional form description"
            className="form-control"
            rows="3"
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={template.isPublic}
              onChange={(e) => setTemplate({...template, isPublic: e.target.checked})}
            />
            Make this form public
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={template.allowAnonymous}
              onChange={(e) => setTemplate({...template, allowAnonymous: e.target.checked})}
            />
            Allow anonymous responses
          </label>

          <div className="form-group">
            <label>Max Responses (optional)</label>
            <input
              type="number"
              value={template.maxResponses || ""}
              onChange={(e) => setTemplate({
                ...template, 
                maxResponses: e.target.value ? parseInt(e.target.value) : null
              })}
              placeholder="Unlimited"
              className="form-control"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Field Types */}
      <div className="field-types">
        <h3>Add Fields</h3>
        <div className="field-buttons">
          {FIELD_TYPES.map(fieldType => (
            <button
              key={fieldType.type}
              onClick={() => addField(fieldType.type)}
              className="field-type-btn"
            >
              <span className="field-icon">{fieldType.icon}</span>
              {fieldType.label}
            </button>
          ))}
        </div>
      </div>

      {/* Field List */}
      <div className="field-list">
        <h3>Form Fields ({fields.length})</h3>
        {fields.length === 0 ? (
          <p className="no-fields">No fields added yet. Add fields using the buttons above.</p>
        ) : (
          fields.map((field, index) => (
            <FieldEditor
              key={field.id}
              field={field}
              index={index}
              onUpdate={(updatedField) => updateField(index, updatedField)}
              onRemove={() => removeField(index)}
              onMove={moveField}
              canMoveUp={index > 0}
              canMoveDown={index < fields.length - 1}
            />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Updating..." : "Update Form"}
        </button>
        <button
          onClick={() => navigate("/my-forms")}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditFormTemplate;