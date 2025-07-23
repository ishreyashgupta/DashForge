import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaVenusMars, FaHeart, FaMapMarkerAlt, FaAddressCard } from "react-icons/fa";
import "../styles/ViewFormModal.css";

const ViewFormModal = ({ form, onClose }) => {
  if (!form) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
<h2 align="center">Form Details</h2>
        <div className="modal-body">
          <table>
            <tbody>
              <tr>
                <td><FaUser /> <strong>First Name:</strong></td>
                <td>{form.firstName}</td>
              </tr>
              <tr>
                <td><FaUser /> <strong>Last Name:</strong></td>
                <td>{form.lastName}</td>
              </tr>
              <tr>
                <td><FaEnvelope /> <strong>Email:</strong></td>
                <td>{form.userId?.email || form.email || "N/A"}</td>
              </tr>
              <tr>
                <td><FaPhone /> <strong>Mobile:</strong></td>
                <td>{form.mobile}</td>
              </tr>
              <tr>
                <td><FaVenusMars /> <strong>Gender:</strong></td>
                <td>{form.gender}</td>
              </tr>
              <tr>
                <td><FaHeart /> <strong>Marital Status:</strong></td>
                <td>{form.maritalStatus}</td>
              </tr>
              <tr>
                <td><FaMapMarkerAlt /> <strong>Communication Address:</strong></td>
                <td>
                  {form.communicationAddress?.line1}, {form.communicationAddress?.line2}<br />
                  {form.communicationAddress?.city} - {form.communicationAddress?.pincode}, {form.communicationAddress?.state}
                </td>
              </tr>
              <tr>
                <td><FaAddressCard /> <strong>Present Address:</strong></td>
                <td>
                  {form.presentAddress?.line1}, {form.presentAddress?.line2}<br />
                  {form.presentAddress?.city} - {form.presentAddress?.pincode}, {form.presentAddress?.state}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
       
      </div>
    </div>
  );
};

export default ViewFormModal;
