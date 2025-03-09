import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Initial state
const initialState = {
  subjects: [],
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

// Get all subjects
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/subjects`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch subjects'
      );
    }
  }
);

// Create subject (admin only)
export const createSubject = createAsyncThunk(
  'subjects/create',
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/subjects`,
        subjectData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create subject'
      );
    }
  }
);

// Update subject (admin only)
export const updateSubject = createAsyncThunk(
  'subjects/update',
  async ({ id, subjectData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/subjects/${id}`,
        subjectData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update subject'
      );
    }
  }
);

// Delete subject (admin only)
export const deleteSubject = createAsyncThunk(
  'subjects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/subjects/${id}`, getAuthConfig());
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete subject'
      );
    }
  }
);

// Subject slice
const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    clearSubjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create subject
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects.push(action.payload);
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update subject
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subjects.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete subject
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter(
          (subject) => subject.id !== action.payload
        );
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubjectError } = subjectSlice.actions;
export default subjectSlice.reducer;