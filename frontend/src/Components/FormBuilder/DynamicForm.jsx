// frontend/src/Components/FormBuilder/DynamicForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTemplateById, submitResponse } from "../../services/formBuilderService";
import useAuth from "../../hooks/useAuth";
import "../../styles/DynamicForm.css";

function DynamicForm() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { token, email } = useAuth();
  
  const [template, setTemplate] = useState(null);
  const [responses, setResponses] = useState({});
  const [respondentEmail, setRespondentEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const data = await getTemplateById(templateId, token);
      setTemplate(data.template);
      
      // Initialize responses object
      const initialResponses = {};
      data.template.fields.forEach(field => {
        initialResponses[field.id] = field.type === 'checkbox' ? [] : '';
      });
      setResponses(initialResponses);
    } catch (err) {
      toast.error(err.message);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setResponses(prev => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...currentValues, option] };
      } else {
        return { ...prev, [fieldId]: currentValues.filter(v => v !== option) };
      }
    });
  };

  const renderField = (field) => {
    const value = responses[field.id] || '';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="form-control"
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="form-control"
            rows="4"
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="form-control"
          />
        );
        
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="form-control"
          >
            <option value="">Select an option</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="radio-group">
            {field.options.map((option, index) => (
              <label key={index} className="radio-label">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options.map((option, index) => (
              <label key={index} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      default:
        return <p>Unsupported field type: {field.type}</p>;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    for (let field of template.fields) {
      if (field.required) {
        const value = responses[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error(`${field.label} is required`);
          return;
        }
      }
    }

    // Check if anonymous email is needed
    if (!token && !template.allowAnonymous) {
      toast.error("Login required to submit this form");
      return;
    }

    if (!token && !respondentEmail.trim()) {
      toast.error("Email is required for anonymous submissions");
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        responses: Object.entries(responses).map(([fieldId, value]) => ({
          fieldId,
          value
        })),
        respondentEmail: respondentEmail || email
      };

      await submitResponse(templateId, responseData, token);
      toast.success("Response submitted successfully!");
      
      // Reset form
      const initialResponses = {};
      template.fields.forEach(field => {
        initialResponses[field.id] = field.type === 'checkbox' ? [] : '';
      });
      setResponses(initialResponses);
      setRespondentEmail("");
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading form...</div>;

  if (!template) return <div className="error">Form not found</div>;

  return (
    <div className="dynamic-form">
      <div className="form-header">
        <h1>{template.title}</h1>
        {template.description && (
          <p className="form-description">{template.description}</p>
        )}
        
        <div className="form-info">
          <span>Created by: {template.userId?.name || "Anonymous"}</span>
          {template.maxResponses && (
            <span>Responses: {template.responseCount || 0}/{template.maxResponses}</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="response-form">
        {!token && (
          <div className="form-group">
            <label>Your Email *</label>
            <input
              type="email"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="form-control"
            />
          </div>
        )}

        {template.fields.map((field, index) => (
          <div key={field.id} className="form-group">
            <label className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}

        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? "Submitting..." : "Submit Response"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default DynamicForm;