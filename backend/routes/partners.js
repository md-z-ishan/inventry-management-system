const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Suppliers
router.route('/suppliers')
    .get(partnerController.getSuppliers)
    .post(authorize('admin', 'manager'), partnerController.createSupplier);

router.route('/suppliers/:id')
    .get(partnerController.getSupplier)
    .put(authorize('admin', 'manager'), partnerController.updateSupplier)
    .delete(authorize('admin'), partnerController.deleteSupplier);

// Customers
router.route('/customers')
    .get(partnerController.getCustomers)
    .post(partnerController.createCustomer);

router.route('/customers/:id')
    .get(partnerController.getCustomer)
    .put(partnerController.updateCustomer)
    .delete(authorize('admin'), partnerController.deleteCustomer);

module.exports = router;
