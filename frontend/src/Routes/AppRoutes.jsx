import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthRoutes from "./AuthRoutes.jsx";
import UserRoutes from "./UserRoutes.jsx";
import AdminRoutes from "./AdminRoutes.jsx";

export default function AppRoutes() {
  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          {/* Redirect root "/" to /login */}
          <Route path="/" element={<Navigate to="login" replace />} />

          {/* Auth Routes */}
          <Route path="/*" element={<AuthRoutes />} />

          {/* User Routes */}
          <Route path="user/*" element={<UserRoutes />} />

          {/* Admin Routes */}
          <Route path="admin/*" element={<AdminRoutes />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
