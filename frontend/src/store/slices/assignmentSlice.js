import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Initial state
const initialState = {
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,
};

// Helper function to set auth header
const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
    withCredentials: true,
  };
};

// Get all assignments
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/assignments`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch assignments'
      );
    }
  }
);

// Get assignment by ID
export const getAssignmentById = createAsyncThunk(
  'assignments/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/assignments/${id}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch assignment'
      );
    }
  }
);

// Create new assignment
export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (assignmentData, { rejectWithValue }) => {
    try {
      // FormData is required for file uploads
      const formData = new FormData();
      
      // Append text fields
      formData.append('title', assignmentData.title);
      formData.append('description', assignmentData.description || '');
      formData.append('submission_text', assignmentData.submission_text || '');
      formData.append('subject_id', assignmentData.subject_id);
      
      // Append file if exists
      if (assignmentData.file) {
        formData.append('file', assignmentData.file);
      }
      
      const response = await axios.post(`${API_URL}/assignments`, formData, {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create assignment'
      );
    }
  }
);

// In assignmentSlice.js - the assignTutor async thunk
export const assignTutor = createAsyncThunk(
    'assignments/assignTutor',
    async ({ assignment_id, tutor_id }, { rejectWithValue }) => {
      try {
        console.log("Making API call to assign tutor:", { assignment_id, tutor_id });
        const response = await axios.put(
          `${API_URL}/assignments/${assignment_id}/assign`,
          { tutor_id, status: 'assigned' },
          getAuthConfig()
        );
        console.log("API response:", response.data);
        return response.data;
      } catch (error) {
        console.error("API error:", error.response?.data);
        return rejectWithValue(
          error.response?.data?.detail || 'Failed to assign tutor'
        );
      }
    }
  );
// Update assignment status (tutor only)
export const updateAssignmentStatus = createAsyncThunk(
  'assignments/updateStatus',
  async ({ assignment_id, status, description }, { rejectWithValue }) => {
    try {
      const payload = { status };
      if (description) payload.description = description;
      
      const response = await axios.put(
        `${API_URL}/assignments/${assignment_id}/status`,
        payload,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update assignment status'
      );
    }
  }
);

// Upload solution (tutor only)
export const uploadSolution = createAsyncThunk(
  'assignments/uploadSolution',
  async ({ assignment_id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.put(
        `${API_URL}/assignments/${assignment_id}/solution`,
        formData,
        {
          ...getAuthConfig(),
          headers: {
            ...getAuthConfig().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to upload solution'
      );
    }
  }
);

// Assignment slice
const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    clearAssignmentError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get assignment by ID
      .addCase(getAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssignmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(getAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Assign tutor
      .addCase(assignTutor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTutor.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
        
        // Update the assignment in the list
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(assignTutor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update assignment status
      .addCase(updateAssignmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssignmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
        
        // Update the assignment in the list
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(updateAssignmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload solution
      .addCase(uploadSolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadSolution.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
        
        // Update the assignment in the list
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(uploadSolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAssignmentError, clearCurrentAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;