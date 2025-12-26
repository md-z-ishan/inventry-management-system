const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const partnerRoutes = require('./partners');
const transactionRoutes = require('./transactions');
const inventoryRoutes = require('./inventory');
const adminRoutes = require('./adminRoutes');

// API version prefix
const API_PREFIX = '/api/v1';

// Route middleware
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/products`, productRoutes);
router.use(`${API_PREFIX}/categories`, categoryRoutes);
router.use(`${API_PREFIX}/inventory`, inventoryRoutes);
router.use(`${API_PREFIX}/partners`, partnerRoutes);
router.use(`${API_PREFIX}/transactions`, transactionRoutes);
router.use(`${API_PREFIX}/admin`, adminRoutes);

// Health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Inventory Management API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API documentation endpoint
router.get(`${API_PREFIX}/docs`, (req, res) => {
    res.status(200).json({
        success: true,
        endpoints: {
            auth: {
                login: 'POST /api/v1/auth/login',
                register: 'POST /api/v1/auth/register',
                logout: 'GET /api/v1/auth/logout',
                me: 'GET /api/v1/auth/me'
            },
            users: {
                list: 'GET /api/v1/users',
                create: 'POST /api/v1/users',
                get: 'GET /api/v1/users/:id',
                update: 'PUT /api/v1/users/:id',
                delete: 'DELETE /api/v1/users/:id'
            },
            products: {
                list: 'GET /api/v1/products',
                create: 'POST /api/v1/products',
                get: 'GET /api/v1/products/:id',
                update: 'PUT /api/v1/products/:id',
                delete: 'DELETE /api/v1/products/:id',
                updateStock: 'POST /api/v1/products/:id/stock',
                generateQR: 'POST /api/v1/products/:id/qrcode',
                getByQR: 'GET /api/v1/products/qr/:qrId'
            },
            categories: {
                list: 'GET /api/v1/categories',
                create: 'POST /api/v1/categories',
                get: 'GET /api/v1/categories/:id',
                update: 'PUT /api/v1/categories/:id',
                delete: 'DELETE /api/v1/categories/:id',
                hierarchy: 'GET /api/v1/categories/hierarchy'
            },
            inventory: {
                logs: 'GET /api/v1/inventory/logs',
                summary: 'GET /api/v1/inventory/summary',
                valuation: 'GET /api/v1/inventory/valuation',
                export: 'POST /api/v1/inventory/export',
                audit: 'GET /api/v1/inventory/audit'
            }
        }
    });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Cannot ${req.method} ${req.originalUrl}`
    });
});

module.exports = router;