import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAssignmentById, assignTutor } from '../../store/slices/assignmentSlice';
import { fetchAllTutors } from '../../store/slices/userSlice';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Card, CardContent, Divider, Chip, Grid, FormControl,
  InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import {
  AssignmentTurnedIn as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
  PersonAdd as AssignIcon
} from '@mui/icons-material';
import { ASSIGNMENT_STATUS, API_URL } from '../../config';

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentAssignment, loading, error } = useSelector(state => state.assignments);
  const { tutors, loading: tutorsLoading } = useSelector(state => state.users);
  
  // Local state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [tutorsLoaded, setTutorsLoaded] = useState(false);
  
  // Fetch assignment data when component mounts
  useEffect(() => {
    dispatch(getAssignmentById(id));
  }, [dispatch, id]);
  
  // Handle open assign dialog - only fetch tutors when opening the dialog
// Only fetch tutors when opening the dialog and when needed
const handleOpenAssignDialog = () => {
    // Only fetch if we don't have tutors yet
    if (tutors.length === 0) {
      dispatch(fetchAllTutors());
    }
    
    setSelectedTutorId('');
    setAssignError('');
    setAssignSuccess(false);
    setAssignDialogOpen(true);
  };
  
  // Handle close assign dialog
  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
  };
  
  // Handle tutor selection change
  const handleTutorChange = (e) => {
    setSelectedTutorId(e.target.value);
    if (assignError) setAssignError('');
  };
  
  // Handle assign tutor
// In the handleAssignTutor function
const handleAssignTutor = () => {
    if (!selectedTutorId) {
      setAssignError('Please select a tutor');
      return;
    }
    
    console.log("Assigning tutor with ID:", selectedTutorId, "to assignment:", currentAssignment.id);
    
    dispatch(assignTutor({
      assignment_id: currentAssignment.id,
      tutor_id: selectedTutorId
    }))
      .unwrap()
      .then((response) => {
        console.log("Assignment successful:", response);
        setAssignSuccess(true);
        setTimeout(() => {
          handleCloseAssignDialog();
        }, 1500);
      })
      .catch((err) => {
        console.error("Assignment failed:", err);
        setAssignError(err || 'Failed to assign tutor');
      });
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
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
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
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
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
            
            {currentAssignment.status === ASSIGNMENT_STATUS.SUBMITTED && (
              <Button
                variant="contained"
                startIcon={<AssignIcon />}
                onClick={handleOpenAssignDialog}
                className="bg-blue-700 hover:bg-blue-800"
              >
                Assign to Tutor
              </Button>
            )}
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
                      Submission Text
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
                      Download Assignment File
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={1} className="p-4">
                <Typography variant="h6" className="font-bold mb-2">
                  People
                </Typography>
                
                <Box className="mb-3">
                  <Typography variant="subtitle2" color="textSecondary">
                    Student
                  </Typography>
                  <Box className="flex items-center">
                    <PersonIcon fontSize="small" className="mr-1 text-gray-500" />
                    <Typography variant="body1">
                      {currentAssignment.student.name} ({currentAssignment.student.email})
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tutor
                  </Typography>
                  {currentAssignment.tutor ? (
                    <Box className="flex items-center">
                      <PersonIcon fontSize="small" className="mr-1 text-gray-500" />
                      <Typography variant="body1">
                        {currentAssignment.tutor.name} ({currentAssignment.tutor.email})
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="textSecondary" className="italic">
                      Not assigned yet
                    </Typography>
                  )}
                </Box>
                
                {currentAssignment.solution_file_path && (
                  <Box className="mt-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Solution File
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={`${API_URL}/${currentAssignment.solution_file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1"
                    >
                      Download Solution
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Assign Tutor Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Tutor</DialogTitle>
        <Divider />
        <DialogContent>
          {assignSuccess ? (
            <Alert severity="success">
              Tutor assigned successfully!
            </Alert>
          ) : (
            <>
              {assignError && (
                <Alert severity="error" className="mb-4">
                  {assignError}
                </Alert>
              )}
              
              <FormControl fullWidth margin="normal" disabled={tutorsLoading}>
                <InputLabel id="tutor-label">Select Tutor</InputLabel>
                <Select
                  labelId="tutor-label"
                  value={selectedTutorId}
                  label="Select Tutor"
                  onChange={handleTutorChange}
                >
                  {tutors.map(tutor => (
                    <MenuItem key={tutor.id} value={tutor.id}>
                      {tutor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>
            {assignSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!assignSuccess && (
            <Button 
              onClick={handleAssignTutor} 
              variant="contained"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={tutorsLoading}
            >
              {tutorsLoading ? <CircularProgress size={24} /> : 'Assign'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentDetails;