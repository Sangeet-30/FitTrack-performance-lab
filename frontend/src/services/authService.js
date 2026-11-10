import { apiRequest } from './api.js';

export const demoAuthUser = {
  id: 'demo-user',
  name: 'Demo Athlete',
  email: 'demo@fittrack.app',
  demoMode: true,
  isReadOnly: true,
  fitnessLevel: 'Intermediate',
  goal: 'Build Muscle',
  trainingDays: 6,
  units: 'kg',
  currentWeightKg: 74.5,
  age: 26,
  heightCm: 178,
  equipment: 'Commercial Gym',
  workoutDuration: '45 min',
  workoutSplit: 'Bro Split (Chest, Back, Legs, Shoulders, Arms)',
  futureWorkoutPlan: 'Chest Hypertrophy & Density',
  nextWorkoutDay: 'Tuesday',
};

export const startDemoOverviewSession = async () => {
  const data = await apiRequest('/auth/demo', {
    method: 'POST',
    body: JSON.stringify({ guestName: 'Demo User' }),
  });
  return {
    ...data?.user,
    name: data?.user?.name || 'Demo User',
    demoMode: true,
    isReadOnly: true,
  };
};

export const demoLogin = startDemoOverviewSession;

export const loginUser = async ({ email, password }) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { ...data.user };
};

export const signupUser = async ({ name, email, password, fitnessGoal, fitnessLevel, units }) => {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, fitnessGoal, fitnessLevel, units }),
  });
  return { ...data.user };
};

export const logoutUser = async () => {
  return await apiRequest('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const getCurrentUser = async () => {
  const data = await apiRequest('/auth/me');
  return data.user;
};
