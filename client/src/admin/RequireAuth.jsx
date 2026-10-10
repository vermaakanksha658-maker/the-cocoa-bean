import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getMe } from './api.js';
import { useAdminTheme } from './adminTheme.js';

function RequireAuth({ children }) {
  const [state, setState] = useState('loading');
  const location = useLocation();
  const { theme } = useAdminTheme();

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(() => {
        if (!cancelled) setState('ok');
      })
      .catch(() => {
        if (!cancelled) setState('denied');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="admin-page admin-loading" data-theme={theme}>
        <span className="admin-pulse-dot"></span>
        <p>Checking session…</p>
      </div>
    );
  }
  if (state === 'denied') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default RequireAuth;