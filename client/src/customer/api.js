async function request(url, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    ...rest,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const getMe = () => request('/api/auth/me');
export const login = (email, password) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (name, email, password) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
export const logout = () => request('/api/auth/logout', { method: 'POST' });
export const verifyEmail = (token) => request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
export const resendVerification = (email) =>
  request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(email ? { email } : {}),
  });
export const forgotPassword = (email) =>
  request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (token, password) =>
  request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
export const getMyOrders = () => request('/api/orders/mine');

export const googleLoginUrl = '/api/auth/google';
