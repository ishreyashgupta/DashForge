//frontend/src/Components/FormBuilder/MyForms.jsx - Updated Edit Button
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getUserTemplates, deleteTemplate } from "../../services/formBuilderService";
import useAuth from "../../hooks/useAuth";
import "../../styles/MyForms.css";

function MyForms() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTemplates();
  }, [token, navigate]);

  const fetchTemplates = async () => {
    try {
      const data = await getUserTemplates(token);
      setTemplates(data.templates);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will also delete all responses.`)) {
      try {
        await deleteTemplate(templateId, token);
        toast.success("Form deleted successfully");
        fetchTemplates();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const copyFormLink = (templateId) => {
    const link = `${window.location.origin}/dynamic-form/${templateId}`;
    navigator.clipboard.writeText(link);
    toast.success("Form link copied to clipboard!");
  };

  if (loading) return <div className="loading">Loading your forms...</div>;

  return (
    <div className="my-forms">
      <div className="forms-header">
        <h2>My Forms</h2>
        <button
          onClick={() => navigate("/form-builder")}
          className="btn btn-primary"
        >
          + Create New Form
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="no-forms">
          <h3>No forms created yet</h3>
          <p>Create your first form to start collecting responses!</p>
          <button
            onClick={() => navigate("/form-builder")}
            className="btn btn-primary"
          >
            Create Your First Form
          </button>
        </div>
      ) : (
        <div className="forms-grid">
          {templates.map(template => (
            <div key={template._id} className="form-card">
              <div className="card-header">
                <h3>{template.title}</h3>
                <div className="card-badges">
                  {template.isPublic && <span className="badge public">Public</span>}
                  {!template.isActive && <span className="badge inactive">Inactive</span>}
                </div>
              </div>

              <div className="card-body">
                <p className="description">
                  {template.description || "No description"}
                </p>
                
                <div className="form-stats">
                  <span>📊 {template.responseCount || 0} responses</span>
                  <span>📝 {template.fields?.length || 0} fields</span>
                  <span>📅 {new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-actions">
                <Link
                  to={`/dynamic-form/${template._id}`}
                  className="btn btn-sm btn-primary"
                >
                  View Form
                </Link>
                
                <Link
                  to={`/responses/${template._id}`}
                  className="btn btn-sm btn-secondary"
                >
                  Responses ({template.responseCount || 0})
                </Link>

                <button
                  onClick={() => copyFormLink(template._id)}
                  className="btn btn-sm btn-info"
                >
                  Copy Link
                </button>

                {/* ✅ Updated Edit Button - Uses separate route */}
                <button
                  onClick={() => navigate(`/form-builder/edit/${template._id}`)}
                  className="btn btn-sm btn-warning"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(template._id, template.title)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyForms;