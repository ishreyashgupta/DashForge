import React, { lazy, Suspense } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// UDF components (non-lazy loaded because they are critical)
import UDFFormRenderer from "./Components/UDF/UDFFormRenderer";
import SavedUDFForms from "./Components/UDF/SavedUDFForms";

// Lazy load components
const PersonalForm = lazy(() => import("./Components/PersonalForm"));
const Dashboard = lazy(() => import("./Components/Dashboard"));
const LoginForm = lazy(() => import("./Components/LoginForm"));
const RegisterForm = lazy(() => import("./Components/RegisterForm"));
const AdminDashboard = lazy(() => import("./Components/AdminDashboard"));
const Layout = lazy(() => import("./Components/Layout"));
const UDFBuilder = lazy(() => import("./Components/UDF/UDFBuilder"));

// Wrapper for rendering forms dynamically
function UDFFormRendererWrapper() {
  const { formId } = useParams();
  return <UDFFormRenderer formId={formId} />;
}

function App() {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/form" element={<PersonalForm />} />
            <Route path="/form/:formId" element={<PersonalForm />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

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
