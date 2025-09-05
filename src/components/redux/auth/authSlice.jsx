// authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null, // Armazenando o refresh token também
  },
  reducers: {
    setCredentials: (state, action) => {
      const { access, refresh, username, email, role } = action.payload;
      state.user = { username, email, role }; // Armazenando as informações do usuário
      state.token = access; // O accessToken que você recebe
      state.refreshToken = refresh; // O refreshToken também é armazenado
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    }
  }
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

// Seletores
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRefreshToken = (state) => state.auth.refreshToken;
