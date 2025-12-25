const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validateCategory, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(validatePagination, handleValidationErrors, categoryController.getCategories)
    .post(authorize(ROLES.ADMIN, ROLES.MANAGER), validateCategory, handleValidationErrors, categoryController.createCategory);

router.route('/:id')
    .get(categoryController.getCategory)
    .put(authorize(ROLES.ADMIN, ROLES.MANAGER), validateCategory, handleValidationErrors, categoryController.updateCategory)
    .delete(authorize(ROLES.ADMIN), categoryController.deleteCategory);

router.get('/hierarchy', categoryController.getCategoryHierarchy);

module.exports = router;