// src/pages/student/ViewAssignment.js
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAssignmentById } from '../../store/slices/assignmentSlice';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Card, CardContent, Divider, Chip, Grid
} from '@mui/material';
import {
  AssignmentTurnedIn as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { ASSIGNMENT_STATUS, API_URL } from '../../config';
import CommentSection from '../../components/comments/CommentSection';

const ViewAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentAssignment, loading, error } = useSelector(state => state.assignments);
  
  // Fetch assignment data when component mounts
  useEffect(() => {
    dispatch(getAssignmentById(id));
  }, [dispatch, id]);
  
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
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading && !currentAssignment) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        {error}
      </Alert>
    );
  }
  
  if (!currentAssignment) {
    return (
      <Alert severity="info" className="mb-4">
        Assignment not found
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Assignment Details
        </Typography>
        
        <Button
          variant="outlined"
          onClick={() => navigate('/assignments')}
        >
          Back to Assignments
        </Button>
      </Box>
      
      <Card className="mb-6">
        <CardContent>
          <Box className="flex justify-between items-start">
            <Box className="flex items-center">
              <AssignmentIcon fontSize="large" className="text-blue-500 mr-3" />
              <Box>
                <Typography variant="h5" className="font-bold">
                  {currentAssignment.title}
                </Typography>
                <Box className="flex items-center mt-1">
                  <Chip 
                    label={currentAssignment.status} 
                    size="small" 
                    color={getStatusColor(currentAssignment.status)} 
                    className="mr-2"
                  />
                  <Typography variant="body2" color="textSecondary">
                    Submitted on {formatDate(currentAssignment.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Divider className="my-4" />
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} className="p-4">
                <Typography variant="h6" className="font-bold mb-2">
                  Assignment Information
                </Typography>
                
                <Box className="mb-2">
                  <Typography variant="subtitle2" color="textSecondary">
                    Subject
                  </Typography>
                  <Typography variant="body1" className="flex items-center">
                    <SchoolIcon fontSize="small" className="mr-1 text-gray-500" />
                    {currentAssignment.subject.name}
                  </Typography>
                </Box>
                
                <Box className="mb-2">
                  <Typography variant="subtitle2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {currentAssignment.description || "No description provided"}
                  </Typography>
                </Box>
                
                {currentAssignment.submission_text && (
                  <Box className="mb-2">
                    <Typography variant="subtitle2" color="textSecondary">
                      Your Submission
                    </Typography>
                    <Paper className="p-3 bg-gray-50" variant="outlined">
                      <Typography variant="body2">
                        {currentAssignment.submission_text}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {currentAssignment.file_path && (
                  <Box className="mt-4">
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={`${API_URL}/${currentAssignment.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Your Submission
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={1} className="p-4">
                <Typography variant="h6" className="font-bold mb-2">
                  Review Status
                </Typography>
                // Continuing from where we left off in src/pages/student/ViewAssignment.js

                <Box className="mb-3">
                  <Typography variant="subtitle2" color="textSecondary">
                    Tutor
                  </Typography>
                  {currentAssignment.tutor ? (
                    <Box className="flex items-center">
                      <PersonIcon fontSize="small" className="mr-1 text-gray-500" />
                      <Typography variant="body1">
                        {currentAssignment.tutor.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="textSecondary" className="italic">
                      Not assigned yet
                    </Typography>
                  )}
                </Box>
                
                <Box className="mb-3">
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    {currentAssignment.status === ASSIGNMENT_STATUS.SUBMITTED && "Awaiting tutor assignment"}
                    {currentAssignment.status === ASSIGNMENT_STATUS.ASSIGNED && "Assigned to tutor, awaiting review"}
                    {currentAssignment.status === ASSIGNMENT_STATUS.IN_PROGRESS && "Tutor is reviewing your assignment"}
                    {currentAssignment.status === ASSIGNMENT_STATUS.COMPLETED && "Review completed, awaiting final delivery"}
                    {currentAssignment.status === ASSIGNMENT_STATUS.RETURNED && "Assignment returned with feedback"}
                  </Typography>
                </Box>
                
                {currentAssignment.solution_file_path && (
                  <Box className="mt-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Tutor's Solution
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      href={`${API_URL}/${currentAssignment.solution_file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 bg-blue-700 hover:bg-blue-800"
                    >
                      Download Solution
                    </Button>
                  </Box>
                )}
                
                {currentAssignment.returned_at && (
                  <Box className="mt-3">
                    <Typography variant="subtitle2" color="textSecondary">
                      Returned on
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(currentAssignment.returned_at)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Comments Section */}
      <Paper elevation={2} className="p-4 mb-6">
        <Box className="flex items-center mb-4">
          <CommentIcon className="text-blue-500 mr-2" />
          <Typography variant="h6" className="font-bold">
            Comments
          </Typography>
        </Box>
        
        <CommentSection assignmentId={id} />
      </Paper>
    </Box>
  );
};

export default ViewAssignment;