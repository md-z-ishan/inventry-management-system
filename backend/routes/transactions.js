const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(transactionController.getTransactions)
    .post(transactionController.createTransaction);

router.route('/:id')
    .get(transactionController.getTransaction);

router.route('/:id/status')
    .put(authorize('admin', 'manager'), transactionController.updateTransactionStatus);

module.exports = router;
