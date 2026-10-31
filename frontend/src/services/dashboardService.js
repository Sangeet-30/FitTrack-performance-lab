import { apiRequest } from './api.js';

const fallbackDashboardData = {
  user: {
    id: 'athlete',
    name: 'Athlete',
    email: '',
    goal: 'Improve Fitness',
    fitnessLevel: 'Beginner',
    units: 'kg',
    currentWeightKg: null,
  },
  stats: {
    weeklyWorkoutsCount: 0,
    weeklyGoalTarget: 4,
    streakDays: 0,
    monthlyVolumeKg: 0,
    totalWorkoutCount: 0,
    currentWeight: null,
    targetWeight: null,
  },
  weeklyActivity: [
    { day: 'Mon', date: '', done: false, count: 0, volume: 0 },
    { day: 'Tue', date: '', done: false, count: 0, volume: 0 },
    { day: 'Wed', date: '', done: false, count: 0, volume: 0 },
    { day: 'Thu', date: '', done: false, count: 0, volume: 0 },
    { day: 'Fri', date: '', done: false, count: 0, volume: 0 },
    { day: 'Sat', date: '', done: false, count: 0, volume: 0 },
    { day: 'Sun', date: '', done: false, count: 0, volume: 0 },
  ],
  recentWorkouts: [],
  activeGoals: [],
  profileStatus: {
    isComplete: false,
    percent: 40,
    missingFields: ['age', 'heightCm', 'currentWeightKg'],
  },
};

export async function fetchDashboardData() {
  try {
    return await apiRequest('/dashboard');
  } catch (error) {
    console.warn('Backend dashboard API returned error, using fallback:', error.message);
    return fallbackDashboardData;
  }
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
