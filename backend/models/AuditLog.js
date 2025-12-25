const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT',
            'CREATE',
            'UPDATE',
            'DELETE',
            'VIEW',
            'EXPORT',
            'IMPORT',
            'DOWNLOAD',
            'UPLOAD',
            'SCAN'
        ]
    },
    
    entity: {
        type: String,
        required: true,
        enum: ['USER', 'PRODUCT', 'CATEGORY', 'INVENTORY', 'REPORT', 'SYSTEM']
    },
    
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
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
    
    userRole: {
        type: String,
        required: true
    },
    
    oldData: {
        type: mongoose.Schema.Types.Mixed
    },
    
    newData: {
        type: mongoose.Schema.Types.Mixed
    },
    
    changes: [{
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed
    }],
    
    ipAddress: {
        type: String
    },
    
    userAgent: {
        type: String
    },
    
    location: {
        country: String,
        city: String,
        region: String
    },
    
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'WARNING'],
        default: 'SUCCESS'
    },
    
    errorMessage: {
        type: String
    },
    
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entity: 1 });
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ userRole: 1 });
AuditLogSchema.index({ status: 1 });

// Compound indexes
AuditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });

// TTL index for automatic cleanup (retain logs for 1 year)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Static method for activity summary
AuditLogSchema.statics.getUserActivity = async function(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                performedBy: userId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                actions: { $push: "$action" },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);