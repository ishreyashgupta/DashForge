import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFormDetails, submitOrUpdateForm } from "../services/formService";
import { toast } from 'react-toastify';
import "../styles/Form.css";
function PersonalForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [errors ,setErrors] = useState({});

  const  validateStep1 =() => {
  const newErrors ={}

   if (!firstName.trim()) newErrors.firstName ="First Name is required ";
   if (!lastName.trim()) newErrors.lastName ="Late Name is required ";
   if (!mobile || mobile.length !== 10) newErrors.mobile ="Mobile number is required and should be 10 digits"
   if (!email.includes("@")) newErrors.email ="Email is required and should be valid";
   
   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
  }

  const [commAddress, setCommAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [sameAddress, setSameAddress] = useState(false);

  const [presentAddress, setPresentAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: "",
  });
  // Check token & prefill form in edit mode
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (isEditMode) {
      fetchFormDetails(token)
        .then((data) => {
          if (data.form) {
            const f = data.form;
            setFirstName(f.firstName);
            setLastName(f.lastName);
            setMobile(f.mobile);
            setGender(f.gender);
            setEmail(f.email);
            setMaritalStatus(f.maritalStatus);
            setCommAddress(f.communicationAddress);
            setPresentAddress(f.presentAddress);

            if (JSON.stringify(f.communicationAddress) === JSON.stringify(f.presentAddress)) {
              setSameAddress(true);
            }
          }
        })
        .catch((err) => console.error("Error fetching form:", err));
    }
  }, [navigate, isEditMode]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAddress(checked);
    if (checked) setPresentAddress({ ...commAddress });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      firstName,
      lastName,
      mobile,
      gender,
      email,
      maritalStatus,
      communicationAddress: commAddress,
      presentAddress: sameAddress ? commAddress : presentAddress,
    };

    try {
  const res = await submitOrUpdateForm(formData, localStorage.getItem("token"));

  if (res.ok) {
    toast.success(isEditMode ? "Form updated successfully!" : "Form submitted successfully!");
    navigate("/dashboard");
  } else {
    const result = await res.json();

    // Clean, user-friendly error handling
    if (result.errors) {
      // Show first error message if multiple errors
      const errorMessages = Object.values(result.errors).flat();
      toast.error(errorMessages[0] || "Validation failed. Please check your inputs.");
    } else {
      toast.error(result.message || "Validation failed. Please check your inputs.");
    }
  }
} catch (err) {
  console.error("Submission error:", err);
  toast.error("Something went wrong. Please try again.");
}

  };

  return (
    <div className="d-flex justify-content-center bg-light min-vh-100 py-4">

      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded shadow bg-white"
        style={{ width: "100%", maxWidth: "500px" }}
      >
        {step === 1 && (
          <>
            <h4 className="mb-3">{isEditMode ? "Edit Personal Details" : "Personal Details"}</h4>

            <div className="mb-3">
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              {errors.firstName && <div className="text-danger">{errors.firstName}</div>}
            </div>

            <div className="mb-3">
              <label>Last Name</label>
              <input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              {errors.lastName && <div className="text-danger">{errors.lastName}</div>}
            </div>

            <div className="mb-3">
              <label>Mobile</label>
              <input
                type="tel"
                className="form-control"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
              {errors.mobile && <div className="text-danger">{errors.mobile}</div>}
            </div>

            <div className="mb-3">
              <label>Gender</label>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  required
                />
                {errors.gender && <div className="text-danger">{errors.gender}</div>}
                <label>Male</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                />
                {errors.gender && <div className="text-danger">{errors.gender}</div>}             
                <label>Female</label>
              </div>
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <div className="text-danger">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label>Marital Status</label>
              <div className="form-check form-check-inline">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={maritalStatus === "Married"}
                  onChange={(e) => setMaritalStatus(e.target.checked ? "Married" : "")}
                />
                
                <label>Married</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={maritalStatus === "Single"}
                  onChange={(e) => setMaritalStatus(e.target.checked ? "Single" : "")}
                />
                <label>Single</label>
              </div>
            </div>

            <button type="button" 
            className="btn btn-primary"
             onClick =  {()=> {
              if(validateStep1()) setStep(2);
             }}>
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h4 className="mt-3 mb-3">Communication Address</h4>

            <div className="mb-3">
              <label>Address Line 1</label>
              <input
                type="text"
                className="form-control"
                value={commAddress.line1}
                onChange={(e) => setCommAddress({ ...commAddress, line1: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label>Address Line 2</label>
              <input
                type="text"
                className="form-control"
                value={commAddress.line2}
                onChange={(e) => setCommAddress({ ...commAddress, line2: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label>City</label>
              <input
                type="text"
                className="form-control"
                value={commAddress.city}
                onChange={(e) => setCommAddress({ ...commAddress, city: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label>Pincode</label>
              <input
                type="text"
                className="form-control"
                value={commAddress.pincode}
                onChange={(e) => setCommAddress({ ...commAddress, pincode: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label>State</label>
              <input
                type="text"
                className="form-control"
                value={commAddress.state}
                onChange={(e) => setCommAddress({ ...commAddress, state: e.target.value })}
                required
              />
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={sameAddress}
                onChange={handleCheckboxChange}
                id="sameAddress"
              />
              <label htmlFor="sameAddress">
                Is Present Address Same as Communication Address?
              </label>
            </div>

            {!sameAddress && (
              <>
                <h4 className="mb-3">Present Address</h4>

                <div className="mb-3">
                  <label>Address Line 1</label>
                  <input
                    type="text"
                    className="form-control"
                    value={presentAddress.line1}
                    onChange={(e) =>
                      setPresentAddress({ ...presentAddress, line1: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    className="form-control"
                    value={presentAddress.line2}
                    onChange={(e) =>
                      setPresentAddress({ ...presentAddress, line2: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={presentAddress.city}
                    onChange={(e) =>
                      setPresentAddress({ ...presentAddress, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={presentAddress.pincode}
                    onChange={(e) =>
                      setPresentAddress({ ...presentAddress, pincode: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={presentAddress.state}
                    onChange={(e) =>
                      setPresentAddress({ ...presentAddress, state: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                                 
           
           










             <button
  type="button"
  className="btn btn-secondary me-2"
  onClick={() => setStep(1)}
>
  Back
</button> 
            <button type="submit" className="btn btn-success">
              {isEditMode ? "Update Form" : "Submit Form"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default PersonalForm;
