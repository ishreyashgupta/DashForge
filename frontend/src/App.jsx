import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🔹 Eagerly loaded components (used frequently)
import ManageUDFForms from "./Pages/Admin/Dashboard/UDF/ManageUDFForms";
import Profile from "./Pages/User/Dashboard/Profile";

// 🔹 Lazy-loaded components
const DashboardWrapper = lazy(() => import("./Helper/DashboardWrapper"));
const LoginForm = lazy(() => import("./Pages/LoginPage/LoginPage"));
const RegisterForm = lazy(() => import("./Pages/RegisterPage/RegisterPage"));
const Layout = lazy(() => import("./Components/Common/Layout"));
const UDFBuilder = lazy(() => import("./Pages/Admin/Dashboard/UDF/UDFBuilder"));
const UDFFormRenderer = lazy(() => import("./Pages/Admin/Dashboard/UDF/UDFFormRenderer"));
const AdminDashboard = lazy(() => import("./Pages/Admin/Dashboard/AdminDashboard"));
const AssignFormSection = lazy(() => import("./Pages/Admin/Dashboard/AssignFormSection"));
const ResponsesSection = lazy(() => import("./Pages/Admin/Dashboard/ResponsesSection"));
const SendMailSection = lazy(() => import("./Pages/Admin/Dashboard/SendMailSection"));

// 🔹 Optional: Loading component (instead of plain text)
function LoadingFallback() {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "20%",
        fontSize: "1.2rem",
        fontWeight: 500,
      }}
    >
      Loading...
    </div>
  );
}

function App() {
  return (
    <div>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>

          {/* ---------- Public Routes ---------- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* ---------- Protected Routes ---------- */}
          <Route element={<Layout />}>
            {/* User routes */}
            <Route path="/dashboard" element={<DashboardWrapper />} />
            <Route path="/form" element={<UDFFormRenderer />} />
            <Route path="/create-form" element={<UDFBuilder />} />
            <Route path="/udf/forms" element={<ManageUDFForms />} />
            <Route path="/udf/fill/:formId" element={<DashboardWrapper />} />
            <Route path="/profile" element={<Profile />} />

            {/* ---------- Admin Dashboard Routes ---------- */}
            <Route path="/admin/dashboard" element={<AdminDashboard />}>
              <Route index element={<ManageUDFForms />} /> {/* default tab */}
              <Route path="create-form" element={<UDFBuilder />} />
              <Route path="assign-form" element={<AssignFormSection />} />
              <Route path="responses" element={<ResponsesSection />} />
              <Route path="send-mail" element={<SendMailSection />} />
            </Route>
          </Route>

          {/* ---------- Fallback Route ---------- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
