const { ErrorResponse } = require('../utils/errorResponse');
const { logger } = require('../utils/logger');
const { auditLogger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // Log to audit log if it's an authentication/authorization error
    if (err.statusCode === 401 || err.statusCode === 403) {
        auditLogger.logSecurity(
            'AUTH_FAILURE',
            req.user?._id || 'anonymous',
            req.ip,
            req.get('user-agent')
        );
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new ErrorResponse(message, 400, 'DUPLICATE_ERROR');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(messages.join(', '), 400, 'VALIDATION_ERROR');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ErrorResponse('Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new ErrorResponse('Token expired', 401);
    }

    // Custom Validation Error (express-validator)
    if (err.statusCode === 400 && err.errors) {
        // If it's our custom ValidationError with an errors array
        const msg = err.errors.map(e => e.message).join('. ');
        error = new ErrorResponse(msg, 400);
        error.errors = err.errors;
    }

    // Send error response
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        errors: error.errors || undefined, // Include detailed errors if available
        errorCode: error.errorCode || 'SERVER_ERROR',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString()
    });
};

module.exports = errorHandler;