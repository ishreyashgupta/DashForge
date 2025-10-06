// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  role: null,
  userId: null,
  name: null,
  email: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const user = action.payload;
      state.token = user.token || null;
      state.role = user.role || null;
      state.userId = user._id || user.id || null;
      state.name = user.name || null;
      state.email = user.email || null;

      localStorage.setItem('user', JSON.stringify(user)); // optional: persist
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.name = null;
      state.email = null;

      localStorage.removeItem('user'); // clear storage
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
