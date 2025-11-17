// Centralized API helper for consistent API calls
import api from './axios';

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
};

// Transaction APIs
export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transactionData) => api.post('/transactions', transactionData),
  update: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  delete: (id) => api.delete(`/transactions/${id}`),
  getBuyerTransactions: () => api.get('/transactions/buyer'),
  getSellerTransactions: () => api.get('/transactions/seller'),
  confirmBuyer: (id) => api.post(`/transactions/${id}/confirm-buyer`),
  confirmSeller: (id) => api.post(`/transactions/${id}/confirm-seller`),
  startInspection: (id) => api.post(`/transactions/${id}/start-inspection`),
  completeInspection: (id) => api.post(`/transactions/${id}/complete-inspection`),
  requestDispute: (id, reason) => api.post(`/transactions/${id}/dispute`, { reason }),
  resolveDispute: (id, resolution) => api.post(`/transactions/${id}/resolve-dispute`, resolution),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
  activate: (id) => api.put(`/users/${id}/activate`),
};

// Payment/Mpesa APIs
export const paymentAPI = {
  initiatePayment: (transactionId, paymentData) => api.post(`/payments/initiate/${transactionId}`, paymentData),
  checkPaymentStatus: (paymentId) => api.get(`/payments/status/${paymentId}`),
  handleCallback: (callbackData) => api.post('/payments/callback', callbackData),
  getPaymentHistory: () => api.get('/payments/history'),
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllTransactions: () => api.get('/admin/transactions'),
  getAllUsers: () => api.get('/admin/users'),
  getPayouts: () => api.get('/admin/payouts'),
  processPayout: (payoutData) => api.post('/admin/payouts/process', payoutData),
  getDisputes: () => api.get('/admin/disputes'),
  resolveDispute: (disputeId, resolution) => api.post(`/admin/disputes/${disputeId}/resolve`, resolution),
};

// Health check API
export const healthAPI = {
  check: () => api.get('/health'),
};

// Generic API methods
export const genericAPI = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

// Export the main api instance for custom requests
export { api };