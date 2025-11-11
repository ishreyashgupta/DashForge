import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { role, logout } = useAuth(); // ✅ only role + logout
  const navigate = useNavigate();
  const location = useLocation();

  const [links, setLinks] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  // --- Determine role-based navigation links ---
  useEffect(() => {
    switch (role) {
      case "admin":
        setLinks([
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Create Form", to: "/admin/dashboard/create-form" },
          { label: "Assign Form", to: "/admin/dashboard/assign-form" },
          { label: "Responses", to: "/admin/dashboard/responses" },
          { label: "Send Mail", to: "/admin/dashboard/send-mail" },
        ]);
        break;

      case "user":
        setLinks([
          { label: "My Forms", to: "/dashboard" },
          { label: "Profile", to: "/profile" },
        ]);
        break;

      default:
        setLinks([
          { label: "Login", to: "/login" },
          { label: "Register", to: "/register" },
        ]);
    }
  }, [role]);

  // --- Handle Logout ---
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // --- Handle Mobile Menu ---
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isLoggedIn = role === "admin" || role === "user";

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)",
        boxShadow: 3,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* ===== Left: Logo ===== */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
            letterSpacing: 1,
          }}
        >
          Dashforge
        </Typography>

        {/* ===== Center: Desktop Links ===== */}
        {isLoggedIn && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {links.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                sx={{
                  color:
                    location.pathname === link.to ? "cyan" : "white",
                  fontWeight:
                    location.pathname === link.to ? "bold" : "normal",
                  textTransform: "none",
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        )}

        {/* ===== Right: Auth Actions ===== */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              variant="contained"
              color="error"
              sx={{ fontWeight: "bold", textTransform: "none" }}
            >
              Logout
            </Button>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button component={Link} to="/login" sx={{ color: "white" }}>
                Login
              </Button>
              <Button component={Link} to="/register" sx={{ color: "white" }}>
                Register
              </Button>
            </Stack>
          )}
        </Box>

        {/* ===== Mobile Menu Icon ===== */}
        {isLoggedIn && (
          <IconButton
            color="inherit"
            edge="end"
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* ===== Mobile Dropdown ===== */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          {links.map((link) => (
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

          {isLoggedIn && (
            <MenuItem
              onClick={() => {
                handleLogout();
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              Logout
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
