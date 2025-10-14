import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function UserFormRenderer() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return setError("No token provided");

    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/udf/fill?token=${token}`);
        setFormData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [token]);

  if (loading) return <div>Loading form...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>{formData?.title}</h2>
      {/* Render form fields dynamically */}
      {formData?.fields?.map((field, idx) => (
        <div key={idx}>
          <label>{field.label}</label>
          {field.type === "text" && <input type="text" name={field.name} />}
          {field.type === "textarea" && <textarea name={field.name}></textarea>}
          {/* add more field types as needed */}
        </div>
      ))}
      <button>Submit</button>
    </div>
  );
}

export default UserFormRenderer;
