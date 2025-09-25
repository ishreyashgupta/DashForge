import React, { lazy, Suspense } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// UDF components (critical, so not lazy-loaded)
import UDFFormRenderer from "./Components/UDF/UDFFormRenderer";
import SavedUDFForms from "./Components/UDF/SavedUDFForms";

// Lazy-loaded components
const PersonalForm = lazy(() => import("./Components/PersonalForm"));
const DashboardWrapper = lazy(() => import("./Components/DashboardWrapper")); // 👈 wrapper
const LoginForm = lazy(() => import("./Components/LoginForm"));
const RegisterForm = lazy(() => import("./Components/RegisterForm"));
const Layout = lazy(() => import("./Components/Layout"));
const UDFBuilder = lazy(() => import("./Components/UDF/UDFBuilder"));

// Wrapper for form renderer with dynamic :formId param
function UDFFormRendererWrapper() {
  const { formId } = useParams();
  return <UDFFormRenderer formId={formId} />;
}

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
            <Route path="/dashboard" element={<DashboardWrapper />} /> {/* 👈 role decides */}
            <Route path="/form" element={<PersonalForm />} />
            <Route path="/form/:formId" element={<PersonalForm />} />

            {/* UDF-related Routes */}
            <Route path="/create-form" element={<UDFBuilder />} />
            <Route path="/udf/forms" element={<SavedUDFForms />} />
            <Route path="/udf/fill/:formId" element={<UDFFormRendererWrapper />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
