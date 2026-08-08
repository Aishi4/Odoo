const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Custom fetch wrapper to interact with the Rental Management Express Backend
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ success: boolean; message?: string; data?: T; errors?: any }> {
  const { token, headers = {}, ...customConfig } = options;

  // Retrieve JWT token from localStorage if in client environment
  const authToken =
    token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method: customConfig.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred while connecting to backend',
        errors: data.errors || null,
      };
    }

    return data;
  } catch (error: any) {
    console.error('API Fetch Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to communicate with backend API server',
    };
  }
}

// Authentication APIs
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData: { name: string; email: string; password: string; role?: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => apiFetch('/users/profile'),
};

// Catalog & Product APIs
export const catalogApi = {
  getProducts: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/products${queryString}`);
  },
  getProductById: (id: string) => apiFetch(`/products/${id}`),
  getRentalPeriods: () => apiFetch('/rental-periods'),
};

// Cart APIs
export const cartApi = {
  getCart: () => apiFetch('/cart'),
  addItem: (itemData: { product_id: string; variant_id?: string; rental_period_id: string; start_date: string; end_date: string; quantity?: number }) =>
    apiFetch('/cart/items', { method: 'POST', body: JSON.stringify(itemData) }),
  updateItem: (itemId: string, itemData: any) =>
    apiFetch(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify(itemData) }),
  removeItem: (itemId: string) =>
    apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => apiFetch('/cart', { method: 'DELETE' }),
};

// Order & Payment APIs
export const orderApi = {
  createOrder: (orderData: { delivery_method?: string; shipping_address?: string; notes?: string }) =>
    apiFetch('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: () => apiFetch('/orders'),
  getOrderById: (orderId: string) => apiFetch(`/orders/${orderId}`),
  getPaymentSummary: (orderId: string) => apiFetch(`/orders/${orderId}/payment-summary`),
  payOrder: (orderId: string, payment_method: string = 'ONLINE') =>
    apiFetch(`/orders/${orderId}/payment`, { method: 'POST', body: JSON.stringify({ payment_method }) }),
};

// Admin Operations & Dashboard APIs
export const adminApi = {
  getDashboardOverview: () => apiFetch('/admin/dashboard/overview'),
  getActiveRentals: () => apiFetch('/admin/dashboard/active-rentals'),
  getDueToday: () => apiFetch('/admin/dashboard/due-today'),
  getUpcomingPickups: (days: number = 7) => apiFetch(`/admin/dashboard/upcoming-pickups?days=${days}`),
  getUpcomingReturns: (days: number = 7) => apiFetch(`/admin/dashboard/upcoming-returns?days=${days}`),
  getOverdueRentals: () => apiFetch('/admin/dashboard/overdue-rentals'),
  getRevenue: (from?: string, to?: string) => {
    let query = '';
    if (from || to) {
      const q = new URLSearchParams();
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      query = `?${q.toString()}`;
    }
    return apiFetch(`/admin/dashboard/revenue${query}`);
  },
  getPriorities: () => apiFetch('/admin/dashboard/priorities'),
  getRentalStatusSummary: () => apiFetch('/admin/dashboard/rental-status'),
  getRevenueSummary: (period: string = 'monthly') => apiFetch(`/admin/dashboard/revenue-summary?period=${period}`),
};
