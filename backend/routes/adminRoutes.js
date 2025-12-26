const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getSystemLogs } = require('../controllers/adminController');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/stats', getDashboardStats);
router.get('/logs', getSystemLogs);

module.exports = router;
