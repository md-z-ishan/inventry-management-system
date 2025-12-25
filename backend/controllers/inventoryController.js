const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const inventoryService = require('../services/inventoryService');
const ExportUtils = require('../utils/exportUtils');
const { NotFoundError } = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { INVENTORY_ACTIONS } = require('../config/constants');

const exportUtils = new ExportUtils();

// @desc    Get all inventory logs
// @route   GET /api/v1/inventory/logs
// @access  Private
exports.getInventoryLogs = asyncHandler(async (req, res, next) => {
    const { 
        page = 1, 
        limit = 20, 
        productId, 
        action, 
        transactionType,
        startDate, 
        endDate,
        performedBy,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    if (productId) {
        query.product = productId;
    }
    
    if (action) {
        query.action = action;
    }
    
    if (transactionType) {
        query.transactionType = transactionType;
    }
    
    if (performedBy) {
        query.performedBy = performedBy;
    }
    
    // Date range filter
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const logs = await InventoryLog.find(query)
        .populate('product', 'name productId sku')
        .populate('performedBy', 'name email role')
        .populate('approvedBy', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort);
    
    const total = await InventoryLog.countDocuments(query);
    
    // Calculate summary
    const summary = await InventoryLog.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$action',
                totalQuantity: { $sum: '$quantity' },
                totalValue: { $sum: '$totalValue' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    res.status(200).json({
        success: true,
        count: logs.length,
        total,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        },
        summary,
        data: logs
    });
});

// @desc    Get inventory log by ID
// @route   GET /api/v1/inventory/logs/:id
// @access  Private
exports.getInventoryLog = asyncHandler(async (req, res, next) => {
    const log = await InventoryLog.findById(req.params.id)
        .populate('product', 'name productId sku category')
        .populate('performedBy', 'name email role')
        .populate('approvedBy', 'name email');
    
    if (!log) {
        throw new NotFoundError('Inventory log');
    }
    
    res.status(200).json({
        success: true,
        data: log
    });
});

// @desc    Get inventory summary
// @route   GET /api/v1/inventory/summary
// @access  Private
exports.getInventorySummary = asyncHandler(async (req, res, next) => {
    const summary = await inventoryService.getStockSummary();
    
    // Get recent activities
    const recentActivities = await InventoryLog.find()
        .populate('product', 'name productId')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    
    // Get low stock products
    const lowStockProducts = await Product.find({
        status: 'low_stock',
        isActive: true
    })
    .select('name productId quantity minStockLevel location')
    .limit(10);
    
    res.status(200).json({
        success: true,
        data: {
            summary: summary.summary,
            totals: summary.totals,
            recentActivities,
            lowStockProducts
        }
    });
});

// @desc    Get inventory valuation
// @route   GET /api/v1/inventory/valuation
// @access  Private/Admin/Manager
exports.getInventoryValuation = asyncHandler(async (req, res, next) => {
    const valuation = await inventoryService.getInventoryValuation();
    
    // Get valuation by category
    const valuationByCategory = await Product.aggregate([
        {
            $match: {
                isActive: true,
                quantity: { $gt: 0 }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: '$category'
        },
        {
            $group: {
                _id: '$category.name',
                totalCost: { 
                    $sum: { 
                        $multiply: ['$quantity', '$costPrice'] 
                    }
                },
                totalRetail: { 
                    $sum: { 
                        $multiply: ['$quantity', '$sellingPrice'] 
                    }
                },
                productCount: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' }
            }
        },
        {
            $sort: { totalCost: -1 }
        },
        {
            $project: {
                category: '$_id',
                totalCost: 1,
                totalRetail: 1,
                productCount: 1,
                totalQuantity: 1,
                potentialProfit: {
                    $subtract: ['$totalRetail', '$totalCost']
                },
                _id: 0
            }
        }
    ]);
    
    res.status(200).json({
        success: true,
        data: {
            overall: valuation,
            byCategory: valuationByCategory
        }
    });
});

// @desc    Export inventory report
// @route   POST /api/v1/inventory/export
// @access  Private/Admin/Manager
exports.exportInventory = asyncHandler(async (req, res, next) => {
    const { format = 'csv', filters = {} } = req.body;
    
    // Build query from filters
    let query = { isActive: true };
    
    if (filters.category) {
        query.category = filters.category;
    }
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.minQuantity) {
        query.quantity = { $gte: parseFloat(filters.minQuantity) };
    }
    
    if (filters.maxQuantity) {
        query.quantity = { ...query.quantity, $lte: parseFloat(filters.maxQuantity) };
    }
    
    // Get products
    const products = await Product.find(query)
        .populate('category', 'name code');
    
    // Export based on format
    let exportResult;
    if (format === 'csv' || format === 'pdf') {
        exportResult = await exportUtils.exportInventoryReport(products, format);
    } else {
        throw new Error('Unsupported export format');
    }
    
    // Log audit
    await AuditLog.create({
        action: 'EXPORT',
        entity: 'INVENTORY',
        description: `Exported inventory report (${format.toUpperCase()}) with ${products.length} products`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        metadata: { format, filters, count: products.length },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });
    
    // Send file
    res.download(exportResult.filePath, exportResult.filename, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
        }
        // Optional: Clean up file after sending
        // fs.unlinkSync(exportResult.filePath);
    });
});

