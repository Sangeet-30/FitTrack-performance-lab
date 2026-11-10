import { workouts } from "../data/workouts.js";
import { apiRequest } from "./api.js";

// User-limited custom workouts stored per athlete
export const getUserCustomWorkouts = (userId) => {
  try {
    const key = `fittrack_custom_workouts_${userId || "default"}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserCustomWorkout = (userId, workout) => {
  try {
    const key = `fittrack_custom_workouts_${userId || "default"}`;
    const current = getUserCustomWorkouts(userId);
    const updated = [workout, ...current.filter((w) => w.id !== workout.id)];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const deleteUserCustomWorkout = (userId, workoutId) => {
  try {
    const key = `fittrack_custom_workouts_${userId || "default"}`;
    const current = getUserCustomWorkouts(userId);
    const updated = current.filter((w) => w.id !== workoutId);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

// Template library (static workout templates + user custom routines)
export const getWorkouts = (userId = null) => {
  const custom = getUserCustomWorkouts(userId);
  return [...custom, ...workouts];
};

export const getWorkoutById = (id, userId = null) => {
  if (!id) return null;

  // 1. Direct match on user custom workouts
  if (userId) {
    const custom = getUserCustomWorkouts(userId).find(
      (workout) => workout.id === id || workout.name?.toLowerCase() === id.toLowerCase()
    );
    if (custom) return custom;
  } else {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("fittrack_custom_workouts_")) {
          const list = JSON.parse(localStorage.getItem(k) || "[]");
          const found = list.find(
            (w) => w.id === id || w.name?.toLowerCase() === id.toLowerCase()
          );
          if (found) return found;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Direct match on catalog workouts by ID or name
  const exactCatalog = workouts.find(
    (w) =>
      w.id === id ||
      w.name.toLowerCase() === id.toLowerCase() ||
      (w.title && w.title.toLowerCase() === id.toLowerCase())
  );
  if (exactCatalog) return exactCatalog;

  // 3. Match by normalized slug (e.g. "back-day", "chest-hypertrophy-blast")
  const normalizedSlug = id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slugMatch = workouts.find((w) => {
    const wSlug = w.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return w.id === normalizedSlug || wSlug === normalizedSlug;
  });
  if (slugMatch) return slugMatch;

  // 4. Match by target body part / category in the session name
  const lower = id.toLowerCase();
  let matchedCat = null;
  if (lower.includes("chest")) matchedCat = "Chest";
  else if (lower.includes("back") || lower.includes("pull")) matchedCat = "Back";
  else if (lower.includes("leg") || lower.includes("quad") || lower.includes("calve")) matchedCat = "Legs";
  else if (lower.includes("shoulder") || lower.includes("arm") || lower.includes("bicep") || lower.includes("tricep") || lower.includes("push")) matchedCat = "Strength";
  else if (lower.includes("hiit") || lower.includes("cardio") || lower.includes("aerobic")) matchedCat = "Cardio";
  else if (lower.includes("mobility") || lower.includes("recovery")) matchedCat = "Mobility";

  const cleanTitle = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (matchedCat) {
    const catWorkout = workouts.find((w) => w.category === matchedCat) || workouts[0];
    return {
      ...catWorkout,
      id,
      name: cleanTitle,
    };
  }

  // 5. Dynamic fallback routine so live studio timer always loads seamlessly
  const baseWorkout = workouts[0] || {};
  return {
    ...baseWorkout,
    id,
    name: cleanTitle,
    category: "Strength",
    duration: 50,
  };
};

export const searchWorkouts = ({
  query = "",
  category = "All",
  difficulty = "All",
  userId = null,
}) => {
  const normalizedQuery = query.trim().toLowerCase();
  const custom = getUserCustomWorkouts(userId);
  const combined = [...custom, ...workouts];

  return combined.filter((workout) => {
    const matchesQuery =
      !normalizedQuery ||
      workout.name.toLowerCase().includes(normalizedQuery) ||
      (workout.muscleGroups &&
        workout.muscleGroups.some((group) =>
          group.toLowerCase().includes(normalizedQuery),
        ));

    const matchesCategory =
      category === "All" ||
      workout.category === category ||
      (workout.muscleGroups && workout.muscleGroups.includes(category));
    const matchesDifficulty =
      difficulty === "All" || workout.difficulty === difficulty;

    return matchesQuery && matchesCategory && matchesDifficulty;
  });
};

// API Integration for logged user workouts
export const fetchUserWorkouts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(`/workouts${query ? `?${query}` : ''}`);
};

export const createWorkout = async (workoutData) => {
  return await apiRequest('/workouts', {
    method: 'POST',
    body: JSON.stringify(workoutData),
  });
};

export const deleteWorkout = async (id) => {
  return await apiRequest(`/workouts/${id}`, {
    method: 'DELETE',
  });
};

export const updateWorkout = async (id, workoutData) => {
  return await apiRequest(`/workouts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(workoutData),
  });
};
