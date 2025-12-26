import axios from './axios';

// Auth services
export const authAPI = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (userData) => axios.post('/auth/register', userData),
  logout: () => axios.get('/auth/logout'),
  getMe: () => axios.get('/auth/me'),
  updateDetails: (userData) => axios.put('/auth/updatedetails', userData),
  updatePassword: (passwords) => axios.put('/auth/updatepassword', passwords),
  updatePreferences: (preferences) => axios.put('/auth/preferences', preferences),
  uploadAvatar: (formData) => axios.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  logoutAll: () => axios.post('/auth/logoutall'),
};

// Product services
export const productAPI = {
  getProducts: (params) => axios.get('/products', { params }),
  getProduct: (id) => axios.get(`/products/${id}`),
  createProduct: (productData) => axios.post('/products', productData),
  updateProduct: (id, productData) => axios.put(`/products/${id}`, productData),
  deleteProduct: (id) => axios.delete(`/products/${id}`),
  updateStock: (id, stockData) => axios.post(`/products/${id}/stock`, stockData),
  generateQR: (id) => axios.post(`/products/${id}/qrcode`),
  getProductByQR: (qrId) => axios.get(`/products/qr/${qrId}`),
  getLowStockProducts: () => axios.get('/products/low-stock'),
  getProductLogs: (id, params) => axios.get(`/products/${id}/logs`, { params }),
};

// Category services
export const categoryAPI = {
  getCategories: (params) => axios.get('/categories', { params }),
  getCategory: (id) => axios.get(`/categories/${id}`),
  createCategory: (categoryData) => axios.post('/categories', categoryData),
  updateCategory: (id, categoryData) => axios.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => axios.delete(`/categories/${id}`),
  getCategoryHierarchy: () => axios.get('/categories/hierarchy'),
};

// Inventory services
export const inventoryAPI = {
  getInventoryLogs: (params) => axios.get('/inventory/logs', { params }),
  getInventorySummary: () => axios.get('/inventory/summary'),
  getInventoryValuation: () => axios.get('/inventory/valuation'),
  exportInventory: (exportData) => axios.post('/inventory/export', exportData, {
    responseType: 'blob',
  }),
  getAuditLogs: (params) => axios.get('/inventory/audit', { params }),
  getStockMovementAnalysis: (params) => axios.get('/inventory/analysis/movement', { params }),
};

// Partner API
export const partnerAPI = {
  // Suppliers
  getSuppliers: () => axios.get('/partners/suppliers'),
  getSupplier: (id) => axios.get(`/partners/suppliers/${id}`),
  createSupplier: (data) => axios.post('/partners/suppliers', data),
  updateSupplier: (id, data) => axios.put(`/partners/suppliers/${id}`, data),
  deleteSupplier: (id) => axios.delete(`/partners/suppliers/${id}`),

  // Customers
  getCustomers: () => axios.get('/partners/customers'),
  getCustomer: (id) => axios.get(`/partners/customers/${id}`),
  createCustomer: (data) => axios.post('/partners/customers', data),
  updateCustomer: (id, data) => axios.put(`/partners/customers/${id}`, data),
  deleteCustomer: (id) => axios.delete(`/partners/customers/${id}`)
};

// Transaction API
export const transactionAPI = {
  getTransactions: (params) => axios.get('/transactions', { params }),
  getTransaction: (id) => axios.get(`/transactions/${id}`),
  createTransaction: (data) => axios.post('/transactions', data),
  updateStatus: (id, status) => axios.put(`/transactions/${id}/status`, { status })
};

// User services (admin only)
export const userAPI = {
  getUsers: (params) => axios.get('/users', { params }),
  getUser: (id) => axios.get(`/users/${id}`),
  createUser: (userData) => axios.post('/users', userData),
  updateUser: (id, userData) => axios.put(`/users/${id}`, userData),
  deleteUser: (id) => axios.delete(`/users/${id}`),
  getUserActivity: (id, params) => axios.get(`/users/${id}/activity`, { params }),
};

// Admin Services
export const adminAPI = {
  getStats: () => axios.get('/admin/stats'),
  getLogs: (params) => axios.get('/admin/logs', { params }),
};