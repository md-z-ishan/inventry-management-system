const mongoose = require('mongoose');
const { STOCK_STATUS } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

const ProductSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        default: () => `PROD-${uuidv4().slice(0, 8).toUpperCase()}`
    },
    
    sku: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [50, 'SKU cannot be more than 50 characters']
    },
    
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxlength: [200, 'Product name cannot be more than 200 characters']
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    
    quantity: {
        type: Number,
        required: [true, 'Please provide initial quantity'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    
    unit: {
        type: String,
        required: true,
        enum: ['piece', 'kg', 'liter', 'meter', 'box', 'pack', 'dozen', 'unit'],
        default: 'piece'
    },
    
    minStockLevel: {
        type: Number,
        required: true,
        min: [0, 'Minimum stock level cannot be negative'],
        default: 10
    },
    
    maxStockLevel: {
        type: Number,
        min: [0, 'Maximum stock level cannot be negative']
    },
    
    costPrice: {
        type: Number,
        min: [0, 'Cost price cannot be negative'],
        default: 0
    },
    
    sellingPrice: {
        type: Number,
        min: [0, 'Selling price cannot be negative'],
        default: 0
    },
    
    location: {
        warehouse: String,
        aisle: String,
        shelf: String,
        bin: String
    },
    
    supplier: {
        name: String,
        contact: String,
        email: String
    },
    
    barcode: {
        type: String,
        trim: true,
        uppercase: true
    },
    
    qrCode: {
        data: String, // QR code data URL
        url: String   // URL to access product details
    },
    
    images: [{
        url: String,
        alt: String,
        isPrimary: Boolean
    }],
    
    status: {
        type: String,
        enum: Object.values(STOCK_STATUS),
        default: STOCK_STATUS.IN_STOCK
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    reorderPoint: {
        type: Number,
        min: [0, 'Reorder point cannot be negative']
    },
    
    lastRestocked: {
        type: Date
    },
    
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
ProductSchema.index({ productId: 1 }, { unique: true });
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ 'location.warehouse': 1 });
ProductSchema.index({ 'location.aisle': 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for stock status calculation
ProductSchema.virtual('stockStatus').get(function() {
    if (this.quantity <= 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (this.quantity <= this.minStockLevel) return STOCK_STATUS.LOW_STOCK;
    return STOCK_STATUS.IN_STOCK;
});

// Pre-save middleware to update status
ProductSchema.pre('save', function(next) {
    this.status = this.stockStatus;
    next();
});

// Pre-save middleware to generate SKU if not provided
ProductSchema.pre('save', async function(next) {
    if (!this.sku) {
        const category = await mongoose.model('Category').findById(this.category);
        const count = await mongoose.models.Product.countDocuments({ category: this.category });
        this.sku = `${category?.code || 'GEN'}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Static method to check low stock products
ProductSchema.statics.getLowStockProducts = async function(threshold) {
    return this.find({
        quantity: { $lte: threshold || '$minStockLevel' },
        isActive: true
    });
};

// Method to update stock
ProductSchema.methods.updateStock = async function(quantity, action) {
    if (action === 'STOCK_IN') {
        this.quantity += quantity;
    } else if (action === 'STOCK_OUT') {
        if (this.quantity < quantity) {
            throw new Error('Insufficient stock');
        }
        this.quantity -= quantity;
    }
    return this.save();
};

module.exports = mongoose.model('Product', ProductSchema);