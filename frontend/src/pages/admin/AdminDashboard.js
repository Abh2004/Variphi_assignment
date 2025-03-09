import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, assignTutor } from '../../store/slices/assignmentSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchAllTutors } from '../../store/slices/userSlice';
import { 
  Box, Typography, Paper, Tab, Tabs, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Chip,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  PersonAdd as AssignIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { ASSIGNMENT_STATUS } from '../../config';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignments, loading, error } = useSelector(state => state.assignments);
  const { subjects } = useSelector(state => state.subjects);
  const { tutors, loading: tutorsLoading } = useSelector(state => state.users);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null);
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);
  
  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchSubjects());
    //dispatch(fetchAllTutors());
    if (tutors.length === 0) {
        dispatch(fetchAllTutors());
      }
  }, [dispatch,tutors.length]);
  
  // Handle tab change
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset pagination when changing tabs
  };
  
  // Handle page change
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open assign tutor dialog
  const handleOpenAssignDialog = (assignmentId) => {
    setCurrentAssignmentId(assignmentId);
    setSelectedTutorId('');
    setAssignError('');
    setAssignSuccess(false);
    setAssignDialogOpen(true);
  };
  
  // Close assign tutor dialog
  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setTimeout(() => {
      setCurrentAssignmentId(null);
      setSelectedTutorId('');
      setAssignError('');
      setAssignSuccess(false);
    }, 300);
  };
  
  // Handle tutor selection change
  const handleTutorChange = (e) => {
    setSelectedTutorId(e.target.value);
    if (assignError) setAssignError('');
  };
  
  // Handle assign tutor
  const handleAssignTutor = () => {
    if (!selectedTutorId) {
      setAssignError('Please select a tutor');
      return;
    }
    
    dispatch(assignTutor({
      assignment_id: currentAssignmentId,
      tutor_id: selectedTutorId
    }))
      .unwrap()
      .then(() => {
        setAssignSuccess(true);
        setTimeout(() => {
          handleCloseAssignDialog();
        }, 1500);
      })
      .catch((err) => {
        setAssignError(err || 'Failed to assign tutor');
      });
  };
  
  // Filter assignments based on tab
  const getFilteredAssignments = () => {
    if (!assignments) return [];
    
    switch (tabValue) {
      case 0: // All
        return assignments;
      case 1: // Pending Assignment
        return assignments.filter(a => a.status === ASSIGNMENT_STATUS.SUBMITTED);
      case 2: // In Progress
        return assignments.filter(a => 
          a.status === ASSIGNMENT_STATUS.ASSIGNED || 
          a.status === ASSIGNMENT_STATUS.IN_PROGRESS
        );
      case 3: // Completed
        return assignments.filter(a => 
          a.status === ASSIGNMENT_STATUS.COMPLETED || 
          a.status === ASSIGNMENT_STATUS.RETURNED
        );
      default:
        return assignments;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
  
  // Get subject name by id
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };
  
  // Pagination
  const filteredAssignments = getFilteredAssignments();
  const paginatedAssignments = filteredAssignments
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/subjects')}
          className="bg-blue-700 hover:bg-blue-800"
        >
          Manage Subjects
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Paper elevation={2}>
        <Box className="p-4 border-b">
          <Typography variant="h6" className="font-bold">
            Assignments Management
          </Typography>
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All" />
          <Tab label="Pending Assignment" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
        
        {loading ? (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        ) : filteredAssignments.length === 0 ? (
          <Box className="py-8 text-center">
            <Typography variant="body1" color="textSecondary">
              No assignments found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Tutor</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{getSubjectName(assignment.subject_id)}</TableCell>
                      <TableCell>{assignment.student.name}</TableCell>
                      <TableCell>
                        {assignment.tutor ? assignment.tutor.name : 'Not Assigned'}
                      </TableCell>
                      <TableCell>{formatDate(assignment.created_at)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={assignment.status} 
                          size="small" 
                          color={getStatusColor(assignment.status)} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box className="flex space-x-2">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => navigate(`/admin/assignments/${assignment.id}`)}
                          >
                            View
                          </Button>
                          
                          {assignment.status === ASSIGNMENT_STATUS.SUBMITTED && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AssignIcon />}
                              onClick={() => handleOpenAssignDialog(assignment.id)}
                              className="bg-blue-700 hover:bg-blue-800"
                            >
                              Assign
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAssignments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
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

export default AdminDashboard;