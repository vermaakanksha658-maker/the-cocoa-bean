import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as api from './api.js';
import AuthModal from './AuthModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import './customer.css';

const CustomerContext = createContext(null);

const PENDING_KEY = 'cb_pending_action';

function readPending() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePending(value) {
  try {
    if (value) sessionStorage.setItem(PENDING_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function CustomerProvider({ children }) {
  const toast = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [authReason, setAuthReason] = useState('');
  const [pending, setPending] = useState(readPending);
  // Bumped whenever the session changes (login/logout/verify) so in-flight
  // /me responses from the OLD session can't overwrite the new one.
  const sessionGen = useRef(0);

  // Google OAuth returns here with ?auth=... — show feedback and clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (!auth) return;
    if (auth === 'google-ok') toast.push('Welcome back!', 'success');
    else if (auth === 'google-cancelled') toast.push('Google sign-in cancelled.', 'info');
    else toast.push('Google sign-in failed. Please try again.', 'error');
    window.history.replaceState({}, '', window.location.pathname);
  }, [toast]);

  const fetchMe = useCallback(() => {
    const gen = sessionGen.current;
    return api
      .getMe()
      .then(({ user }) => {
        // Ignore if session changed (login/logout/verify) while this was in flight.
        if (gen === sessionGen.current) setCustomer(user);
      })
      .catch(() => {
        if (gen === sessionGen.current) setCustomer(null);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMe().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  // Another tab may have logged in/out or verified — re-sync when this tab
  // becomes visible again so the navbar never shows a stale name.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchMe();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [fetchMe]);

  // When the customer becomes available, continue any pending action.
  useEffect(() => {
    if (!customer || !pending) return;
    const action = pending;
    setPending(null);
    writePending(null);
    window.dispatchEvent(new CustomEvent('cb:continue', { detail: action }));
  }, [customer, pending]);

  // A session can start in another tab (e.g. the verification link). When that
  // happens, close the auth modal here too so this tab doesn't show a stale form.
  const prevCustomerId = useRef(null);
  useEffect(() => {
    const id = customer?.id || null;
    if (id && id !== prevCustomerId.current) setAuthOpen(false);
    prevCustomerId.current = id;
  }, [customer]);

  const openAuth = useCallback((opts = {}) => {
    setAuthTab(opts.tab || 'login');
    setAuthReason(opts.reason || '');
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const beginPending = useCallback((type) => {
    const action = { type };
    setPending(action);
    writePending(action);
  }, []);

  const clearPending = useCallback(() => {
    setPending(null);
    writePending(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user } = await api.login(email, password);
    sessionGen.current += 1;
    setCustomer(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    return api.register(name, email, password);
  }, []);

  const loginWithGoogle = useCallback(
    (type) => {
      if (type) beginPending(type);
      window.location.href = api.googleLoginUrl;
    },
    [beginPending]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    sessionGen.current += 1;
    setCustomer(null);
  }, []);

  const setCustomerFromVerify = useCallback((user) => {
    sessionGen.current += 1;
    setCustomer(user);
  }, []);

  const value = {
    customer,
    loading,
    authOpen,
    openAuth,
    closeAuth,
    beginPending,
    clearPending,
    login,
    register,
    loginWithGoogle,
    logout,
    setCustomerFromVerify,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
      <AuthModal />
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
