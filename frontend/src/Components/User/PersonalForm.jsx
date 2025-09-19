import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {  fetchFormDetails, submitForm , updateForm , } from "../services/formService";
import { toast } from 'react-toastify';
import "../styles/Form.css";
import useAuth from "../hooks/useAuth";
import { getFormByFormId, updateFormByFormId } from "../services/adminService"; // ✅ correct service for admin

import { useFormik } from 'formik';
import * as Yup from 'yup';

function PersonalForm() {
  const navigate = useNavigate();
  const {userId, role, token } = useAuth(); // ✅ get token
  const { formId } = useParams(); // <-- get formId from URL

  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const [step, setStep] = useState(1);
  const [sameAddress, setSameAddress] = useState(false);

  const [commAddress, setCommAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [presentAddress, setPresentAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: "",
  });

  // ✅ move form values to state
  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    gender: '',
    email: '',
    maritalStatus: '',
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true, // ✅ allow re-init on fetched data
    validationSchema: Yup.object({
      firstName: Yup.string().trim().required("First name is required"),
      lastName: Yup.string().trim().required("Last name is required"),
      mobile: Yup.string()
        .matches(/^\d{10}$/, "Mobile number must be 10 digits")
        .required("Mobile is required"),
      gender: Yup.string().required("Gender is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      maritalStatus: Yup.string(),
    }),
    onSubmit: async (values) => {
  const formData = {
    ...values,
    communicationAddress: commAddress,
    presentAddress: sameAddress ? commAddress : presentAddress,
  };

  console.log("📤 Submitting:", formData);
  console.log("🧑‍⚖️ Role:", role);
  if (role === "admin") console.log("🆔 formId:", formId || "(undefined)");

  try {
    if (role === "admin" && isEditMode) {
      if (!formId) {
        toast.error("Form ID missing for admin edit.");
        return;
      }

      const updated = await updateFormByFormId(formId, formData, token);
      console.log("✅ Admin updated form:", updated);
      toast.success("Admin updated the form successfully!");
      navigate("/admin-dashboard");

    } else if (isEditMode && role === "user") {
      const res = await updateForm(formData, token);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Update failed.");
      }
      toast.success("Form updated!");
      navigate("/dashboard");

    } else {
      const res = await submitForm(formData, token);
      if (!res.ok) {
        const error = await res.json();
        const errorMessages = Object.values(error.errors || {}).flat();
        toast.error(errorMessages[0] || error.message || "Submission failed.");
        return;
      }
      toast.success("Form submitted!");
      navigate("/dashboard");
    }

  } catch (err) {
    console.error("❌ Submission error:", err);
    toast.error(err.message || "Something went wrong. Please try again.");
  }
}

  });

 useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  if (isEditMode && role === "user") {
    fetchFormDetails(token)
      .then((data) => {
        const f = data.form;
        if (f) {
          setInitialValues({
            firstName: f.firstName || '',
            lastName: f.lastName || '',
            mobile: f.mobile || '',
            gender: f.gender || '',
            email: f.email || '',
            maritalStatus: f.maritalStatus || '',
          });

          setCommAddress(f.communicationAddress || defaultAddress());
          setPresentAddress(f.presentAddress || defaultAddress());

          if (JSON.stringify(f.communicationAddress) === JSON.stringify(f.presentAddress)) {
            setSameAddress(true);
          }
        } else {
          toast.info("No existing form found. Fill a new one.");
        }
      })
      .catch(() => toast.error("Failed to load your form."));
    return;
  }
// 🧠 Admin edit logic

  if (isEditMode && role === "admin") {
    if (!formId) {
      toast.error("Missing form ID for admin edit.");
      navigate("/admin-dashboard");
      return;
    }

    getFormByFormId(formId, token)
      .then((data) => {
        const f = data.form;
        const name = `${f.firstName || ""} ${f.lastName || ""}`.trim() || "Unknown User";
        console.log(`📄 Admin editing form: ${name}`);
        console.log("userId:", userId);
      toast.info(`Editing form for ${name}`);

        if (f.userId !== userId && role !== "admin") {
          toast.error("Unauthorized to edit this form.");
          navigate("/dashboard");
          return;
        }

        setInitialValues({
          firstName: f.firstName || '',
          lastName: f.lastName || '',
          mobile: f.mobile || '',
          gender: f.gender || '',
          email: f.email || '',
          maritalStatus: f.maritalStatus || '',
        });

        setCommAddress(f.communicationAddress || defaultAddress());
        setPresentAddress(f.presentAddress || defaultAddress());

        if (JSON.stringify(f.communicationAddress) === JSON.stringify(f.presentAddress)) {
          setSameAddress(true);
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching form:", err);
        toast.error(err.message || "Could not load form.");
        navigate("/dashboard");
      });
  }
}, [navigate, isEditMode, formId, token, role, userId]);

// 🧩 Optional helper
function defaultAddress() {
  return { line1: '', line2: '', city: '', pincode: '', state: '' };
}


  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAddress(checked);
    if (checked) setPresentAddress({ ...commAddress });
    console.log("🧾 formId:", formId);
