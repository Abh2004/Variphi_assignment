import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { 
  Container, Box, Typography, TextField, Button, 
  Link, Paper, Avatar, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { USER_ROLES } from '../../config';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.STUDENT,
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
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
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle registration submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      }))
        .unwrap()
        .then(() => {
          setSuccess(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        })
        .catch(() => {});
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
              <PersonAddOutlined />
            </Avatar>
            <Typography component="h1" variant="h5" className="mb-4">
              Sign up
            </Typography>
            
            {error && (
              <Alert severity="error" className="w-full mb-4">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" className="w-full mb-4">
                Registration successful! Redirecting to login...
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} className="w-full">
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={loading || success}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={loading || success}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={loading || success}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                disabled={loading || success}
              />
              <FormControl fullWidth margin="normal" disabled={loading || success}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                >
                  <MenuItem value={USER_ROLES.STUDENT}>Student</MenuItem>
                  <MenuItem value={USER_ROLES.TUTOR}>Tutor</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="mt-4 mb-2 bg-blue-700 hover:bg-blue-800"
                disabled={loading || success}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
              <Box className="flex justify-end mt-2">
                <Link component={RouterLink} to="/login" variant="body2">
                  {"Already have an account? Sign In"}
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;