// @desc    Get stock movement analysis
// @route   GET /api/v1/inventory/analysis/movement
// @access  Private/Admin/Manager
exports.getStockMovementAnalysis = asyncHandler(async (req, res, next) => {
    const { days = 30, groupBy = 'day' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    let dateFormat;
    switch (groupBy) {
        case 'hour':
            dateFormat = '%Y-%m-%d %H:00';
            break;
        case 'day':
            dateFormat = '%Y-%m-%d';
            break;
        case 'week':
            dateFormat = '%Y-%W';
            break;
        case 'month':
            dateFormat = '%Y-%m';
            break;
        default:
            dateFormat = '%Y-%m-%d';
    }
    
    const movementAnalysis = await InventoryLog.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    action: '$action'
                },
                totalQuantity: { $sum: '$quantity' },
                totalValue: { $sum: '$totalValue' },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                actions: {
                    $push: {
                        action: '$_id.action',
                        totalQuantity: '$totalQuantity',
                        totalValue: '$totalValue',
                        count: '$count'
                    }
                },
                totalTransactions: { $sum: '$count' },
                netQuantity: {
                    $sum: {
                        $cond: [
                            { $eq: ['$_id.action', 'STOCK_IN'] },
                            '$totalQuantity',
                            { $multiply: ['$totalQuantity', -1] }
                        ]
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        },
        {
            $project: {
                date: '$_id',
                actions: 1,
                totalTransactions: 1,
                netQuantity: 1,
                _id: 0
            }
        }
    ]);
    
    // Get top products by movement
    const topProducts = await InventoryLog.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$product',
                totalMovement: { $sum: '$quantity' },
                inCount: {
                    $sum: { $cond: [{ $eq: ['$action', 'STOCK_IN'] }, 1, 0] }
                },
                outCount: {
                    $sum: { $cond: [{ $eq: ['$action', 'STOCK_OUT'] }, 1, 0] }
                }
            }
        },
        {
            $sort: { totalMovement: -1 }
        },
        {
            $limit: 10
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $project: {
                product: '$product.name',
                productId: '$product.productId',
                totalMovement: 1,
                inCount: 1,
                outCount: 1
            }
        }
    ]);
    
    res.status(200).json({
        success: true,
        data: {
            movementAnalysis,
            topProducts,
            period: {
                days,
                startDate,
                endDate: new Date()
            }
        }
    });
});

// @desc    Get audit logs
// @route   GET /api/v1/inventory/audit
// @access  Private/Admin
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
    const { 
        page = 1, 
        limit = 20, 
        action, 
        entity, 
        performedBy,
        startDate, 
        endDate,
        status
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    if (action) {
        query.action = action;
    }
    
    if (entity) {
        query.entity = entity;
    }
    
    if (performedBy) {
        query.performedBy = performedBy;
    }
    
    if (status) {
        query.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }
    
    // Execute query
    const logs = await AuditLog.find(query)
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await AuditLog.countDocuments(query);
    
    res.status(200).json({
        success: true,
        count: logs.length,
        total,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        },
        data: logs
    });
});