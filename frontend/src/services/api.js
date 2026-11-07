const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Clean up any legacy token that may have been stored in localStorage previously
try {
  localStorage.removeItem('fittrack_token');
} catch {
  // ignore storage errors
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Browser authentication uses secure httpOnly cookie session with credentials: 'include'
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));

  if (!response.ok) {
    if (
      response.status === 401 &&
      !path.startsWith('/auth/login') &&
      !path.startsWith('/auth/register') &&
      !path.startsWith('/auth/signup')
    ) {
      try {
        localStorage.removeItem('fittrack-auth-state');
        sessionStorage.clear();
      } catch {
        // ignore
      }
      const eventTarget = typeof window !== 'undefined' ? window : globalThis;
      if (typeof eventTarget?.dispatchEvent === 'function') {
        eventTarget.dispatchEvent(new CustomEvent('fittrack:unauthorized'));
      }
    }
    const error = new Error(payload?.message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
