import { createSlice } from "@reduxjs/toolkit";
import { loadFromStorage, STORAGE_KEYS } from "../../utils/storage.js";

const rawSavedProfile =
  loadFromStorage(STORAGE_KEYS.profile, null) ||
  loadFromStorage(STORAGE_KEYS.legacyOnboarding, null);

const validProfile =
  rawSavedProfile && typeof rawSavedProfile === "object" && !Array.isArray(rawSavedProfile)
    ? rawSavedProfile
    : null;

const savedProfile =
  validProfile?.demoMode
    ? { ...validProfile, name: "Demo User" }
    : validProfile;

const savedPreferences = loadFromStorage(STORAGE_KEYS.preferences, null);
const validPreferences =
  savedPreferences && typeof savedPreferences === "object" && !Array.isArray(savedPreferences)
    ? savedPreferences
    : {};

const defaultPreferences = {
  darkMode: false,
  units: "kg",
  notifications: true,
  autoSaveWorkouts: true,
  restTimer: 90,
  workoutReminders: "Daily",
  language: "English (US)",
  profileVisibility: "Private",
  shareProgress: false,
  twoFactorAuth: false,
};

const initialState = {
  profile: savedProfile,
  preferences: { ...defaultPreferences, ...validPreferences },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      if (!action.payload) {
        state.profile = null;
        return;
      }
      state.profile = {
        ...state.profile,
        ...action.payload,
        demoMode: Boolean(action.payload?.demoMode),
      };
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setProfile, updatePreferences, clearProfile } = userSlice.actions;
export default userSlice.reducer;
