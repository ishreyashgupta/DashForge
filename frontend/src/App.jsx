import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Critical UDF component (kept eagerly loaded if used often)
import SavedUDFForms from "./Pages/Admin/Dashboard/UDF/SavedUDFForms";
import Profile from "./Pages/User/Dashboard/Profile";

// Lazy-loaded components
const DashboardWrapper = lazy(() => import("./Helper/DashboardWrapper"));
const LoginForm = lazy(() => import("./Pages/LoginPage/LoginPage"));
const RegisterForm = lazy(() => import("./Pages/RegisterPage/RegisterPage"));
const Layout = lazy(() => import("./Components/Common/Layout"));
const UDFBuilder = lazy(() => import("./Pages/Admin/Dashboard/UDF/UDFBuilder"));
const UserFormRenderer = lazy(() => import("./Pages/User/UserFormRenderer"));

// ✅ New admin-related lazy imports
const AdminDashboard = lazy(() => import("./Pages/Admin/Dashboard/AdminDashboard"));
const AssignFormSection = lazy(() => import("./Pages/Admin/Dashboard/AssignFormSection"));
const ResponsesSection = lazy(() => import("./Pages/Admin/Dashboard/ResponsesSection"));
const SendMailSection = lazy(() => import("./Pages/Admin/Dashboard/SendMailSection"));

function App() {
  return (
    <div>
      <Suspense fallback={<p style={{ textAlign: "center", marginTop: "20%" }}>Loading...</p>}>
        <Routes>
          {/* ---------- Public Routes ---------- */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* ---------- Protected Routes with Layout ---------- */}
          <Route element={<Layout />}>
            {/* User routes */}
            <Route path="/dashboard" element={<DashboardWrapper />} />
            <Route path="/form" element={<UserFormRenderer />} />
            <Route path="/create-form" element={<UDFBuilder />} />
            <Route path="/udf/forms" element={<SavedUDFForms />} />
            <Route path="/udf/fill/:formId" element={<DashboardWrapper />} />
             <Route path="/profile" element={<Profile />} />

            {/* ---------- Admin Dashboard Routes ---------- */}
            <Route path="/admin/dashboard" element={<AdminDashboard />}>
  <Route index element={<SavedUDFForms />} /> {/* Default: Manage Forms */}
  <Route path="create-form" element={<UDFBuilder />} />
  <Route path="assign-form" element={<AssignFormSection />} />
  <Route path="responses" element={<ResponsesSection />} />
  <Route path="send-mail" element={<SendMailSection />} />
</Route>

          </Route>
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
