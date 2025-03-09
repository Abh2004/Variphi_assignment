// API Configuration
// src/config.js
export const API_URL = 'http://localhost:8000';
// Assignment Status Options
export const ASSIGNMENT_STATUS = {
  SUBMITTED: 'submitted',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  RETURNED: 'returned',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TUTOR: 'tutor',
};

// File Upload Size Limit (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
