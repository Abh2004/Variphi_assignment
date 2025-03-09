import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { 
  Container, Box, Typography, TextField, Button, 
  Link, Paper, Avatar, CircularProgress, Alert
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear errors when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle login submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }));
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <Paper elevation={3} className="p-6 w-full max-w-md">
          <Box className="flex flex-col items-center">
            <Avatar className="mb-2 bg-blue-700">
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5" className="mb-4">
              Sign in
            </Typography>
            
            {error && (
              <Alert severity="error" className="w-full mb-4">
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} className="w-full">
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="mt-4 mb-2 bg-blue-700 hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Box className="flex justify-end mt-2">
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;