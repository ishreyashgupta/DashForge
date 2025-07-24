import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load components
const PersonalForm = lazy(() => import("./Components/PersonalForm"));
const Dashboard = lazy(() => import("./Components/Dashboard"));
const LoginForm = lazy(() => import("./Components/LoginForm"));
const RegisterForm = lazy(() => import("./Components/RegisterForm"));
const AdminDashboard = lazy(() => import("./Components/AdminDashboard"));
const Layout = lazy(() => import("./Components/Layout")); // ✅ new layout

// Import the new components
const FormBuilder = lazy(() => import("./Components/FormBuilder/FormBuilder"));
const MyForms = lazy(() => import("./Components/FormBuilder/MyForms"));
const DynamicForm = lazy(() => import("./Components/FormBuilder/DynamicForm"));
const ResponseViewer = lazy(() => import("./Components/FormBuilder/ResponseViewer")
);
const EditFormTemplate = lazy(() => import("./Components/FormBuilder/EditFormTemplate"));

// frontend/src/App.jsx - Updated Routes
function App() {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Routes with Navbar Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* ====== PREBUILT PERSONAL FORM ROUTES ====== */}
            <Route path="/personal-form" element={<PersonalForm />} />
            <Route path="/personal-form/:formId" element={<PersonalForm />} />
            
            {/* ====== DYNAMIC FORM BUILDER ROUTES ====== */}
            <Route path="/form-builder" element={<FormBuilder />} />
            <Route path="/form-builder/edit/:templateId" element={<EditFormTemplate />} />
            <Route path="/my-forms" element={<MyForms />} />
            <Route path="/dynamic-form/:templateId" element={<DynamicForm />} />
            <Route path="/responses/:templateId" element={<ResponseViewer />} />
            
            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
