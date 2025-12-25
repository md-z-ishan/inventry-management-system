const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateUserUpdate, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

// All routes require authentication
router.use(protect);

// Admin only routes
router.route('/')
    .get(authorize(ROLES.ADMIN), validatePagination, handleValidationErrors, userController.getUsers)
    .post(authorize(ROLES.ADMIN), userController.createUser);

router.route('/:id')
    .get(authorize(ROLES.ADMIN), userController.getUser)
    .put(authorize(ROLES.ADMIN), validateUserUpdate, handleValidationErrors, userController.updateUser)
    .delete(authorize(ROLES.ADMIN), userController.deleteUser);

router.get('/:id/activity', authorize(ROLES.ADMIN), userController.getUserActivity);

module.exports = router;