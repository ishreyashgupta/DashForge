import * as React from 'react';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";

// Material-UI imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

// --- Icons & Logo from your LOGIN page design ---
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const DashForgeIcon = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        mr: 1
      }}
    >
      DF
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
      DashForge
    </Typography>
  </Box>
);

// --- Styled Components from your LOGIN page design ---

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: '380px',
  padding: theme.spacing(2.5),
  gap: theme.spacing(1.5),
  margin: 'auto',
  transform: 'scale(0.8)',
  transformOrigin: 'center',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  borderRadius: '12px',
}));

const AuthContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(1),
  backgroundColor: '#ffffff', // White background from login page
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export default function RegisterForm() {
  // --- Your original state and logic (UNCHANGED) ---
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'name' && nameError) {
      setNameError(false);
      setNameErrorMessage('');
    }
    if (e.target.name === 'email' && emailError) {
      setEmailError(false);
      setEmailErrorMessage('');
    }
    if (e.target.name === 'password' && passwordError) {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
  };

  const validateInputs = () => {
    let isValid = true;
    if (!formData.name || formData.name.trim().length < 2) {
      setNameError(true);
      setNameErrorMessage('Name must be at least 2 characters long.');
      isValid = false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    }
    if (!formData.password || formData.password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.error("Registration failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    toast.info(`${provider} signup would be implemented here!`);
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <AuthContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <DashForgeIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ 
              width: '100%', 
              fontSize: '1.8rem',
              textAlign: 'center', 
              mb: 0.5,
              fontWeight: 'bold'
            }}
          >
            Create an Account
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary', 
              mb: 1.5 
            }}
          >
            Create your account to get started
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 1.5, // Reduced gap to match login page
            }}
          >
            <FormControl>
              <FormLabel htmlFor="name" sx={{ fontSize: '0.9rem' }}>Full Name</FormLabel>
              <TextField
                error={nameError}
                helperText={nameErrorMessage}
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                autoComplete="name"
                autoFocus
                required
                fullWidth
                variant="outlined"
                size="small" // Smaller input to match login page
                value={formData.name}
                onChange={handleChange}
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email" sx={{ fontSize: '0.9rem' }}>Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                fullWidth
                variant="outlined"
                size="small" // Smaller input
                value={formData.email}
                onChange={handleChange}
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password" sx={{ fontSize: '0.9rem' }}>Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                size="small" // Smaller input
                value={formData.password}
                onChange={handleChange}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ py: 1, mt: 0.5 }} // Styling from login page
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>
          <Divider sx={{ my: 0.5 }}>or</Divider> {/* Styling from login page */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}> {/* Reduced gap */}
            <Button
              fullWidth
              variant="outlined"
              size="small" // Smaller button
              onClick={() => handleSocialSignup('Google')}
              startIcon={<GoogleIcon />}
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small" // Smaller button
              onClick={() => handleSocialSignup('Facebook')}
              startIcon={<FacebookIcon />}
            >
              Sign up with Facebook
            </Button>
            <Typography sx={{ textAlign: 'center', mt: 1 }} variant="body2">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{ textDecoration: 'none', fontWeight: 'medium' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </AuthContainer>
    </>
  );
}