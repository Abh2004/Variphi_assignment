import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Get user info from localStorage
const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

// Initial state
const initialState = {
  user: userFromStorage,
  isAuthenticated: !!userFromStorage,
  loading: false,
  error: null,
};

// Register user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Registration failed'
      );
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Prepare form data (FastAPI expects form data for OAuth2)
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      // Make the request
      const response = await axios.post(`${API_URL}/token`, formData, {
        withCredentials: true, // Important for cookies
      });
      
      // Store token in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        role: response.data.user_role,
        token: response.data.access_token,
      }));
      
      return {
        id: response.data.user_id,
        role: response.data.user_role,
        token: response.data.access_token,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Login failed'
      );
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true,
      });
      
      // Remove user from localStorage
      localStorage.removeItem('user');
      
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Logout failed'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;