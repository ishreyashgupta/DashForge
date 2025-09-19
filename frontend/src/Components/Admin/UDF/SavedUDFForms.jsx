import React, { useEffect, useState } from "react";
import {
  getAllUDFForms,
  deleteUDFForm,
  updateUDFForm,
  getUDFResponses,
  submitUDFResponse 
} from "../../services/udfservice";

import UDFBuilder from "./UDFBuilder"; // ✅ Use the same builder for edit/create
import UDFFormRenderer from "./UDFFormRenderer";
import DynamicResponsesViewer from "../../Components/UDF/DynamicReponsesViewer";

export default function SavedUDFForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewerForm, setViewerForm] = useState(null);
  const [responses, setResponses] = useState([]);

  const refresh = () => {
    setLoading(true);
    getAllUDFForms()
      .then(setForms)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this form?")) return;
    await deleteUDFForm(id);
    refresh();
  };

const handleResponseSubmit = async (formId, responseData) => {
  try {
    await submitUDFResponse(formId, responseData);
    alert("Response submitted successfully!");
    setActiveForm(null);
  } catch (err) {
    alert("Error submitting response: " + err.message);
  }
};



  const handleOpenForm = (form) => {
    setActiveForm(form);
    setIsEditing(false);
  };

  const handleEditForm = (form) => {
    setActiveForm(form);
    setIsEditing(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateUDFForm(activeForm._id, data);
        alert("Form updated successfully!");
      }
      setActiveForm(null);
      setIsEditing(false);
      refresh();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleViewResponses = async (form) => {
    try {
      const data = await getUDFResponses(form._id);
      setResponses(data);
      setViewerForm(form);
    } catch (error) {
      alert("Error fetching responses");
    }
  };

  if (loading) return <div>Loading...</div>;

  // ✅ Use builder when editing existing forms
  if (activeForm && isEditing) {
    return (
      <UDFBuilder
        existingForm={activeForm}  // ✅ Pre-fill builder with form data
        onSubmit={handleSubmit}
        onCancel={() => {
          setActiveForm(null);
          setIsEditing(false);
        }}
      />
    );
  }

  // ✅ Use form renderer when just filling data
  if (activeForm && !isEditing) {
    return (
      <UDFFormRenderer
  form={activeForm}
  onSubmit={(data) => handleResponseSubmit(activeForm._id, data)}  // ✅ Correct handler
  isEditing={false}
/>
    );
  }

  if (viewerForm) {
    return (
      <DynamicResponsesViewer
        form={viewerForm}
        formId={viewerForm._id}
        responses={responses}
        onClose={() => setViewerForm(null)}
      />
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h3>Saved UDF Forms</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {forms.length === 0 && <div>No forms yet.</div>}
        {forms.map((f) => (
          <div key={f._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{f.name || "Untitled Form"}</strong>
                {f.description && <div style={{ opacity: 0.7 }}>{f.description}</div>}
                <small>{(f.fields || []).length} field(s)</small>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleOpenForm(f)}>Open</button>
                <button onClick={() => handleEditForm(f)}>Edit</button>
                <button onClick={() => handleViewResponses(f)}>View Responses</button>
                <button onClick={() => remove(f._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
