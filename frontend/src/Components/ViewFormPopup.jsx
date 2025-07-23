// src/components/ViewFormPopup.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const ViewFormPopup = ({ form, onClose }) => {
  const popupRef = useRef(null);
  const [container, setContainer] = useState(null);

  useEffect(() => {
    const popup = window.open(
      "",
      "_blank",
      "width=600,height=600,left=200,top=200"
    );

    if (popup) {
      popup.document.title = "Form Details";
      const div = popup.document.createElement("div");
      popup.document.body.appendChild(div);
      popupRef.current = popup;
      setContainer(div);

      const handleBeforeUnload = () => {
        onClose();
      };

      popup.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        popup.removeEventListener("beforeunload", handleBeforeUnload);
        popup.close();
      };
    } else {
      alert("Popup blocked. Please allow popups for this site.");
      onClose();
    }
  }, []);

  if (!container || !form) return null;

  return ReactDOM.createPortal(
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h2>Form Details</h2>
      <p><strong>First Name:</strong> {form.firstName}</p>
      <p><strong>Last Name:</strong> {form.lastName}</p>
      <p><strong>Email:</strong> {form.userId?.email}</p>
      <p><strong>Mobile:</strong> {form.mobile}</p>
      <p><strong>Gender:</strong> {form.gender}</p>
      <p><strong>Marital Status:</strong> {form.maritalStatus}</p>
      <p><strong>Communication Address:</strong> {JSON.stringify(form.communicationAddress)}</p>
      <p><strong>Present Address:</strong> {JSON.stringify(form.presentAddress)}</p>
    </div>,
    container
  );
};

export default ViewFormPopup;
