import { Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";

// Lazy-loaded pages/components
const UserDashboard = lazy(() => import("../Pages/User/Dashboard/UserDashboard"));
const PersonalForm = lazy(() => import("../Components/PersonalForm"));

export default function UserRoutes() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Index = /user/ */}
        <Route index element={<UserDashboard />} />

        {/* /user/forms */}
        <Route path="forms" element={<PersonalForm />} />

        {/* /user/forms/fill/:formId */}
        <Route path="forms/fill/:formId" element={<UDFFormRenderer />} />
      </Routes>
    </Suspense>
  );
}
