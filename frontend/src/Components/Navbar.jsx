import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (!token) {
      setLinks([
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
      ]);
    } else if (role === "admin") {
      setLinks([
        { label: "Manage Forms", to: "/admin/manage-forms" },
        { label: "Create Form", to: "/admin/create-form" },
        { label: "Assign Form", to: "/admin/assign-form" },
        { label: "Responses", to: "/admin/responses" },
        { label: "Send Mail", to: "/admin/send-mail" },
      ]);
    } else {
      setLinks([
        { label: "User Dashboard", to: "/user" },
        { label: "Profile", to: "/profile" },
      ]);
    }
  }, [token, role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)",
        boxShadow: 2,
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

        {/* ===== Center: Role-Based Tabs ===== */}
        {token && (
          <Stack direction="row" spacing={2}>
            {links.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                sx={{
                  color:
                    location.pathname === link.to
                      ? "yellow"
                      : "white",
                  fontWeight:
                    location.pathname === link.to ? "bold" : "normal",
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        )}

        {/* ===== Right: Auth Actions ===== */}
        <Box>
          {token ? (
            <Button
              onClick={handleLogout}
              variant="contained"
              color="error"
              sx={{ fontWeight: "bold" }}
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
      </Toolbar>
    </AppBar>
  );
}
