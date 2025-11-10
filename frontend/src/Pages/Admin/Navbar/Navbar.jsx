import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import useAuth from "../hooks/useAuth";

function AdminNavbar() {
  const { token, role, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setIsAdmin(!!token && role === "admin");
  }, [token, role]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  if (!isAdmin) return null; // Hide Navbar if not admin

  const adminLinks = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Manage Forms", to: "/admin/dashboard" }, // default tab
    { label: "Create Form", to: "/admin/dashboard/create-form" },
    { label: "Assign Form", to: "/admin/dashboard/assign-form" },
    { label: "View Responses", to: "/admin/dashboard/responses" },
    { label: "Send Mail", to: "/admin/dashboard/send-mail" },
    { label: "Users", to: "/admin/users" },
    { label: "Settings", to: "/admin/setting" },
  ];

  return (
    <AppBar position="sticky" color="default" sx={{ boxShadow: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: Admin Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/admin/dashboard"
          sx={{
            textDecoration: "none",
            color: "primary.main",
            fontWeight: "bold",
          }}
        >
          FormFlow Admin
        </Typography>

        {/* Center: Desktop Links */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {adminLinks.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              color={
                location.pathname === link.to ? "primary" : "inherit"
              } // highlight active
              sx={{
                textTransform: "none",
                fontWeight: location.pathname === link.to ? "bold" : "normal",
                borderBottom:
                  location.pathname === link.to
                    ? "2px solid #1976d2"
                    : "2px solid transparent",
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Right: Profile + Logout */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button component={Link} to="/profile" color="inherit">
            Profile
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={logout}
            sx={{ textTransform: "none" }}
          >
            Logout
          </Button>
        </Box>

        {/* Mobile Menu Icon */}
        <IconButton
          color="inherit"
          edge="end"
          sx={{ display: { xs: "flex", md: "none" } }}
          onClick={handleMenuOpen}
        >
          <MenuIcon />
        </IconButton>

        {/* Mobile Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          {adminLinks.map((link) => (
            <MenuItem
              key={link.to}
              component={Link}
              to={link.to}
              onClick={handleMenuClose}
              selected={location.pathname === link.to}
            >
              {link.label}
            </MenuItem>
          ))}

          <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              logout();
              handleMenuClose();
            }}
            sx={{ color: "error.main" }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default AdminNavbar;