console.log("🧑‍💻 role:", role);
console.log("🪪 userId:", userId);
console.log("🔐 token (trimmed):", token?.slice(0, 30) + "...");

  };

  return (
    <div className="d-flex justify-content-center bg-light min-vh-100 py-4">
      <form
        onSubmit={step === 1 ? formik.handleSubmit : undefined}
        className="p-4 border rounded shadow bg-white"
        style={{ width: "100%", maxWidth: "500px" }}
      >
        {step === 1 && (
          <>
            <h4 className="mb-3">{isEditMode ? "Edit Personal Details" : "Personal Details"}</h4>

            <div className="mb-3">
              <label>First Name</label>
              <input type="text" className="form-control" {...formik.getFieldProps("firstName")} />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="text-danger">{formik.errors.firstName}</div>
              )}
            </div>

            <div className="mb-3">
              <label>Last Name</label>
              <input type="text" className="form-control" {...formik.getFieldProps("lastName")} />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="text-danger">{formik.errors.lastName}</div>
              )}
            </div>

            <div className="mb-3">
              <label>Mobile</label>
              <input type="tel" className="form-control" {...formik.getFieldProps("mobile")} />
              {formik.touched.mobile && formik.errors.mobile && (
                <div className="text-danger">{formik.errors.mobile}</div>
              )}
            </div>

            <div className="mb-3">
              <label>Gender</label><br />
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  value="male"
                  checked={formik.values.gender === "male"}
                  onChange={formik.handleChange}
                />
                <label>Male</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  value="female"
                  checked={formik.values.gender === "female"}
                  onChange={formik.handleChange}
                />
                <label>Female</label>
              </div>
              {formik.touched.gender && formik.errors.gender && (
                <div className="text-danger">{formik.errors.gender}</div>
              )}
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input type="email" className="form-control" {...formik.getFieldProps("email")} />
              {formik.touched.email && formik.errors.email && (
                <div className="text-danger">{formik.errors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label>Marital Status</label><br />
              <div className="form-check form-check-inline">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={formik.values.maritalStatus === "Married"}
                  onChange={(e) => formik.setFieldValue("maritalStatus", e.target.checked ? "Married" : '')}
                />
                <label>Married</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={formik.values.maritalStatus === "Single"}
                  onChange={(e) => formik.setFieldValue("maritalStatus", e.target.checked ? "Single" : '')}
                />
                <label>Single</label>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                formik.validateForm().then((errors) => {
                  if (Object.keys(errors).length === 0) {
                    setStep(2);
                  } else {
                    formik.setTouched({
                      firstName: true,
                      lastName: true,
                      mobile: true,
                      gender: true,
                      email: true,
                    });
                  }
                });
              }}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h4 className="mb-3">Communication Address</h4>
            <div className="mb-3">
              <label>Address Line 1</label>
              <input type="text" className="form-control" value={commAddress.line1} onChange={(e) => setCommAddress({ ...commAddress, line1: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>Address Line 2</label>
              <input type="text" className="form-control" value={commAddress.line2} onChange={(e) => setCommAddress({ ...commAddress, line2: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>City</label>
              <input type="text" className="form-control" value={commAddress.city} onChange={(e) => setCommAddress({ ...commAddress, city: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>Pincode</label>
              <input type="text" className="form-control" value={commAddress.pincode} onChange={(e) => setCommAddress({ ...commAddress, pincode: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>State</label>
              <input type="text" className="form-control" value={commAddress.state} onChange={(e) => setCommAddress({ ...commAddress, state: e.target.value })} />
            </div>

            <div className="form-check mb-3">
              <input type="checkbox" className="form-check-input" checked={sameAddress} onChange={handleCheckboxChange} id="sameAddress" />
              <label htmlFor="sameAddress">Is Present Address Same as Communication Address?</label>
            </div>

            {!sameAddress && (
              <>
                <h4 className="mb-3">Present Address</h4>
                <div className="mb-3">
                  <label>Address Line 1</label>
                  <input type="text" className="form-control" value={presentAddress.line1} onChange={(e) => setPresentAddress({ ...presentAddress, line1: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label>Address Line 2</label>
                  <input type="text" className="form-control" value={presentAddress.line2} onChange={(e) => setPresentAddress({ ...presentAddress, line2: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label>City</label>
                  <input type="text" className="form-control" value={presentAddress.city} onChange={(e) => setPresentAddress({ ...presentAddress, city: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label>Pincode</label>
                  <input type="text" className="form-control" value={presentAddress.pincode} onChange={(e) => setPresentAddress({ ...presentAddress, pincode: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label>State</label>
                  <input type="text" className="form-control" value={presentAddress.state} onChange={(e) => setPresentAddress({ ...presentAddress, state: e.target.value })} />
                </div>
              </>
            )}

            <button type="button" className="btn btn-secondary me-2" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn btn-success" onClick={formik.handleSubmit}>{isEditMode ? "Update Form" : "Submit Form"}</button>
          </>
        )}
      </form>
    </div>
  );
}

export default PersonalForm;
