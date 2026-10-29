import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  register: (data) => api.post('/auth/register', data),
};

export const productsApi = {
  search: (params) => api.get('/products', { params }),
  getActive: () => api.get('/products/active'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  toggleStatus: (id) => api.patch(`/products/${id}/status`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getActive: () => api.get('/categories/active'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  deactivate: (id) => api.delete(`/categories/${id}`),
};

export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getByWarehouse: (whId) => api.get(`/inventory/warehouse/${whId}`),
  getLowStock: () => api.get('/inventory/low-stock'),
  getOutOfStock: () => api.get('/inventory/out-of-stock'),
  adjustStock: (data) => api.post('/inventory/adjustments', data),
  getMovements: (params) => api.get('/inventory/movements', { params }),
  getProductMovements: (productId) => api.get(`/inventory/movements/product/${productId}`),
};

export const suppliersApi = {
  getAll: () => api.get('/suppliers'),
  getActive: () => api.get('/suppliers/active'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
};

export const purchaseOrdersApi = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  approve: (id) => api.post(`/purchase-orders/${id}/approve`),
  receiveGoods: (data) => api.post('/purchase-orders/receipts', data),
};

export const salesApi = {
  processSale: (data) => api.post('/sales', data),
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  getByInvoice: (invoiceNumber) => api.get(`/sales/invoice/${invoiceNumber}`),
  processReturn: (data) => api.post('/sales/returns', data),
};

export const warehousesApi = {
  getAll: () => api.get('/warehouses'),
  getActive: () => api.get('/warehouses/active'),
  create: (data) => api.post('/warehouses', data),
  getAllStores: () => api.get('/warehouses/stores'),
  createStore: (data) => api.post('/warehouses/stores', data),
};

export const transfersApi = {
  getAll: (params) => api.get('/stock-transfers', { params }),
  getById: (id) => api.get(`/stock-transfers/${id}`),
  request: (data) => api.post('/stock-transfers', data),
  approve: (id) => api.post(`/stock-transfers/${id}/approve`),
  dispatch: (id) => api.post(`/stock-transfers/${id}/dispatch`),
  receive: (id) => api.post(`/stock-transfers/${id}/receive`),
};

export const reportsApi = {
  getDashboardMetrics: () => api.get('/reports/dashboard'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getInventoryValuation: () => api.get('/reports/inventory-valuation'),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getRoles: () => api.get('/users/roles'),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
};

export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
};

export const auditLogsApi = {
  getAll: (params) => api.get('/audit-logs', { params }),
};

export const aiApi = {
  getHealth: () => api.get('/ai/health'),
  generateForecast: (data) => api.post('/ai/forecasts', data),
  getReorderRecommendations: () => api.get('/ai/reorder-recommendations'),
  recalculateReplenishments: () => api.post('/ai/reorder-recommendations/recalculate'),
  chat: (data) => api.post('/ai/chat', data),
};

export default api;
