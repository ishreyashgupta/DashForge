import { Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";

const UserDashboard = lazy(() => import("../Pages/UserDashboard"));
const PersonalForm = lazy(() => import("../Components/PersonalForm"));

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
      <Route path="/forms" element={<PersonalForm />} />
      <Route path="/forms/fill/:formId" element={<UDFFormRenderer />} />
    </Routes>
  );
}
