const resolveApiBase = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // In production builds or live browser environments, route all requests via the first-party /api rewrite proxy.
  // This turns authentication into a first-party cookie transaction, preventing third-party cookie
  // blocking by Apple WebKit ITP on iOS Safari, Chrome for iOS, and privacy-hardened mobile browsers.
  if (
    typeof window !== 'undefined' &&
    (import.meta.env.PROD || (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'))
  ) {
    return '/api';
  }

  return (envUrl || 'http://localhost:5000/api').replace(/\/$/, '');
};

const API_BASE = resolveApiBase();

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
        sessionStorage.removeItem('fittrack-auth-state');
        sessionStorage.removeItem('fittrack_token');
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
