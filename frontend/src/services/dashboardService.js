import { apiRequest } from './api.js';

export async function fetchDashboardData() {
  return await apiRequest('/dashboard');
}

export async function logQuickWorkout(workoutData) {
  return await apiRequest('/workouts', {
    method: 'POST',
    body: JSON.stringify(workoutData),
  });
}

export async function updateGoalProgress(goalId, patch) {
  return await apiRequest(`/goals/${goalId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
