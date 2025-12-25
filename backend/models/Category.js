const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Category name cannot be more than 100 characters']
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    
    code: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [20, 'Category code cannot be more than 20 characters']
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ code: 1 }, { unique: true });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ isActive: 1 });

// Virtual for hierarchical path
CategorySchema.virtual('path').get(function() {
    if (!this.parentCategory) return this.name;
    // In practice, you'd populate and build the full path
    return `${this.parentCategory.path} > ${this.name}`;
});

// Pre-save middleware to generate code
CategorySchema.pre('save', async function(next) {
    if (!this.code) {
        const count = await mongoose.models.Category.countDocuments();
        this.code = `CAT-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Category', CategorySchema);