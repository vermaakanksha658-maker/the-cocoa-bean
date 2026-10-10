import { useCallback, useState } from 'react';

const STORAGE_KEY = 'cocoa_admin_theme';

export function getSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function useAdminTheme() {
  const [theme, setTheme] = useState(getSavedTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}