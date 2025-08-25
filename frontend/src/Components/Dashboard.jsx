import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";
import ViewFormModal from "../components/ViewFormModal";
import "../styles/Dashboard.css";
import UDFBuilder from "./UDF/UDFBuilder";
function Dashboard() {
  const { token, name, email } = useAuth(); // ✅ use your custom hook
  const [formFilled, setFormFilled] = useState(false);
  const [formDetails, setFormDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Check if form already submitted
    fetch("http://localhost:5000/api/form/check-form", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    localStorage.removeItem("user"); // ✅ clear consistent key
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleEditForm = () => {
    navigate("/form?edit=true");
  };

  const handleDeleteForm = () => {
    fetch("http://localhost:5000/api/form/delete-form", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Form deleted successfully");
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

  const handleShowDetails = () => {
    fetch("http://localhost:5000/api/form/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
<button
  onClick={() => navigate("/create-form")}
  style={{
    margin: "10px",
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Create New Form
</button>

<button
          onClick={() => navigate("/udf/forms")}
          style={{ marginLeft: "10px" }}
        >
          View UDF Forms
        </button>

        
          {!formFilled ? (
            <button onClick={() => navigate("/form")}>Fill the Form</button>
          ) : (
            <>
              <button onClick={handleEditForm} style={{ margin: "10px" }}>
                Edit Form
              </button>
              <button
                onClick={handleDeleteForm}
                style={{
                  margin: "10px",
                  backgroundColor: "red",
                  color: "white",
                }}
              >
                Delete Form
              </button>
              <button
                onClick={handleShowDetails}
                style={{
                  margin: "10px",
                  backgroundColor: "green",
                  color: "white",
                }}
              >
                Show My Details
              </button>
            </>
          )}

          <br />
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
