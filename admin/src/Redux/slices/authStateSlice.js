import { createSlice } from "@reduxjs/toolkit";

const authStateSlice = createSlice({
  name: "authState",
  initialState: {
    user: null,
    isAuthenticated: false,
    token: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authStateSlice.actions;
export default authStateSlice.reducer;