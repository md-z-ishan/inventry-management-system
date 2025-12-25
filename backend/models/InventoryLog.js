const mongoose = require('mongoose');
const { INVENTORY_ACTIONS } = require('../config/constants');

const InventoryLogSchema = new mongoose.Schema({
    referenceNumber: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
        default: function () {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `INV-${year}${month}${day}-${random}`;
        }
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    productId: {
        type: String,
        required: true
    },

    action: {
        type: String,
        enum: Object.values(INVENTORY_ACTIONS),
        required: true
    },

    quantity: {
        type: Number,
        required: [true, 'Please provide quantity'],
        min: [0.01, 'Quantity must be greater than 0']
    },

    previousQuantity: {
        type: Number,
        required: true
    },

    newQuantity: {
        type: Number,
        required: true
    },

    unit: {
        type: String,
        required: true
    },

    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot be more than 500 characters']
    },

    transactionType: {
        type: String,
        enum: ['purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer'],
        required: true
    },

    sourceLocation: {
        warehouse: String,
        aisle: String,
        shelf: String,
        bin: String
    },

    destinationLocation: {
        warehouse: String,
        aisle: String,
        shelf: String,
        bin: String
    },

    relatedDocument: {
        type: String, // e.g., Purchase Order Number, Sales Invoice Number
        trim: true
    },

    costPrice: {
        type: Number,
        min: [0, 'Cost price cannot be negative']
    },

    totalValue: {
        type: Number,
        min: [0, 'Total value cannot be negative']
    },

    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    performedByName: {
        type: String,
        required: true
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot be more than 1000 characters']
    },

    metadata: {
        ipAddress: String,
        userAgent: String,
        deviceInfo: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for fast querying
InventoryLogSchema.index({ referenceNumber: 1 }, { unique: true });
InventoryLogSchema.index({ product: 1 });
InventoryLogSchema.index({ productId: 1 });
InventoryLogSchema.index({ action: 1 });
InventoryLogSchema.index({ performedBy: 1 });
InventoryLogSchema.index({ createdAt: -1 });
InventoryLogSchema.index({ transactionType: 1 });
InventoryLogSchema.index({ 'sourceLocation.warehouse': 1 });
InventoryLogSchema.index({ 'destinationLocation.warehouse': 1 });

// Compound indexes for common queries
InventoryLogSchema.index({ product: 1, createdAt: -1 });
InventoryLogSchema.index({ performedBy: 1, createdAt: -1 });
InventoryLogSchema.index({ action: 1, createdAt: -1 });

// Pre-save middleware to calculate total value
InventoryLogSchema.pre('save', function (next) {
    if (this.costPrice && this.quantity) {
        this.totalValue = this.costPrice * this.quantity;
    }
    next();
});

// Virtual for readable action
InventoryLogSchema.virtual('actionDescription').get(function () {
    const actions = {
        STOCK_IN: 'Stock In',
        STOCK_OUT: 'Stock Out',
        ADJUSTMENT: 'Adjustment',
        TRANSFER: 'Transfer'
    };
    return actions[this.action] || this.action;
});

// Static method for daily summary
InventoryLogSchema.statics.getDailySummary = async function (date = new Date()) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            }
        },
        {
            $group: {
                _id: '$action',
                totalQuantity: { $sum: '$quantity' },
                totalValue: { $sum: '$totalValue' },
                count: { $sum: 1 }
            }
        }
    ]);
};

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);