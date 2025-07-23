import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load components
const PersonalForm = lazy(() => import("./Components/PersonalForm"));
const Dashboard = lazy(() => import("./Components/Dashboard"));
const LoginForm = lazy(() => import("./Components/LoginForm"));
const RegisterForm = lazy(() => import("./Components/RegisterForm"));
const AdminDashboard = lazy(() => import("./Components/AdminDashboard"));
const Layout = lazy(() => import("./Components/Layout")); // ✅ new layout

function App() {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          {/* Public Routes - no layout */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Routes with Navbar Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/form" element={<PersonalForm />} />
            <Route path="/form/:formId" element={<PersonalForm />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
