const Category = require('../models/Category');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const { NotFoundError, ValidationError } = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 50, search, isActive } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }
    
    // Execute query
    const categories = await Category.find(query)
        .populate('parentCategory', 'name')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ name: 1 });
    
    const total = await Category.countDocuments(query);
    
    res.status(200).json({
        success: true,
        count: categories.length,
        total,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        },
        data: categories
    });
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private
exports.getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
        .populate('parentCategory', 'name code')
        .populate('createdBy', 'name email');
    
    if (!category) {
        throw new NotFoundError('Category');
    }
    
    // Get category statistics
    const productCount = await Product.countDocuments({ 
        category: category._id,
        isActive: true 
    });
    
    const categoryData = category.toObject();
    categoryData.productCount = productCount;
    
    res.status(200).json({
        success: true,
        data: categoryData
    });
});

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private/Admin/Manager
exports.createCategory = asyncHandler(async (req, res, next) => {
    const { name, description, parentCategory, code } = req.body;
    
    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ValidationError('Category name already exists');
    }
    
    // Check parent category if provided
    if (parentCategory) {
        const parent = await Category.findById(parentCategory);
        if (!parent) {
            throw new ValidationError('Parent category not found');
        }
    }
    
    // Create category
    const category = await Category.create({
        name,
        description,
        parentCategory,
        code,
        createdBy: req.user._id
    });
    
    // Log audit
    await AuditLog.create({
        action: 'CREATE',
        entity: 'CATEGORY',
        entityId: category._id,
        description: `Created new category: ${category.name}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        newData: category.toObject(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });
    
    res.status(201).json({
        success: true,
        data: category
    });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin/Manager
exports.updateCategory = asyncHandler(async (req, res, next) => {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
        throw new NotFoundError('Category');
    }
    
    // Store old data for audit
    const oldData = category.toObject();
    
    // Update fields
    const fieldsToUpdate = {
        name: req.body.name,
        description: req.body.description,
        parentCategory: req.body.parentCategory,
        isActive: req.body.isActive
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // Check if new name already exists (excluding current category)
    if (fieldsToUpdate.name && fieldsToUpdate.name !== category.name) {
        const existingCategory = await Category.findOne({ 
            name: fieldsToUpdate.name,
            _id: { $ne: category._id }
        });
        
        if (existingCategory) {
            throw new ValidationError('Category name already exists');
        }
    }
    
    // Check parent category if provided
    if (fieldsToUpdate.parentCategory) {
        // Prevent setting self as parent
        if (fieldsToUpdate.parentCategory.toString() === category._id.toString()) {
            throw new ValidationError('Category cannot be its own parent');
        }
        
        const parent = await Category.findById(fieldsToUpdate.parentCategory);
        if (!parent) {
            throw new ValidationError('Parent category not found');
        }
    }
    
    // Update category
    category = await Category.findByIdAndUpdate(
        req.params.id,
        fieldsToUpdate,
        {
            new: true,
            runValidators: true
        }
    ).populate('parentCategory', 'name');
    
    // Track changes for audit
    const changes = [];
    Object.keys(fieldsToUpdate).forEach(key => {
        if (oldData[key] !== category[key]) {
            changes.push({
                field: key,
                oldValue: oldData[key],
                newValue: category[key]
            });
        }
    });
    
    // Log audit
    await AuditLog.create({
        action: 'UPDATE',
        entity: 'CATEGORY',
        entityId: category._id,
        description: `Updated category: ${category.name}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        oldData,
        newData: category.toObject(),
        changes,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });
    
    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
        throw new NotFoundError('Category');
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ 
        category: category._id,
        isActive: true 
    });
    
    if (productCount > 0) {
        throw new ValidationError(
            `Cannot delete category with ${productCount} active products. Move products to another category first.`
        );
    }
    
    // Check if category has subcategories
    const subCategoryCount = await Category.countDocuments({ 
        parentCategory: category._id 
    });
    
    if (subCategoryCount > 0) {
        throw new ValidationError(
            `Cannot delete category with ${subCategoryCount} subcategories. Delete or reassign subcategories first.`
        );
    }
    
    // Delete category
    await Category.findByIdAndDelete(req.params.id);
    
    // Log audit
    await AuditLog.create({
        action: 'DELETE',
        entity: 'CATEGORY',
        entityId: category._id,
        description: `Deleted category: ${category.name}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        oldData: category.toObject(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });
    
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get category hierarchy
// @route   GET /api/v1/categories/hierarchy
// @access  Private
exports.getCategoryHierarchy = asyncHandler(async (req, res, next) => {
    const categories = await Category.find({ isActive: true })
        .populate('parentCategory', 'name')
        .sort({ name: 1 });
    
    // Build hierarchy
    const buildHierarchy = (parentId = null) => {
        return categories
            .filter(cat => 
                (parentId === null && !cat.parentCategory) || 
                (cat.parentCategory && cat.parentCategory._id.toString() === parentId)
            )
            .map(cat => ({
                _id: cat._id,
                name: cat.name,
                code: cat.code,
                description: cat.description,
                children: buildHierarchy(cat._id.toString())
            }));
    };
    
    const hierarchy = buildHierarchy();
    
    res.status(200).json({
        success: true,
        data: hierarchy
    });
});