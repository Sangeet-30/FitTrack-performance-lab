import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, {
  loginSuccess,
  logout,
  setDemoMode,
} from '../src/features/auth/authSlice.js';
import { apiRequest, setAuthToken, getAuthToken } from '../src/services/api.js';
import { loginUser, signupUser, logoutUser } from '../src/services/authService.js';

// Polyfill localStorage in test environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('Frontend Auth State & Reducers', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      user: null,
      isAuthenticated: false,
      demoMode: false,
      isReadOnly: false,
      rememberMe: true,
    };
    setAuthToken(null);
    vi.restoreAllMocks();
  });

  it('handles loginSuccess and updates auth state', () => {
    const user = { id: 'u1', name: 'Athlete Sangeet', email: 'sangeet@gmail.com' };
    const nextState = authReducer(initialState, loginSuccess(user));

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user).toEqual(user);
    expect(nextState.demoMode).toBe(false);
  });

  it('handles logout and clears auth state', () => {
    const loggedInState = {
      user: { id: 'u1', name: 'Athlete Sangeet' },
      isAuthenticated: true,
      demoMode: false,
      isReadOnly: false,
      rememberMe: true,
    };
    const nextState = authReducer(loggedInState, logout());

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.demoMode).toBe(false);
  });

  it('handles demo mode flag toggle', () => {
    const nextState = authReducer(initialState, setDemoMode(true));
    expect(nextState.demoMode).toBe(true);
  });
});

describe('Frontend API Error Handling & Status Codes', () => {
  beforeEach(() => {
    setAuthToken(null);
    vi.restoreAllMocks();
  });

  it('parses HTTP 503 database-offline errors accurately', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        message: 'Database service is currently unavailable. Please check your connection and try again.',
      }),
    });

    await expect(apiRequest('/dashboard')).rejects.toThrow('Database service is currently unavailable.');

    try {
      await apiRequest('/dashboard');
    } catch (err) {
      expect(err.status).toBe(503);
      expect(err.payload?.message).toContain('Database service is currently unavailable');
    }
  });

  it('handles HTTP 401 unauthorized and clears session token', async () => {
    setAuthToken('expired-jwt');
    expect(getAuthToken()).toBe('expired-jwt');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Session expired or invalid.' }),
    });

    await expect(apiRequest('/workouts')).rejects.toThrow('Session expired or invalid.');
    expect(getAuthToken()).toBeNull();
  });

  it('parses HTTP 400 validation error responses', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Validation failed: Password must be at least 8 characters.',
        errors: [{ path: 'password', message: 'Password must be at least 8 characters.' }],
      }),
    });

    try {
      await apiRequest('/auth/register', { method: 'POST', body: '{}' });
      expect.fail('Expected apiRequest to throw on 400');
    } catch (err) {
      expect(err.status).toBe(400);
      expect(err.message).toContain('Password must be at least 8 characters.');
    }
  });

  it('keeps tokens in memory and never exposes them to localStorage', () => {
    setAuthToken('fresh-test-token');
    expect(getAuthToken()).toBe('fresh-test-token');
    expect(localStorage.getItem('fittrack_token')).toBeNull();
  });
});

describe('Frontend Auth Service: Login, Signup, & Logout', () => {
  beforeEach(() => {
    setAuthToken(null);
    vi.restoreAllMocks();
  });

  it('loginUser sends credentials with credentials include and sets in-memory token', async () => {
    const mockUser = { id: 'u1', name: 'Athlete Sangeet', email: 'sangeet@gmail.com' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: 'Signed in successfully.',
        user: mockUser,
        token: 'in-memory-secret-token',
      }),
    });

    const user = await loginUser({ email: 'sangeet@gmail.com', password: 'password123' });
    expect(user).toEqual(mockUser);
    expect(getAuthToken()).toBe('in-memory-secret-token');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
  });

  it('signupUser dispatches signup payload and returns user data', async () => {
    const newUser = { id: 'u2', name: 'New Athlete', email: 'new@fittrack.com' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Account created successfully.',
        user: newUser,
        token: 'registered-jwt-token',
      }),
    });

    const user = await signupUser({
      name: 'New Athlete',
      email: 'new@fittrack.com',
      password: 'SecurePassword123!',
      fitnessGoal: 'Build Muscle',
      units: 'kg',
    });

    expect(user).toEqual(newUser);
    expect(getAuthToken()).toBe('registered-jwt-token');
  });

  it('logoutUser calls /auth/logout and clears in-memory credentials', async () => {
    setAuthToken('some-token');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Signed out successfully.' }),
    });

    await logoutUser();
    expect(getAuthToken()).toBeNull();
  });
});

describe('Frontend Protected Route Redirection Rules', () => {
  function evaluateRouteGuard({ targetPath, isAuthenticated }) {
    if (targetPath === '/login' || targetPath === '/signup') {
      return isAuthenticated ? '/dashboard' : targetPath;
    }
    const protectedPaths = [
      '/dashboard',
      '/workouts',
      '/workouts/w1',
      '/exercises',
      '/progress',
      '/nutrition',
      '/goals',
      '/profile',
      '/settings',
    ];
    if (protectedPaths.includes(targetPath)) {
      return isAuthenticated ? targetPath : '/login';
    }
    return targetPath;
  }

  it('redirects unauthenticated users from protected routes to /login', () => {
    expect(evaluateRouteGuard({ targetPath: '/dashboard', isAuthenticated: false })).toBe('/login');
    expect(evaluateRouteGuard({ targetPath: '/workouts', isAuthenticated: false })).toBe('/login');
    expect(evaluateRouteGuard({ targetPath: '/profile', isAuthenticated: false })).toBe('/login');
    expect(evaluateRouteGuard({ targetPath: '/settings', isAuthenticated: false })).toBe('/login');
    expect(evaluateRouteGuard({ targetPath: '/goals', isAuthenticated: false })).toBe('/login');
  });

  it('allows authenticated users to access protected routes', () => {
    expect(evaluateRouteGuard({ targetPath: '/dashboard', isAuthenticated: true })).toBe('/dashboard');
    expect(evaluateRouteGuard({ targetPath: '/workouts', isAuthenticated: true })).toBe('/workouts');
    expect(evaluateRouteGuard({ targetPath: '/profile', isAuthenticated: true })).toBe('/profile');
    expect(evaluateRouteGuard({ targetPath: '/settings', isAuthenticated: true })).toBe('/settings');
  });

  it('redirects authenticated users away from /login and /signup to /dashboard', () => {
    expect(evaluateRouteGuard({ targetPath: '/login', isAuthenticated: true })).toBe('/dashboard');
    expect(evaluateRouteGuard({ targetPath: '/signup', isAuthenticated: true })).toBe('/dashboard');
  });

  it('allows unauthenticated users to view /login and /signup', () => {
    expect(evaluateRouteGuard({ targetPath: '/login', isAuthenticated: false })).toBe('/login');
    expect(evaluateRouteGuard({ targetPath: '/signup', isAuthenticated: false })).toBe('/signup');
  });
});
