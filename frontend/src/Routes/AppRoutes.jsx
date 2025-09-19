import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthRoutes from "./AuthRoutes";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";

export default function AppRoutes() {
  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/*" element={<AuthRoutes />} />
          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
