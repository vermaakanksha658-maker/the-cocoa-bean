import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    let cancelled = false;
    api
      .getMe()
      .then(({ user }) => {
        if (!cancelled) setCustomer(user);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // When the customer becomes available, continue any pending action.
  useEffect(() => {
    if (!customer || !pending) return;
    const action = pending;
    setPending(null);
    writePending(null);
    window.dispatchEvent(new CustomEvent('cb:continue', { detail: action }));
  }, [customer, pending]);

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
    setCustomer(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user, devVerifyLink } = await api.register(name, email, password);
    setCustomer(user);
    return { user, devVerifyLink };
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
    setCustomer(null);
  }, []);

  const setCustomerFromVerify = useCallback((user) => setCustomer(user), []);

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
