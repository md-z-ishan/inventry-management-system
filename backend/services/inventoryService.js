const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const AuditLog = require('../models/AuditLog');
const emailService = require('./emailService');
const { STOCK_STATUS } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

class InventoryService {
    constructor() {
        this.lowStockThreshold = 10; // Default threshold
    }

    // Update stock with transaction logging
    async updateStock(productId, action, quantity, user, data = {}) {
        const session = await Product.startSession();
        session.startTransaction();

        try {
            // Get product with lock to prevent race conditions
            const product = await Product.findById(productId).session(session);

            if (!product) {
                throw new Error('Product not found');
            }

            const previousQuantity = product.quantity;
            let newQuantity = previousQuantity;

            // Update quantity based on action
            switch (action) {
                case 'STOCK_IN':
                    newQuantity = previousQuantity + quantity;
                    product.quantity = newQuantity;
                    break;

                case 'STOCK_OUT':
                    if (previousQuantity < quantity) {
                        throw new Error('Insufficient stock');
                    }
                    newQuantity = previousQuantity - quantity;
                    product.quantity = newQuantity;
                    break;

                case 'ADJUSTMENT':
                    product.quantity = quantity;
                    newQuantity = quantity;
                    break;

                default:
                    throw new Error('Invalid action');
            }

            // Update product status based on new quantity
            product.status = this.calculateStockStatus(newQuantity, product.minStockLevel);

            // If stock is getting low, update last restocked date
            if (action === 'STOCK_IN' && newQuantity > product.minStockLevel) {
                product.lastRestocked = new Date();
            }

            // Save product
            await product.save({ session });

            // Create inventory log
            const inventoryLog = await InventoryLog.create([{
                product: product._id,
                productId: product.productId,
                action,
                quantity,
                previousQuantity,
                newQuantity,
                unit: product.unit,
                reason: data.reason,
                transactionType: data.transactionType || 'adjustment',
                sourceLocation: data.sourceLocation || product.location,
                destinationLocation: data.destinationLocation,
                relatedDocument: data.relatedDocument,
                costPrice: data.costPrice || product.costPrice,
                performedBy: user._id,
                performedByName: user.name,
                approvedBy: data.approvedBy,
                notes: data.notes,
                metadata: {
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    deviceInfo: data.deviceInfo
                }
            }], { session });

            // Create audit log
            await AuditLog.create([{
                action: 'UPDATE',
                entity: 'INVENTORY',
                entityId: product._id,
                description: `${action} ${quantity} ${product.unit} of ${product.name}`,
                performedBy: user._id,
                performedByName: user.name,
                userRole: user.role,
                oldData: { quantity: previousQuantity },
                newData: { quantity: newQuantity },
                changes: [{
                    field: 'quantity',
                    oldValue: previousQuantity,
                    newValue: newQuantity
                }],
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }], { session });

            // Check for low stock alert
            if (product.status === STOCK_STATUS.LOW_STOCK) {
                await this.checkLowStockAlert(product, user);
            }

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            return {
                product,
                inventoryLog: inventoryLog[0],
                previousQuantity,
                newQuantity
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    // Batch stock update
    async batchUpdateStock(updates, user) {
        const results = [];

        for (const update of updates) {
            try {
                const result = await this.updateStock(
                    update.productId,
                    update.action,
                    update.quantity,
                    user,
                    update.data
                );
                results.push({
                    success: true,
                    productId: update.productId,
                    data: result
                });
            } catch (error) {
                results.push({
                    success: false,
                    productId: update.productId,
                    error: error.message
                });
            }
        }

        return results;
    }

    // Calculate stock status
    calculateStockStatus(quantity, minStockLevel) {
        if (quantity <= 0) {
            return STOCK_STATUS.OUT_OF_STOCK;
        } else if (quantity <= minStockLevel) {
            return STOCK_STATUS.LOW_STOCK;
        } else {
            return STOCK_STATUS.IN_STOCK;
        }
    }

    // Check and send low stock alerts
    async checkLowStockAlert(product, user) {
        try {
            // Check if product just reached low stock level
            if (product.quantity <= product.minStockLevel) {
                // Send email alert
                await emailService.sendLowStockAlert(product, product.minStockLevel);

                // Log the alert
                await AuditLog.create({
                    action: 'ALERT',
                    entity: 'PRODUCT',
                    entityId: product._id,
                    description: `Low stock alert triggered for ${product.name}`,
                    performedBy: user._id,
                    performedByName: user.name,
                    userRole: user.role,
                    status: 'SUCCESS'
                });

                console.log(`Low stock alert sent for product: ${product.name}`);
            }
        } catch (error) {
            console.error('Failed to send low stock alert:', error);
            await AuditLog.create({
                action: 'ALERT',
                entity: 'PRODUCT',
                entityId: product._id,
                description: `Failed to send low stock alert for ${product.name}`,
                performedBy: user._id,
                performedByName: user.name,
                userRole: user.role,
                status: 'FAILURE',
                errorMessage: error.message
            });
        }
    }

    // Get stock summary
    async getStockSummary() {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: {
                        $sum: {
                            $multiply: ['$quantity', '$costPrice']
                        }
                    }
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                    totalQuantity: 1,
                    totalValue: { $ifNull: ['$totalValue', 0] },
                    _id: 0
                }
            }
        ]);

        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({
            status: STOCK_STATUS.LOW_STOCK
        });

        return {
            summary,
            totals: {
                totalProducts,
                lowStockProducts,
                outOfStockProducts: summary.find(s => s.status === STOCK_STATUS.OUT_OF_STOCK)?.count || 0
            }
        };
    }

    // Get inventory valuation
    async getInventoryValuation() {
        const valuation = await Product.aggregate([
            {
                $match: {
                    isActive: true,
                    quantity: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
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
                    totalItems: { $sum: '$quantity' },
                    uniqueProducts: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalCost: { $ifNull: ['$totalCost', 0] },
                    totalRetail: { $ifNull: ['$totalRetail', 0] },
                    totalItems: 1,
                    uniqueProducts: 1,
                    potentialProfit: {
                        $subtract: ['$totalRetail', '$totalCost']
                    }
                }
            }
        ]);

        return valuation[0] || {
            totalCost: 0,
            totalRetail: 0,
            totalItems: 0,
            uniqueProducts: 0,
            potentialProfit: 0
        };
    }

    // Get stock movement history
    async getStockMovement(productId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const movements = await InventoryLog.aggregate([
            {
                $match: {
                    product: productId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    movements: {
                        $push: {
                            action: '$action',
                            quantity: '$quantity',
                            previousQuantity: '$previousQuantity',
                            newQuantity: '$newQuantity',
                            performedByName: '$performedByName',
                            timestamp: '$createdAt'
                        }
                    },
                    netChange: {
                        $sum: {
                            $cond: [
                                { $eq: ['$action', 'STOCK_IN'] },
                                '$quantity',
                                { $multiply: ['$quantity', -1] }
                            ]
                        }
                    }
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $project: {
                    date: '$_id',
                    movements: 1,
                    netChange: 1,
                    _id: 0
                }
            }
        ]);

        return movements;
    }
}

module.exports = new InventoryService();