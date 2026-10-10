export async function apiRequest(url, options = {}) {
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

export const getMe = () => apiRequest('/api/admin/me');
export const login = (username, password) =>
  apiRequest('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
export const logout = () => apiRequest('/api/admin/logout', { method: 'POST' });

export const getStats = () => apiRequest('/api/admin/stats');

export const getMenuItems = () => apiRequest('/api/admin/menu');
export const createMenuItem = (payload) => apiRequest('/api/admin/menu', { method: 'POST', body: JSON.stringify(payload) });
export const updateMenuItem = (id, payload) =>
  apiRequest(`/api/admin/menu/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteMenuItem = (id) => apiRequest(`/api/admin/menu/${id}`, { method: 'DELETE' });

export const getReservations = () => apiRequest('/api/admin/reservations');
export const updateReservationStatus = (id, status) =>
  apiRequest(`/api/admin/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const getOrders = () => apiRequest('/api/orders');
export const updateOrderStatus = (id, status) =>
  apiRequest(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const getReviews = () => apiRequest('/api/admin/reviews');
export const updateReviewStatus = (id, status) =>
  apiRequest(`/api/admin/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteReview = (id) => apiRequest(`/api/admin/reviews/${id}`, { method: 'DELETE' });