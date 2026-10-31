import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import userReducer from "../features/user/userSlice.js";
import {
  removeFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from "../utils/storage.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});

store.subscribe(() => {
  const state = store.getState();
  if (state.auth.isAuthenticated) {
    const storageArea = state.auth.rememberMe ? "local" : "session";
    saveToStorage(STORAGE_KEYS.auth, state.auth, storageArea);
    removeFromStorage(
      STORAGE_KEYS.auth,
      storageArea === "local" ? "session" : "local",
    );
  } else {
    removeFromStorage(STORAGE_KEYS.auth, "local");
    removeFromStorage(STORAGE_KEYS.auth, "session");
  }

  saveToStorage(STORAGE_KEYS.profile, state.user.profile);
  saveToStorage(STORAGE_KEYS.preferences, state.user.preferences);
  removeFromStorage(STORAGE_KEYS.legacyOnboarding);
});
