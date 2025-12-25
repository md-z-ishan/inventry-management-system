const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['PURCHASE', 'SALE'],
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    invoiceNumber: {
        type: String,
        unique: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: function () { return this.type === 'PURCHASE'; }
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: function () { return this.type === 'SALE'; }
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    notes: String,
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
    timestamps: true
});

// Auto-generate invoice number
TransactionSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const prefix = this.type === 'PURCHASE' ? 'PO' : 'SO';

        // Find last transaction of this type
        const lastTransaction = await this.constructor.findOne({
            type: this.type
        }).sort({ createdAt: -1 });

        let sequence = '0001';
        if (lastTransaction && lastTransaction.invoiceNumber) {
            const lastSeq = parseInt(lastTransaction.invoiceNumber.slice(-4));
            sequence = (lastSeq + 1).toString().padStart(4, '0');
        }

        this.invoiceNumber = `${prefix}-${year}${month}-${sequence}`;
    }
    next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
