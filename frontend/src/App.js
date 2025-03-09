import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Components
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Student Pages
import StudentAssignments from './pages/student/StudentAssignments';
import SubmitAssignment from './pages/student/SubmitAssignment';
import ViewAssignment from './pages/student/ViewAssignment';

// Tutor Pages
import TutorAssignments from './pages/tutor/TutorAssignments';
import ReviewAssignment from './pages/tutor/ReviewAssignment';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageSubjects from './pages/admin/ManageSubjects';
import AssignmentDetails from './pages/admin/AssignmentDetails';

// Constants
import { USER_ROLES } from './config';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      light: '#4da6ff',
      main: '#2196f3',
      dark: '#0d47a1',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ element, roles, redirectPath = '/login' }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return element;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute 
                element={<Layout />} 
                roles={[USER_ROLES.ADMIN, USER_ROLES.STUDENT, USER_ROLES.TUTOR]} 
              />
            }
          >
            {/* Dashboard - available to all authenticated users */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Student Routes */}
            <Route 
              path="assignments" 
              element={
                <ProtectedRoute 
                  element={<StudentAssignments />} 
                  roles={[USER_ROLES.STUDENT, USER_ROLES.ADMIN]} 
                />
              } 
            />
            <Route 
              path="assignments/submit" 
              element={
                <ProtectedRoute 
                  element={<SubmitAssignment />} 
                  roles={[USER_ROLES.STUDENT, USER_ROLES.ADMIN]} 
                />
              } 
            />
            <Route 
              path="assignments/view/:id" 
              element={
                <ProtectedRoute 
                  element={<ViewAssignment />} 
                  roles={[USER_ROLES.STUDENT, USER_ROLES.ADMIN]} 
                />
              } 
            />
            
            {/* Tutor Routes */}
            <Route 
              path="tutor/assignments" 
              element={
                <ProtectedRoute 
                  element={<TutorAssignments />} 
                  roles={[USER_ROLES.TUTOR, USER_ROLES.ADMIN]} 
                />
              } 
            />
            <Route 
              path="tutor/assignments/review/:id" 
              element={
                <ProtectedRoute 
                  element={<ReviewAssignment />} 
                  roles={[USER_ROLES.TUTOR, USER_ROLES.ADMIN]} 
                />
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute 
                  element={<AdminDashboard />} 
                  roles={[USER_ROLES.ADMIN]} 
                />
              } 
            />
            <Route 
              path="admin/users" 
              element={
                <ProtectedRoute 
                  element={<ManageUsers />} 
                  roles={[USER_ROLES.ADMIN]} 
                />
              } 
            />
            <Route 
              path="admin/subjects" 
              element={
                <ProtectedRoute 
                  element={<ManageSubjects />} 
                  roles={[USER_ROLES.ADMIN]} 
                />
              } 
            />
            <Route 
              path="admin/assignments/:id" 
              element={
                <ProtectedRoute 
                  element={<AssignmentDetails />} 
                  roles={[USER_ROLES.ADMIN]} 
                />
              } 
            />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;