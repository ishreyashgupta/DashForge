import { Link, useNavigate } from "react-router-dom";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(role === "admin");
  }, [role]);

  const handleLogout = () => {
    logout(); // clears user + localStorage
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

        {/* ===== Center: Nav Links (visible only when logged in) ===== */}
        {token && (
          <Stack direction="row" spacing={2}>
            <Button component={Link} to="/dashboard" sx={{ color: "white" }}>
              Dashboard
            </Button>
            <Button component={Link} to="/form" sx={{ color: "white" }}>
              Forms
            </Button>
            {isAdmin && (
              <Button
                component={Link}
                to="/admin-dashboard"
                sx={{ color: "white" }}
              >
                Admin Panel
              </Button>
            )}
          </Stack>
        )}

        {/* ===== Right: Auth/User Section ===== */}
        <Box>
          {token ? (
            <Stack direction="row" spacing={2}>
              <Button component={Link} to="/profile" sx={{ color: "white" }}>
                Profile
              </Button>
              {!isAdmin && (
                <Button component={Link} to="/user" sx={{ color: "white" }}>
                  User
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="contained"
                color="error"
                sx={{ fontWeight: "bold" }}
              >
                Logout
              </Button>
            </Stack>
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
