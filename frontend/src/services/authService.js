import { apiRequest, setAuthToken } from './api.js';

export const demoAuthUser = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@fittrack.app',
  demoMode: true,
  isReadOnly: true,
  fitnessLevel: 'Intermediate',
  goal: 'Build Muscle',
  trainingDays: 4,
  units: 'kg',
  currentWeightKg: 72,
};

export const startDemoOverviewSession = async () => {
  try {
    const data = await apiRequest('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ guestName: 'Demo User' }),
    });
    if (data?.token) {
      setAuthToken(data.token);
    }
    return {
      ...data?.user,
      name: 'Demo User',
      demoMode: true,
      isReadOnly: true,
    };
  } catch {
    setAuthToken('demo-token');
    return demoAuthUser;
  }
};

export const demoLogin = startDemoOverviewSession;

export const loginUser = async ({ email, password }) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) {
    setAuthToken(data.token);
  }
  return { ...data.user };
};

export const signupUser = async ({ name, email, password, fitnessGoal, fitnessLevel, units }) => {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, fitnessGoal, fitnessLevel, units }),
  });
  if (data?.token) {
    setAuthToken(data.token);
  }
  return { ...data.user };
};

export const logoutUser = async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST', body: JSON.stringify({}) });
  } finally {
    setAuthToken(null);
  }
};

export const getCurrentUser = async () => {
  const data = await apiRequest('/auth/me');
  return data.user;
};
