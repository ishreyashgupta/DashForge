import React, { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const AdminDashboard = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (role !== "admin") navigate("/dashboard");
  }, [role, navigate]);

  return (
    <Box p={3}>
      {/* Just render nested routes — content changes when navbar tab is clicked */}
      <Outlet />
    </Box>
  );
};

export default AdminDashboard;
