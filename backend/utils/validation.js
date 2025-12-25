// const { validationResult } = require('express-validator');
// const { ValidationError } = require('./errorResponse');

// const validateRequest = (req, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         const errorMessages = errors.array().map(err => ({
//             field: err.param,
//             message: err.msg,
//             value: err.value
//         }));
//         return next(new ValidationError('Validation failed', errorMessages));
//     }
//     return true;
// };

// const paginationValidation = [
//     (req, res, next) => {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 20;
//         const maxLimit = 100;

//         req.pagination = {
//             page: page > 0 ? page : 1,
//             limit: limit > 0 && limit <= maxLimit ? limit : 20,
//             skip: (page - 1) * limit
//         };
//         next();
//     }
// ];

// const sortValidation = (allowedFields = []) => {
//     return (req, res, next) => {
//         const sortBy = req.query.sortBy || 'createdAt';
//         const sortOrder = req.query.sortOrder || 'desc';

//         if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
//             return next(new ValidationError(`Invalid sort field. Allowed: ${allowedFields.join(', ')}`));
//         }

//         req.sort = {
//             [sortBy]: sortOrder === 'desc' ? -1 : 1
//         };
//         next();
//     };
// };

// module.exports = {
//     validateRequest,
//     paginationValidation,
//     sortValidation
// };





const { body, validationResult } = require('express-validator');
const { ValidationError } = require('./errorResponse');

// 🔹 Handle validation result
const handleValidationErrors = (req, res, next) => {
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

// 🔹 Auth validations
const validateRegister = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 chars')
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
];

// 🔹 Pagination
const paginationValidation = [
    (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const maxLimit = 100;

        req.pagination = {
            page: page > 0 ? page : 1,
            limit: limit > 0 && limit <= maxLimit ? limit : 20,
            skip: (page - 1) * limit
        };
        next();
    }
];

// 🔹 Sorting
const sortValidation = (allowedFields = []) => {
    return (req, res, next) => {
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
            return next(
                new ValidationError(`Invalid sort field. Allowed: ${allowedFields.join(', ')}`)
            );
        }

        req.sort = {
            [sortBy]: sortOrder === 'desc' ? -1 : 1
        };
        next();
    };
};

module.exports = {
    validateRegister,
    validateLogin,
    handleValidationErrors,
    paginationValidation,
    sortValidation
};
