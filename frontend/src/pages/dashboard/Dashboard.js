import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAssignments } from '../../store/slices/assignmentSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, 
  Button, CircularProgress, Divider, Chip
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  AddCircleOutline as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { USER_ROLES, ASSIGNMENT_STATUS } from '../../config';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { assignments, loading: assignmentsLoading } = useSelector(state => state.assignments);
  const { subjects, loading: subjectsLoading } = useSelector(state => state.subjects);
  
  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchSubjects());
  }, [dispatch]);
  
  // Get assignment statistics
  const getAssignmentStats = () => {
    if (!assignments) return {};
    
    if (user?.role === USER_ROLES.STUDENT) {
      return {
        total: assignments.length,
        submitted: assignments.filter(a => a.status === ASSIGNMENT_STATUS.SUBMITTED).length,
        inProgress: assignments.filter(a => a.status === ASSIGNMENT_STATUS.ASSIGNED || a.status === ASSIGNMENT_STATUS.IN_PROGRESS).length,
        completed: assignments.filter(a => a.status === ASSIGNMENT_STATUS.COMPLETED || a.status === ASSIGNMENT_STATUS.RETURNED).length,
      };
    }
    
    if (user?.role === USER_ROLES.TUTOR) {
      return {
        total: assignments.length,
        new: assignments.filter(a => a.status === ASSIGNMENT_STATUS.ASSIGNED).length,
        inProgress: assignments.filter(a => a.status === ASSIGNMENT_STATUS.IN_PROGRESS).length,
        completed: assignments.filter(a => a.status === ASSIGNMENT_STATUS.COMPLETED || a.status === ASSIGNMENT_STATUS.RETURNED).length,
      };
    }
    
    // Admin stats
    return {
      total: assignments.length,
      unassigned: assignments.filter(a => a.status === ASSIGNMENT_STATUS.SUBMITTED).length,
      inProgress: assignments.filter(a => a.status === ASSIGNMENT_STATUS.ASSIGNED || a.status === ASSIGNMENT_STATUS.IN_PROGRESS).length,
      completed: assignments.filter(a => a.status === ASSIGNMENT_STATUS.COMPLETED || a.status === ASSIGNMENT_STATUS.RETURNED).length,
    };
  };
  
  // Get recent assignments
  const getRecentAssignments = () => {
    if (!assignments) return [];
    
    // Sort by most recent first and take the first 5
    return [...assignments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
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
  
  // Loading state
  if (assignmentsLoading || subjectsLoading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }
  
  const stats = getAssignmentStats();
  const recentAssignments = getRecentAssignments();
  
  return (
    <Box>
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Typography variant="h4" component="h1" className="mb-4 md:mb-0">
          Dashboard
        </Typography>
        
        {/* Quick actions based on user role */}
        <Box className="space-x-2">
          {user?.role === USER_ROLES.STUDENT && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/assignments/submit')}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Submit New Assignment
            </Button>
          )}
          
          {user?.role === USER_ROLES.TUTOR && (
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/tutor/assignments')}
              className="bg-blue-700 hover:bg-blue-800"
            >
              View Assignments
            </Button>
          )}
          
          {user?.role === USER_ROLES.ADMIN && (
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/admin')}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Admin Dashboard
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4" elevation={2}>
            <Box className="flex items-center mb-2">
              <AssignmentIcon fontSize="large" className="text-blue-500 mr-2" />
              <Typography variant="h6">Total Assignments</Typography>
            </Box>
            <Typography variant="h3" className="font-bold">
              {stats.total || 0}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4" elevation={2}>
            <Box className="flex items-center mb-2">
              <AssignmentIcon fontSize="large" className="text-yellow-500 mr-2" />
              <Typography variant="h6">
                {user?.role === USER_ROLES.STUDENT
                  ? 'Submitted'
                  : user?.role === USER_ROLES.TUTOR
                  ? 'New'
                  : 'Unassigned'}
              </Typography>
            </Box>
            <Typography variant="h3" className="font-bold">
              {user?.role === USER_ROLES.STUDENT
                ? stats.submitted || 0
                : user?.role === USER_ROLES.TUTOR
                ? stats.new || 0
                : stats.unassigned || 0}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4" elevation={2}>
            <Box className="flex items-center mb-2">
              <AssignmentIcon fontSize="large" className="text-orange-500 mr-2" />
              <Typography variant="h6">In Progress</Typography>
            </Box>
            <Typography variant="h3" className="font-bold">
              {stats.inProgress || 0}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4" elevation={2}>
            <Box className="flex items-center mb-2">
              <AssignmentIcon fontSize="large" className="text-green-500 mr-2" />
              <Typography variant="h6">Completed</Typography>
            </Box>
            <Typography variant="h3" className="font-bold">
              {stats.completed || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Assignments */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className="p-4" elevation={2}>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="font-bold">
                Recent Assignments
              </Typography>
              
              <Button
                variant="text"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  if (user?.role === USER_ROLES.STUDENT) {
                    navigate('/assignments');
                  } else if (user?.role === USER_ROLES.TUTOR) {
                    navigate('/tutor/assignments');
                  } else {
                    navigate('/admin');
                  }
                }}
                className="text-blue-700"
              >
                View All
              </Button>
            </Box>
            
            {recentAssignments.length === 0 ? (
              <Typography className="text-center py-8 text-gray-500">
                No assignments found
              </Typography>
            ) : (
              recentAssignments.map((assignment, index) => (
                <React.Fragment key={assignment.id}>
                  <Box className="py-3">
                    <Box className="flex justify-between">
                      <Typography variant="subtitle1" className="font-medium">
                        {assignment.title}
                      </Typography>
                      <Chip 
                        label={assignment.status} 
                        size="small" 
                        color={getStatusColor(assignment.status)} 
                      />
                    </Box>
                    
                    <Box className="flex justify-between items-center mt-2">
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Subject: {assignment.subject.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Submitted: {formatDate(assignment.created_at)}
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          user?.role === USER_ROLES.TUTOR ? <EditIcon /> : <ViewIcon />
                        }
                        onClick={() => {
                          if (user?.role === USER_ROLES.STUDENT) {
                            navigate(`/assignments/view/${assignment.id}`);
                          } else if (user?.role === USER_ROLES.TUTOR) {
                            navigate(`/tutor/assignments/review/${assignment.id}`);
                          } else {
                            navigate(`/admin/assignments/${assignment.id}`);
                          }
                        }}
                      >
                        {user?.role === USER_ROLES.TUTOR ? 'Review' : 'View'}
                      </Button>
                    </Box>
                  </Box>
                  {index < recentAssignments.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </Paper>
        </Grid>
        
        {/* Subjects Card */}
        <Grid item xs={12} md={4}>
          <Paper className="p-4" elevation={2}>
            <Box className="flex items-center mb-4">
              <SchoolIcon className="text-blue-500 mr-2" />
              <Typography variant="h6" className="font-bold">
                Available Subjects
              </Typography>
            </Box>
            
            {subjects.length === 0 ? (
              <Typography className="text-center py-4 text-gray-500">
                No subjects found
              </Typography>
            ) : (
              <Box>
                {subjects.slice(0, 6).map((subject, index) => (
                  <React.Fragment key={subject.id}>
                    <Box className="py-2">
                      <Typography variant="subtitle1">{subject.name}</Typography>
                      {subject.description && (
                        <Typography variant="body2" color="textSecondary" className="line-clamp-2">
                          {subject.description}
                        </Typography>
                      )}
                    </Box>
                    {index < Math.min(subjects.length, 6) - 1 && <Divider />}
                  </React.Fragment>
                ))}
                
                {subjects.length > 6 && (
                  <Box className="mt-2 text-center">
                    <Button 
                      variant="text" 
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => {
                        if (user?.role === USER_ROLES.ADMIN) {
                          navigate('/admin/subjects');
                        }
                      }}
                      disabled={user?.role !== USER_ROLES.ADMIN}
                      className="text-blue-700"
                    >
                      View All
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            
            {user?.role === USER_ROLES.ADMIN && (
              <Box className="mt-4">
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/subjects')}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  Manage Subjects
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;