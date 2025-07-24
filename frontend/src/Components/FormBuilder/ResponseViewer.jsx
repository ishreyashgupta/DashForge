import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTemplateResponses } from "../../services/formBuilderService";
import useAuth from "../../hooks/useAuth";
import "../../styles/ResponseViewer.css";

function ResponseViewer() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchResponses();
  }, [templateId, token]);

  const fetchResponses = async () => {
    try {
      const result = await getTemplateResponses(templateId, token);
      setData(result);
    } catch (err) {
      toast.error(err.message);
      navigate("/my-forms");
    } finally {
      setLoading(false);
    }const result = await getTemplateResponses(templateId, token);
console.log("Fetched response data:", result);

  };

  const exportToCSV = () => {
    if (!data.responses.length) return;
    
    const headers = ['Submission Date', 'Respondent', ...data.template.fields.map(f => f.label)];
    const rows = data.responses.map(response => [
      new Date(response.createdAt).toLocaleString(),
      response.respondentId?.email || response.respondentEmail || 'Anonymous',
      ...data.template.fields.map(field => {
        const responseField = response.responses.find(r => r.fieldId === field.id);
        return responseField ? (Array.isArray(responseField.value) ? responseField.value.join(', ') : responseField.value) : '';
      })
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.template.title}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading">Loading responses...</div>;

if (!data || !data.template || !Array.isArray(data.responses)) {
  return <div className="error">Failed to load responses</div>;
}

  return (
    <div className="response-viewer">
      <div className="viewer-header">
        <h2>Responses: {data.template.title}</h2>
        <div className="header-actions">
          <button onClick={exportToCSV} className="btn btn-secondary" disabled={!data.responses.length}>
            📥 Export CSV
          </button>
          <button onClick={() => navigate("/my-forms")} className="btn btn-primary">
            ← Back to My Forms
          </button>
        </div>
      </div>

      <div className="response-stats">
        <div className="stat-card">
          <h3>{data.responses.length}</h3>
          <p>Total Responses</p>
        </div>
        <div className="stat-card">
          <h3>{data.template.fields.length}</h3>
          <p>Fields</p>
        </div>
        <div className="stat-card">
          <h3>{new Set(data.responses.map(r => r.respondentId?.email || r.respondentEmail)).size}</h3>
          <p>Unique Respondents</p>
        </div>
      </div>

      {data.responses.length === 0 ? (
        <div className="no-responses">
          <h3>No responses yet</h3>
          <p>Share your form to start collecting responses!</p>
          <button
            onClick={() => {
              const link = `${window.location.origin}/form/${templateId}`;
              navigator.clipboard.writeText(link);
              toast.success("Form link copied to clipboard!");
            }}
            className="btn btn-primary"
          >
            📋 Copy Form Link
          </button>
        </div>
      ) : (
        <div className="responses-container">
          <div className="responses-list">
            {data.responses.map((response, index) => (
              <div
                key={response._id}
                className={`response-item ${selectedResponse?._id === response._id ? 'selected' : ''}`}
                onClick={() => setSelectedResponse(response)}
              >
                <div className="response-header">
                  <span className="response-number">#{index + 1}</span>
                  <span className="respondent">
                    {response.respondentId?.name || response.respondentEmail || 'Anonymous'}
                  </span>
                  <span className="response-date">
                    {new Date(response.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedResponse && (
            <div className="response-details">
              <div className="details-header">
                <h3>Response Details</h3>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="btn btn-sm btn-secondary"
                >
                  ✕ Close
                </button>
              </div>

              <div className="response-meta">
                <p><strong>Submitted:</strong> {new Date(selectedResponse.createdAt).toLocaleString()}</p>
                <p><strong>Respondent:</strong> {selectedResponse.respondentId?.email || selectedResponse.respondentEmail || 'Anonymous'}</p>
                {selectedResponse.ipAddress && (
                  <p><strong>IP Address:</strong> {selectedResponse.ipAddress}</p>
                )}
              </div>

              <div className="response-answers">
                {data.template.fields.map(field => {
                  const answer = selectedResponse.responses.find(r => r.fieldId === field.id);
                  return (
                    <div key={field.id} className="answer-item">
                      <label className="answer-label">{field.label}</label>
                      <div className="answer-value">
                        {answer ? (
                          Array.isArray(answer.value) ? 
                          answer.value.join(', ') : 
                          answer.value.toString()
                        ) : (
                          <em className="no-answer">No answer</em>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResponseViewer;
