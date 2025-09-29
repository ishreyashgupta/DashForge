import React from "react";
import useAuth from "../hooks/useAuth";
import UserDashboard from "../Pages/User/Dashboard/UserDashboard";
import AdminDashboard from "../Pages/Admin/Dashboard/AdminDashboard";

export default function DashboardWrapper() {
  const { role } = useAuth();

  if (!role) {
    return <p>Loading...</p>; 
    // or use <Navigate to="/login" replace /> if you want
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "user") {
    return <UserDashboard />;
  }

  return <p>Unauthorized</p>;
}
