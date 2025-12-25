const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const inventoryService = require('../services/inventoryService');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errorResponse');

// @desc    Get all transactions
// @route   GET /api/v1/transactions
// @access  Private
exports.getTransactions = asyncHandler(async (req, res, next) => {
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
        .populate('supplier', 'name')
        .populate('customer', 'name')
        .populate('items.product', 'name sku')
        .populate('createdBy', 'name')
        .sort('-createdAt');

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
});

// @desc    Get single transaction
// @route   GET /api/v1/transactions/:id
// @access  Private
exports.getTransaction = asyncHandler(async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.id)
        .populate('supplier')
        .populate('customer')
        .populate('items.product')
        .populate('createdBy', 'name email');

    if (!transaction) throw new NotFoundError('Transaction');
    res.status(200).json({ success: true, data: transaction });
});

// @desc    Create transaction
// @route   POST /api/v1/transactions
// @access  Private
exports.createTransaction = asyncHandler(async (req, res, next) => {
    const { type, items, status } = req.body;

    // Verify items availability for SALES
    if (type === 'SALE') {
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) throw new NotFoundError(`Product ${item.product} not found`);
            if (product.quantity < item.quantity) {
                throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
            }
        }
    }

    req.body.createdBy = req.user._id;
    const transaction = await Transaction.create(req.body);

    // If status is COMPLETED immediately, update inventory
    if (status === 'COMPLETED') {
        const action = type === 'PURCHASE' ? 'STOCK_IN' : 'STOCK_OUT';
        const batchUpdates = items.map(item => ({
            productId: item.product,
            action,
            quantity: item.quantity,
            reason: `${type} - ${transaction.invoiceNumber}`,
            transactionType: type.toLowerCase(),
            relatedDocument: transaction._id
        }));

        await inventoryService.batchUpdateStock(batchUpdates, req.user);
    }

    res.status(201).json({ success: true, data: transaction });
});

// @desc    Update transaction status
// @route   PUT /api/v1/transactions/:id/status
// @access  Private
exports.updateTransactionStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) throw new NotFoundError('Transaction');
    if (transaction.status === 'COMPLETED') throw new ValidationError('Cannot modify completed transaction');

    transaction.status = status;
    transaction.updatedBy = req.user._id;
    await transaction.save();

    // If status changed to COMPLETED, update inventory
    if (status === 'COMPLETED') {
        const action = transaction.type === 'PURCHASE' ? 'STOCK_IN' : 'STOCK_OUT';
        const batchUpdates = transaction.items.map(item => ({
            productId: item.product,
            action,
            quantity: item.quantity,
            reason: `${transaction.type} - ${transaction.invoiceNumber}`,
            transactionType: transaction.type.toLowerCase(),
            relatedDocument: transaction._id
        }));

        await inventoryService.batchUpdateStock(batchUpdates, req.user);
    }

    res.status(200).json({ success: true, data: transaction });
});
