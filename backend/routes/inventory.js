const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const { validatePagination, handleValidationErrors } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

// All routes require authentication
router.use(protect);

// Logs
router.route('/logs')
    .get(validatePagination, handleValidationErrors, inventoryController.getInventoryLogs);

router.get('/logs/:id', inventoryController.getInventoryLog);

// Summary and reports
router.get('/summary', inventoryController.getInventorySummary);
router.get('/valuation', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), inventoryController.getInventoryValuation);
router.get('/analysis/movement', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), inventoryController.getStockMovementAnalysis);

// Export
router.post('/export', authorize(ROLES.ADMIN, ROLES.MANAGER), inventoryController.exportInventory);

// Audit logs
router.get('/audit', authorize(ROLES.ADMIN), inventoryController.getAuditLogs);

module.exports = router;