class ErrorResponse extends Error {
    constructor(message, statusCode, errorCode = 'SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Specific error classes
class ValidationError extends ErrorResponse {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

class AuthenticationError extends ErrorResponse {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR');
    }
}

class AuthorizationError extends ErrorResponse {
    constructor(message = 'Not authorized to access this resource') {
        super(message, 403, 'FORBIDDEN');
    }
}

class NotFoundError extends ErrorResponse {
    constructor(resource) {
        super(`${resource || 'Resource'} not found`, 404, 'NOT_FOUND');
    }
}

class DuplicateError extends ErrorResponse {
    constructor(field) {
        super(`${field} already exists`, 409, 'DUPLICATE_ERROR');
    }
}

module.exports = {
    ErrorResponse,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    DuplicateError
};