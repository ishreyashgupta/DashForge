// frontend/src/Components/Dashboard.jsx - Updated to use new routes
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";
import ViewFormModal from "../components/ViewFormModal";
import "../styles/Dashboard.css";

function Dashboard() {
  const { token, name, email } = useAuth();
  const [formFilled, setFormFilled] = useState(false);
  const [formDetails, setFormDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Check if personal form already submitted
    fetch("http://localhost:5000/api/form/check-form", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormFilled(data.formFilled);
      })
      .catch((err) => {
        console.error("Form check error:", err);
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleEditPersonalForm = () => {
    navigate("/personal-form?edit=true"); // ✅ Personal form route
  };

  const handleDeletePersonalForm = () => {
    fetch("http://localhost:5000/api/form/delete-form", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Personal form deleted successfully");
          setFormFilled(false);
          setFormDetails(null);
        } else {
          toast.error("Failed to delete form");
        }
      })
      .catch(() => {
        console.error("Error deleting form");
        toast.error("Failed to delete form");
      });
  };

  const handleShowPersonalDetails = () => {
    fetch("http://localhost:5000/api/form/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormDetails(data);
          toast.success("Form details fetched successfully!");
        } else {
          toast.error("No form data found");
        }
      })
      .catch((err) => {
        console.error("Error fetching form details:", err);
        toast.error("Error fetching form data");
      });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Dashboard</h1>
      {name ? (
        <div>
          <p>Welcome, {name}</p>
          <p>Email: {email}</p>

          {/* ====== PERSONAL FORM SECTION ====== */}
          <div className="form-section">
            <h3>📋 Personal Information Form</h3>
            {!formFilled ? (
              <button 
                onClick={() => navigate("/personal-form")}
                className="btn btn-primary"
              >
                Fill Personal Form
              </button>
            ) : (
              <div className="form-actions">
                <button onClick={handleEditPersonalForm} className="btn btn-warning">
                  Edit Personal Form
                </button>
                <button onClick={handleDeletePersonalForm} className="btn btn-danger">
                  Delete Personal Form
                </button>
                <button onClick={handleShowPersonalDetails} className="btn btn-success">
                  Show Personal Details
                </button>
              </div>
            )}
          </div>

          {/* ====== FORM BUILDER SECTION ====== */}
          <div className="form-section">
            <h3>🛠️ Form Builder</h3>
            <div className="form-builder-actions">
              <button 
                onClick={() => navigate("/form-builder")}
                className="btn btn-primary"
              >
                Create New Form
              </button>
              <button 
                onClick={() => navigate("/my-forms")}
                className="btn btn-secondary"
              >
                My Created Forms
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              padding: "10px 15px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              zIndex: 999,
            }}
          >
            Logout
          </button>

          {formDetails && (
            <ViewFormModal
              form={formDetails}
              onClose={() => setFormDetails(null)}
            />
          )}
        </div>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
}

export default Dashboard;
