import { useEffect, useState } from 'react';

const THEME_KEY = 'fittrack_theme';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark'; // Default to sleek dark mode
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);

    const handleThemeEvent = (e) => {
      if (e.detail && (e.detail === 'dark' || e.detail === 'light')) {
        setTheme(e.detail);
      }
    };

    window.addEventListener('fittrack:theme-change', handleThemeEvent);
    return () => window.removeEventListener('fittrack:theme-change', handleThemeEvent);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fittrack:theme-change', { detail: nextTheme }));
    }
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
