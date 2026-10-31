import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store.js';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import { applyTheme, getInitialTheme } from './utils/theme.js';
import './index.css';
import App from './App.jsx';

try {
  applyTheme(getInitialTheme());
} catch (e) {
  console.warn('Theme initialization fallback:', e);
}

const rootElement = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <Provider store={store}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (err) {
    console.error('Fatal initialization error:', err);
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#f4f4f5;font-family:sans-serif;padding:24px;">
        <div style="background:#18181b;padding:32px;border-radius:16px;border:1px solid #27272a;max-width:440px;text-align:center;">
          <h2 style="color:#ef4444;margin-bottom:12px;">FitTrack Encountered an Issue</h2>
          <p style="color:#a1a1aa;font-size:14px;margin-bottom:20px;">The app could not initialize properly. Click below to clear stored state and reload.</p>
          <button onclick="localStorage.clear();sessionStorage.clear();window.location.reload();" style="background:#ef4444;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">
            Reset &amp; Reload App
          </button>
        </div>
      </div>
    `;
  }
}
