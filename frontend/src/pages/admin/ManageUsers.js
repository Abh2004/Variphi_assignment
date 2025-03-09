// src/pages/admin/ManageUsers.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" component="h1" className="mb-4">
        Manage Users
      </Typography>
      
      <Typography paragraph>
        User management is currently under maintenance.
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={() => navigate('/admin')}
        className="mt-4"
      >
        Back to Admin Dashboard
      </Button>
    </Box>
  );
};

export default ManageUsers;