import { workouts } from "../data/workouts.js";
import { apiRequest } from "./api.js";

// Template library (static workout templates)
export const getWorkouts = () => workouts;

export const getWorkoutById = (id) =>
  workouts.find((workout) => workout.id === id) || null;

export const searchWorkouts = ({
  query = "",
  category = "All",
  difficulty = "All",
}) => {
  const normalizedQuery = query.trim().toLowerCase();

  return workouts.filter((workout) => {
    const matchesQuery =
      !normalizedQuery ||
      workout.name.toLowerCase().includes(normalizedQuery) ||
      workout.muscleGroups.some((group) =>
        group.toLowerCase().includes(normalizedQuery),
      );

    const matchesCategory =
      category === "All" ||
      workout.category === category ||
      workout.muscleGroups.includes(category);
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
