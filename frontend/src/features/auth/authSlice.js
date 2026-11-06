import { createSlice } from "@reduxjs/toolkit";
import { loadFromStorage, STORAGE_KEYS } from "../../utils/storage.js";

const defaultState = {
  isAuthenticated: false,
  user: null,
  demoMode: false,
  isReadOnly: false,
  rememberMe: true,
};

const rawSavedAuth =
  loadFromStorage(STORAGE_KEYS.auth, null) ||
  loadFromStorage(STORAGE_KEYS.auth, null, "session");

const validAuth =
  rawSavedAuth && typeof rawSavedAuth === "object" && !Array.isArray(rawSavedAuth)
    ? rawSavedAuth
    : null;

const savedAuth =
  validAuth?.demoMode && validAuth?.user
    ? { ...validAuth, user: { ...validAuth.user, name: "Demo User" } }
    : validAuth;

const initialState = savedAuth
  ? { ...defaultState, ...savedAuth }
  : defaultState;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.demoMode = Boolean(action.payload?.demoMode);
      state.isReadOnly = Boolean(action.payload?.isReadOnly ?? action.payload?.demoMode);
      state.rememberMe = action.payload?.rememberMe ?? true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.demoMode = false;
      state.isReadOnly = false;
    },
    setDemoMode: (state, action) => {
      state.demoMode = action.payload;
    },
  },
});

export const { loginSuccess, logout, setDemoMode } = authSlice.actions;
export default authSlice.reducer;
