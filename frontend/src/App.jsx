import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UDFFormRenderer from "./Components/UDF/UDFFormRenderer";
import SavedUDFForms from "./Components/UDF/SavedUDFForms";
import { useParams } from "react-router-dom";

// Lazy load components
const PersonalForm = lazy(() => import("./Components/PersonalForm"));
const Dashboard = lazy(() => import("./Components/Dashboard"));
const LoginForm = lazy(() => import("./Components/LoginForm"));
const RegisterForm = lazy(() => import("./Components/RegisterForm"));
const AdminDashboard = lazy(() => import("./Components/AdminDashboard"));
const Layout = lazy(() => import("./Components/Layout")); 
const FormFieldTable = lazy(() => import("./Components/UDF/FormFieldTable"));

// Wrappers to extract formId from URL
function FormFieldTableWrapper() {
  const { formId } = useParams();
  return <FormFieldTable formId={formId} />;
}

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
            <Route path="/create-form" element={<FormFieldTable />} />
            <Route path="/udf/forms" element={<SavedUDFForms />} />
            <Route path="/udf/edit/:formId" element={<FormFieldTableWrapper />} />
            <Route path="/udf/fill/:formId" element={<UDFFormRendererWrapper />} />
          </Route>
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
