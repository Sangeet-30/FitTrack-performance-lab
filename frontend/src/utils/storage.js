export const STORAGE_KEYS = {
  auth: "fittrack-auth-state",
  profile: "fittrack-user-profile",
  preferences: "fittrack-user-preferences",
  workoutProgress: "fittrack-workout-progress",
  legacyOnboarding: "fittrack-onboarding",
};

function getStorage(storageArea) {
  if (typeof window === "undefined") return null;
  try {
    return storageArea === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function loadFromStorage(key, fallback = null, storageArea = "local") {
  try {
    const storage = getStorage(storageArea);
    if (!storage) return fallback;
    const rawValue = storage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    console.warn(`Unable to load ${key} from storage:`, error.message);
    return fallback;
  }
}

export function saveToStorage(key, value, storageArea = "local") {
  try {
    const storage = getStorage(storageArea);
    if (!storage) return;
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to save ${key} to storage:`, error.message);
  }
}

export function removeFromStorage(key, storageArea = "local") {
  try {
    const storage = getStorage(storageArea);
    if (!storage) return;
    storage.removeItem(key);
  } catch (error) {
    console.warn(`Unable to remove ${key} from storage:`, error.message);
  }
}
