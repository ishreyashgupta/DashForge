import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { AppBar, Toolbar, Typography, Button, Stack, Box } from "@mui/material";

function Navbar() {
  const { token, role, setToken, setRole } = useAuth(); // make sure your hook gives setToken/setRole
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(role === "admin");
  }, [role]);

  // Logout function defined inside Navbar
  const handleLogout = () => {
    // Clear token and role
    if (setToken) setToken(null);
    if (setRole) setRole(null);

    // Clear localStorage if used
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ background: "linear-gradient(90deg,#4b6cb7 0%,#182848 100%)" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ textDecoration: "none", color: "white", fontWeight: "bold" }}
        >
          Dashforge
        </Typography>

        {/* Center Links */}
        <Stack direction="row" spacing={2}>
          {token && <Button component={Link} to="/dashboard" sx={{ color: "white" }}>Dashboard</Button>}
          {token && <Button component={Link} to="/form" sx={{ color: "white" }}>Form</Button>}
          {isAdmin && <Button component={Link} to="/admin-dashboard" sx={{ color: "white" }}>Admin Panel</Button>}
        </Stack>

        {/* Right Stack: Profile/User + Logout */}
        {token && (
          <Box sx={{ marginLeft: "auto" }}>
            <Stack direction="row" spacing={2}>
              <Button component={Link} to="/profile" sx={{ color: "white" }}>Profile</Button>
              <Button component={Link} to="/user" sx={{ color: "white" }}>User</Button>
              <Button onClick={handleLogout} variant="contained" color="error">Logout</Button>
            </Stack>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
