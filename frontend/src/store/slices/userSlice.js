import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Initial state
const initialState = {
  users: [],
  tutors: [],
  currentUser: null,
  loading: false,
  error: null,
  lastFetched: null, // Add this to track when data was last fetched

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

// Get current user info
export const fetchCurrentUser = createAsyncThunk(
  'users/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch user info'
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { rejectWithValue, getState }) => {
      try {
        // Get current state
        const state = getState();
        const now = Date.now();
        
        // Only fetch if we haven't fetched in the last 5 minutes
        if (state.users.lastFetched && now - state.users.lastFetched < 300000) {
          return state.users.users; // Return existing data
        }
        
        const response = await axios.get(`${API_URL}/users`, getAuthConfig());
        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.detail || 'Failed to fetch users'
        );
      }
    }
  );

// Get all tutors (admin only)
export const fetchAllTutors = createAsyncThunk(
    'users/fetchAllTutors',
    async (_, { rejectWithValue, getState }) => {
      // Get the current state
      const state = getState();
      
      // Only fetch if we don't already have tutors or are explicitly asked to refresh
      if (state.users.tutors.length === 0 || _.force === true) {
        try {
          const response = await axios.get(`${API_URL}/users/tutors/list`, getAuthConfig());
          return response.data;
        } catch (error) {
          return rejectWithValue(
            error.response?.data?.detail || 'Failed to fetch tutors'
          );
        }
      } else {
        // Return the existing tutors to avoid unnecessary state changes
        return state.users.tutors;
      }
    }
  );

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.lastFetched = Date.now(); // Update the timestamp

      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all tutors
      .addCase(fetchAllTutors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTutors.fulfilled, (state, action) => {
        state.loading = false;
        state.tutors = action.payload;
        state.lastFetched = Date.now(); // Update the timestamp

      })
      .addCase(fetchAllTutors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;