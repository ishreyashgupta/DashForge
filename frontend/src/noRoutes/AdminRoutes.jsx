import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const AdminDashboard = lazy(() => import("../Pages/Admin/Dashboard/AdminDashboard"));
const UDFBuilder = lazy(() => import("../components/admin/udf/UDFBuilder"));
const SavedUDFForms = lazy(() => import("../components/admin/udf/SavedUDFForms"));

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * AdminRoutes component
 * This component renders routes for the admin dashboard, creating new UDF forms and viewing saved UDF forms.
 * @returns {JSX.Element} - The rendered component
/*******  0679567f-fb63-4d89-adcb-96b789648447  *******/
export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/forms/create" element={<UDFBuilder />} />
      <Route path="/forms/saved" element={<SavedUDFForms />} />
    </Routes>
  );
}
