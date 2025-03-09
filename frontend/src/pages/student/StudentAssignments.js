// src/pages/student/StudentAssignments.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments } from '../../store/slices/assignmentSlice';
import { 
  Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert,
  Card, CardContent, CardActions, Button, Chip, Divider, Grid
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { ASSIGNMENT_STATUS } from '../../config';

const StudentAssignments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignments, loading, error } = useSelector(state => state.assignments);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch assignments when component mounts
  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);
  
  // Handle tab change
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter assignments based on tab
  const getFilteredAssignments = () => {
    if (!assignments) return [];
    
    switch (tabValue) {
      case 0: // All
        return assignments;
      case 1: // Pending
        return assignments.filter(a => 
          a.status === ASSIGNMENT_STATUS.SUBMITTED || 
          a.status === ASSIGNMENT_STATUS.ASSIGNED
        );
      case 2: // In Progress
        return assignments.filter(a => a.status === ASSIGNMENT_STATUS.IN_PROGRESS);
      case 3: // Completed
        return assignments.filter(a => 
          a.status === ASSIGNMENT_STATUS.COMPLETED || 
          a.status === ASSIGNMENT_STATUS.RETURNED
        );
      default:
        return assignments;
    }
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case ASSIGNMENT_STATUS.SUBMITTED:
        return 'primary';
      case ASSIGNMENT_STATUS.ASSIGNED:
        return 'info';
      case ASSIGNMENT_STATUS.IN_PROGRESS:
        return 'warning';
      case ASSIGNMENT_STATUS.COMPLETED:
        return 'success';
      case ASSIGNMENT_STATUS.RETURNED:
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const filteredAssignments = getFilteredAssignments();
  
  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          My Assignments
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/assignments/submit')}
          className="bg-blue-700 hover:bg-blue-800"
        >
          Submit New Assignment
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} className="mb-6">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box className="flex justify-center py-8">
          <CircularProgress />
        </Box>
      ) : filteredAssignments.length === 0 ? (
        <Box className="py-8 text-center">
          <Typography variant="body1" color="textSecondary">
            No assignments found. Submit a new assignment to get started!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/assignments/submit')}
            className="mt-4 bg-blue-700 hover:bg-blue-800"
          >
            Submit New Assignment
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAssignments.map((assignment) => (
            <Grid item xs={12} md={6} lg={4} key={assignment.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box className="flex items-center mb-2">
                    <AssessmentIcon className="text-blue-500 mr-2" />
                    <Typography variant="h6" noWrap>
                      {assignment.title}
                    </Typography>
                  </Box>
                  
                  <Divider className="mb-2" />
                  
                  <Box className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">
                      Subject:
                    </Typography>
                    <Typography variant="body2">
                      {assignment.subject.name}
                    </Typography>
                  </Box>
                  
                  <Box className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">
                      Tutor:
                    </Typography>
                    <Typography variant="body2">
                      {assignment.tutor ? assignment.tutor.name : 'Not assigned yet'}
                    </Typography>
                  </Box>
                  
                  <Box className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">
                      Submitted on:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(assignment.created_at)}
                    </Typography>
                  </Box>
                  
                  <Box className="flex justify-between mt-2">
                    <Typography variant="body2" color="textSecondary">
                      Status:
                    </Typography>
                    <Chip 
                      label={assignment.status} 
                      size="small" 
                      color={getStatusColor(assignment.status)} 
                    />
                  </Box>
                </CardContent>
                
                <CardActions className="bg-gray-50">
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/assignments/view/${assignment.id}`)}
                    color="primary"
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentAssignments;