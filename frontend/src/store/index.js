import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import assignmentReducer from './slices/assignmentSlice';
import subjectReducer from './slices/subjectSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    assignments: assignmentReducer,
    subjects: subjectReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows non-serializable values in state
    }),
});

export default store;