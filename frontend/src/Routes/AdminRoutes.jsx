import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const AdminDashboard = lazy(() => import("../Pages/AdminDashboard"));
const UDFBuilder = lazy(() => import("../components/admin/udf/UDFBuilder"));
const SavedUDFForms = lazy(() => import("../components/admin/udf/SavedUDFForms"));

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/forms/create" element={<UDFBuilder />} />
      <Route path="/forms/saved" element={<SavedUDFForms />} />
    </Routes>
  );
}
