const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errorResponse');

// Common validation chains
exports.validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('role')
        .optional()
        .isIn(['admin', 'manager', 'staff', 'viewer'])
        .withMessage('Invalid role')
];

exports.validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),

    body('password')
        .notEmpty().withMessage('Password is required')
];

exports.validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),

    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID'),

    body('quantity')
        .optional()
        .isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),

    body('minStockLevel')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum stock level must be a positive number'),

    body('costPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),

    body('sellingPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),

    body('unit')
        .optional()
        .isIn(['piece', 'kg', 'liter', 'meter', 'box', 'pack', 'dozen', 'unit'])
        .withMessage('Invalid unit'),

    body('location.warehouse')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Warehouse name cannot exceed 100 characters'),

    body('location.aisle')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Aisle cannot exceed 50 characters'),

    body('location.shelf')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Shelf cannot exceed 50 characters'),

    body('location.bin')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Bin cannot exceed 50 characters')
];

exports.validateStockUpdate = [
    body('action')
        .notEmpty().withMessage('Action is required')
        .isIn(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER'])
        .withMessage('Invalid action'),

    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),

    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),

    body('transactionType')
        .optional()
        .isIn(['purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer'])
        .withMessage('Invalid transaction type'),

    body('relatedDocument')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Document reference cannot exceed 100 characters')
];

exports.validateCategory = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

    body('parentCategory')
        .optional()
        .isMongoId().withMessage('Invalid parent category ID')
];

exports.validateUserUpdate = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('role')
        .optional()
        .isIn(['admin', 'manager', 'staff', 'viewer'])
        .withMessage('Invalid role'),

    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number')
];

// Query validation
exports.validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
        .toInt(),

    query('sortBy')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Sort field cannot exceed 50 characters'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// Validation middleware
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }));
        return next(new ValidationError('Validation failed', errorMessages));
    }
    next();
};