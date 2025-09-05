// store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: null,
    email: null,
    role: null,
    accessToken: null,
    refreshToken: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearUser: (state) => {
      state.username = null;
      state.email = null;
      state.role = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
