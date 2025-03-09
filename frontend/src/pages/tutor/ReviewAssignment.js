// src/pages/tutor/ReviewAssignment.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAssignmentById, 
  updateAssignmentStatus, 
  uploadSolution 
} from '../../store/slices/assignmentSlice';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Card, CardContent, Divider, Chip, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  AssignmentTurnedIn as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  Comment as CommentIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { ASSIGNMENT_STATUS, API_URL, MAX_FILE_SIZE } from '../../config';
import CommentSection from '../../components/comments/CommentSection';

const ReviewAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentAssignment, loading, error } = useSelector(state => state.assignments);
  
  // Local state
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Fetch assignment data when component mounts
  useEffect(() => {
    dispatch(getAssignmentById(id));
  }, [dispatch, id]);
  
  // Update status state when assignment data is loaded
  useEffect(() => {
    if (currentAssignment) {
      setStatus(currentAssignment.status);
      setFeedback(currentAssignment.description || '');
    }
  }, [currentAssignment]);
  
  // Handle status change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };
  
  // Handle feedback change
  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };
  
  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        setFile(null);
        setFileName('');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileError('');
    }
  };
  
  // Handle update status
  const handleUpdateStatus = () => {
    dispatch(updateAssignmentStatus({
      assignment_id: id,
      status: status,
      description: feedback
    }))
      .unwrap()
      .then(() => {
        setUpdateSuccess(true);
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      })
      .catch(() => {});
  };
  
  // Handle upload solution
  const handleUploadSolution = () => {
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }
    
    dispatch(uploadSolution({
      assignment_id: id,
      file: file
    }))
      .unwrap()
      .then(() => {
        setUploadSuccess(true);
        setFile(null);
        setFileName('');
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      })
      .catch(() => {});
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
          Review Assignment
        </Typography>
        
        <Button
          variant="outlined"
          onClick={() => navigate('/tutor/assignments')}
        >
          Back to Assignments
        </Button>
      </Box>
      
      {updateSuccess && (
        <Alert severity="success" className="mb-4">
          Assignment status updated successfully!
        </Alert>
      )}
      
      {uploadSuccess && (
        <Alert severity="success" className="mb-4">
          Solution uploaded successfully!
        </Alert>
      )}
      
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
                    Student
                  </Typography>
                  <Typography variant="body1" className="flex items-center">
                    <PersonIcon fontSize="small" className="mr-1 text-gray-500" />
                    {currentAssignment.student.name} ({currentAssignment.student.email})
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
                  Review and Feedback
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={status}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value={ASSIGNMENT_STATUS.ASSIGNED}>Assigned</MenuItem>
                    <MenuItem value={ASSIGNMENT_STATUS.IN_PROGRESS}>In Progress</MenuItem>
                    <MenuItem value={ASSIGNMENT_STATUS.COMPLETED}>Completed</MenuItem>
                    <MenuItem value={ASSIGNMENT_STATUS.RETURNED}>Returned</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="feedback"
                  label="Feedback"
                  multiline
                  rows={4}
                  value={feedback}
                  onChange={handleFeedbackChange}
                />
                
                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  onClick={handleUpdateStatus}
                  className="mt-3 bg-blue-700 hover:bg-blue-800"
                >
                  Update Status
                </Button>
                
                <Divider className="my-4" />
                
                <Typography variant="subtitle1" className="font-bold mb-2">
                  Upload Solution
                </Typography>
                
                <Box className="flex items-center mb-2">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                    />
                  </Button>
                  
                  <Typography variant="body2" className="ml-2 text-gray-600">
                    {fileName || 'No file chosen'}
                  </Typography>
                </Box>
                
                {fileError && (
                  <Typography color="error" variant="caption" className="mt-1 block">
                    {fileError}
                  </Typography>
                )}
                
                <Button
                  variant="contained"
                  onClick={handleUploadSolution}
                  disabled={!file}
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  Upload Solution
                </Button>
                
                {currentAssignment.solution_file_path && (
                  <Box className="mt-4">
                    <Typography variant="body2" className="text-gray-600">
                      Solution already uploaded:
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

export default ReviewAssignment;