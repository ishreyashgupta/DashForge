import React, { lazy, Suspense } from "react";
import { Routes, Route,  } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// UDF components (critical)
import SavedUDFForms from "././Pages/Admin/Dashboard/UDF/SavedUDFForms";

// Lazy-loaded components
const DashboardWrapper = lazy(() => import("./Helper/DashboardWrapper"));
const LoginForm = lazy(() => import("./Components/LoginForm"));
const RegisterForm = lazy(() => import("././Pages/RegisterPage/RegisterPage"));
const Layout = lazy(() => import("./Components/Common/Layout"));
const UDFBuilder = lazy(() => import("././Pages/Admin/Dashboard/UDF/UDFBuilder"));
const UserFormRenderer = lazy(() => import("./Pages/User/UserFormRenderer")); // ← New

function App() {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          {/* ---------- Public Routes ---------- */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* ---------- Protected Routes with Layout ---------- */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardWrapper />} />

            {/* Route to handle /form?token=xxx and redirect to dashboard */}
            <Route path="/form" element={<UserFormRenderer />} />

            {/* UDF-related Routes */}
            <Route path="/create-form" element={<UDFBuilder />} />
            <Route path="/udf/forms" element={<SavedUDFForms />} />
            <Route path="/udf/fill/:formId" element={<DashboardWrapper />} /> {/* Optional */}
          </Route>
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
