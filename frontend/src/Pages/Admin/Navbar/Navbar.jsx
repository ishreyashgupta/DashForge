import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

function Navbar() {
  const { token, role, logout } = useAuth(); // Added logout function
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!token);
    setIsAdmin(role === "admin");
  }, [token, role]);

  return (
    <AppBar position="static" color="default" sx={{ boxShadow: 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ textDecoration: "none", color: "inherit" }}
        >
          FormFlow
        </Typography>

        {/* Center Links */}
        <Stack direction="row" spacing={2}>
          {isLoggedIn && <Button component={Link} to="/dashboard">Dashboard</Button>}
          {isLoggedIn && <Button component={Link} to="/form">Form</Button>}
          {isAdmin && <Button component={Link} to="/admin-dashboard">Admin Panel</Button>}
        </Stack>

        {/* Right Profile/User Links + Logout */}
        {isLoggedIn && (
          <Stack direction="row" spacing={2}>
            <Button component={Link} to="/profile">Profile</Button>
            <Button component={Link} to="/user">User</Button>
            <Button 
              color="error" 
              variant="contained" 
              onClick={logout} 
            >
              Logout
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
