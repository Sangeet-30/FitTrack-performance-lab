const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Store token strictly in memory for current tab session, NEVER in localStorage
let inMemoryToken = null;

// Clean up any legacy token that may have been stored in localStorage previously
try {
  localStorage.removeItem('fittrack_token');
} catch {
  // ignore storage errors
}

export function setAuthToken(token) {
  inMemoryToken = token;
  // Security: Stop storing the JWT in localStorage to prevent XSS exfiltration.
  try {
    localStorage.removeItem('fittrack_token');
  } catch {
    // ignore
  }
}

export function getAuthToken() {
  return inMemoryToken;
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Only attach Authorization header if in-memory token exists (fallback for non-cookie requests)
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Always include credentials so httpOnly cookies (fittrack_token) are automatically sent
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')) {
      setAuthToken(null);
      try {
        localStorage.removeItem('fittrack-auth-state');
        sessionStorage.clear();
      } catch {
        // ignore
      }
    }
    const error = new Error(payload?.message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
