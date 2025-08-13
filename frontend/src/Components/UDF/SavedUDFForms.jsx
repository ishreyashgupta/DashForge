import React, { useState, useEffect } from "react";
import { getAllUDFForms } from "../../services/udfservice"; // UDF API service
import { useNavigate } from "react-router-dom";

function SavedUDFForms() {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllUDFForms()
      .then((data) => setForms(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Saved UDF Forms</h2>
      {forms.length === 0 ? (
        <p>No forms available.</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Form Name</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form._id}>
                <td>{form.name}</td>
                <td>{form.createdBy || "-"}</td>
                <td>
                  <button onClick={() => navigate(`/udf/edit/${form._id}`)}>
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/udf/fill/${form._id}`)}
                    style={{ marginLeft: "10px" }}
                  >
                    Fill Form
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SavedUDFForms;
