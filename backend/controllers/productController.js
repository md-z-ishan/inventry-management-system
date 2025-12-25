const Product = require('../models/Product');
const Category = require('../models/Category');
const InventoryLog = require('../models/InventoryLog');
const AuditLog = require('../models/AuditLog');
const QRGenerator = require('../utils/qrGenerator');
const inventoryService = require('../services/inventoryService');
const { NotFoundError, ValidationError } = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { STOCK_STATUS } = require('../config/constants');

// Initialize QR Generator
const qrGenerator = new QRGenerator({
    size: process.env.QR_CODE_SIZE || 300,
    margin: process.env.QR_CODE_MARGIN || 2
});

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Private
exports.getProducts = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 20,
        search,
        category,
        status,
        minQuantity,
        maxQuantity,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { productId: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Filter by quantity range
    if (minQuantity) {
        query.quantity = { $gte: parseFloat(minQuantity) };
    }

    if (maxQuantity) {
        query.quantity = { ...query.quantity, $lte: parseFloat(maxQuantity) };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const products = await Product.find(query)
        .populate('category', 'name code')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort);

    const total = await Product.countDocuments(query);

    // Log audit
    await AuditLog.create({
        action: 'VIEW',
        entity: 'PRODUCT',
        description: `Viewed products list (${products.length} products)`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        count: products.length,
        total,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        },
        data: products
    });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Private
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name code')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

    if (!product) {
        throw new NotFoundError('Product');
    }

    // Log audit
    await AuditLog.create({
        action: 'VIEW',
        entity: 'PRODUCT',
        entityId: product._id,
        description: `Viewed product: ${product.name}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin/Manager
exports.createProduct = asyncHandler(async (req, res, next) => {
    const {
        name,
        description,
        category,
        quantity,
        unit,
        minStockLevel,
        maxStockLevel,
        costPrice,
        sellingPrice,
        location,
        supplier,
        barcode,
        notes
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        throw new ValidationError('Invalid category');
    }

    // Create product
    const productData = {
        name,
        description,
        category,
        quantity: quantity || 0,
        unit: unit || 'piece',
        minStockLevel: minStockLevel || 10,
        maxStockLevel,
        costPrice,
        sellingPrice,
        location,
        supplier,
        barcode,
        notes,
        createdBy: req.user._id
    };

    const product = await Product.create(productData);

    // Generate QR code
    const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const qrCode = await qrGenerator.generateProductQR(product, baseUrl);

    // Update product with QR code
    product.qrCode = {
        data: qrCode.dataURL,
        url: qrCode.productUrl
    };
    await product.save();

    // Create initial inventory log if quantity > 0
    if (quantity > 0) {
        await inventoryService.updateStock(
            product._id,
            'STOCK_IN',
            quantity,
            req.user,
            {
                reason: 'Initial stock',
                transactionType: 'purchase',
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        );
    }

    // Log audit
    await AuditLog.create({
        action: 'CREATE',
        entity: 'PRODUCT',
        entityId: product._id,
        description: `Created new product: ${product.name} (${product.productId})`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        newData: product.toObject(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(201).json({
        success: true,
        data: product
    });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin/Manager
exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        throw new NotFoundError('Product');
    }

    // Store old data for audit
    const oldData = product.toObject();

    // Update fields
    const fieldsToUpdate = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        unit: req.body.unit,
        minStockLevel: req.body.minStockLevel,
        maxStockLevel: req.body.maxStockLevel,
        costPrice: req.body.costPrice,
        sellingPrice: req.body.sellingPrice,
        location: req.body.location,
        supplier: req.body.supplier,
        barcode: req.body.barcode,
        notes: req.body.notes,
        updatedBy: req.user._id
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Update product
    product = await Product.findByIdAndUpdate(
        req.params.id,
        fieldsToUpdate,
        {
            new: true,
            runValidators: true
        }
    ).populate('category', 'name code');

    // Track changes for audit
    const changes = [];
    Object.keys(fieldsToUpdate).forEach(key => {
        if (oldData[key] !== product[key]) {
            changes.push({
                field: key,
                oldValue: oldData[key],
                newValue: product[key]
            });
        }
    });

    // Log audit
    await AuditLog.create({
        action: 'UPDATE',
        entity: 'PRODUCT',
        entityId: product._id,
        description: `Updated product: ${product.name}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        oldData,
        newData: product.toObject(),
        changes,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new NotFoundError('Product');
    }

    // Soft delete (deactivate)
    product.isActive = false;
    await product.save();

    // Log audit
    await AuditLog.create({
        action: 'DELETE',
        entity: 'PRODUCT',
        entityId: product._id,
        description: `Deactivated product: ${product.name}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        oldData: product.toObject(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Update product stock
// @route   POST /api/v1/products/:id/stock
// @access  Private/Admin/Manager/Staff
exports.updateStock = asyncHandler(async (req, res, next) => {
    const { action, quantity, reason, transactionType, relatedDocument } = req.body;

    const result = await inventoryService.updateStock(
        req.params.id,
        action,
        quantity,
        req.user,
        {
            reason,
            transactionType,
            relatedDocument,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        }
    );

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Batch update stock
// @route   POST /api/v1/products/batch/stock
// @access  Private/Admin/Manager
exports.batchUpdateStock = asyncHandler(async (req, res, next) => {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
        throw new ValidationError('Updates array is required');
    }

    const results = await inventoryService.batchUpdateStock(updates, req.user);

    res.status(200).json({
        success: true,
        data: results
    });
});

// @desc    Generate QR code for product
// @route   POST /api/v1/products/:id/qrcode
// @access  Private
exports.generateQRCode = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new NotFoundError('Product');
    }

    const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const qrCode = await qrGenerator.generateProductQR(product, baseUrl);

    // Update product with new QR code
    product.qrCode = {
        data: qrCode.dataURL,
        url: qrCode.productUrl
    };
    await product.save();

    // Log audit
    await AuditLog.create({
        action: 'UPDATE',
        entity: 'PRODUCT',
        entityId: product._id,
        description: `Generated new QR code for product: ${product.name}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: {
            qrCode: qrCode.dataURL,
            qrId: qrCode.qrId,
            productUrl: qrCode.productUrl
        }
    });
});

const fs = require('fs');
const csv = require('csv-parser');

// ... existing imports ...

// @desc    Bulk import products from CSV
// @route   POST /api/v1/products/import
// @access  Private (Admin/Manager)
exports.bulkImport = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new BadRequestError('Please upload a CSV file');
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Delete file after processing
                fs.unlinkSync(req.file.path);

                for (const row of results) {
                    try {
                        // Basic validation
                        if (!row.name || !row.sku || !row.category) {
                            errors.push({ row, error: 'Missing required fields (name, sku, category)' });
                            continue;
                        }

                        // Check if product exists
                        let product = await Product.findOne({ sku: row.sku });

                        if (product) {
                            // Update existing
                            product.name = row.name || product.name;
                            product.price = row.price ? Number(row.price) : product.price;
                            product.quantity = row.quantity ? Number(row.quantity) + product.quantity : product.quantity; // Add to stock if exists? Or replace? Let's add.
                            // If row.quantity is provided, we should probably add it as a transaction ideally, but for simple import, let's just update field. 
                            // Better: row.quantity represents CURRENT stock or ADDED stock? 
                            // Assumption: Import updates details. If quantity provided, set it or add? 
                            // Let's assume it sets the quantity if provided, or adds? 
                            // Safer: Update cost/price/name. Quantity might be tricky to overwrite without log.
                            // Let's treat it as "Initial Import" or "Update".
                            // If user wants to add stock, they should use stock update. 
                            // Implementation: Update fields.

                            await product.save();
                        } else {
                            // Create new
                            // Need category ID. If category name is provided, find it.
                            const Category = require('../models/Category'); // Lazy load or move to top
                            let category = await Category.findOne({ name: { $regex: new RegExp(`^${row.category}$`, 'i') } });

                            if (!category) {
                                // Optional: Create category if not exists
                                category = await Category.create({
                                    name: row.category,
                                    description: 'Created via bulk import'
                                });
                            }

                            await Product.create({
                                name: row.name,
                                sku: row.sku,
                                category: category._id,
                                price: Number(row.price) || 0,
                                quantity: Number(row.quantity) || 0,
                                unit: row.unit || 'pcs',
                                description: row.description || '',
                                minStockLevel: Number(row.minStockLevel) || 10,
                                location: row.location || ''
                            });
                        }
                        successCount++;
                    } catch (err) {
                        errors.push({ sku: row.sku, error: err.message });
                    }
                }

                res.status(200).json({
                    success: true,
                    message: `Import processed. ${successCount} products imported/updated.`,
                    errors: errors.length > 0 ? errors : undefined
                });

            } catch (err) {
                next(err);
            }
        });
});

// @desc    Get product by QR code ID
// @route   GET /api/v1/products/qr/:qrId
// @access  Public (for QR scanning)
exports.getProductByQR = asyncHandler(async (req, res, next) => {
    // Access public or private depending on need. currently public.
    // Assuming qrId is actually the Product ID or we search by a specific qrId field if we added one.
    // For now, let's assume the QR code encodes the Product _id.

    let product = await Product.findById(req.params.qrId).populate('category', 'name code');

    if (!product) {
        // Try to find by SKU or Barcode if ID fails
        product = await Product.findOne({
            $or: [{ sku: req.params.qrId }, { barcode: req.params.qrId }]
        }).populate('category', 'name code');
    }

    if (!product) {
        throw new NotFoundError('Product not found for this QR code');
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Get low stock products
// @route   GET /api/v1/products/low-stock
// @access  Private
exports.getLowStockProducts = asyncHandler(async (req, res, next) => {
    const { threshold } = req.query;

    let query = {
        isActive: true
    };

    if (threshold) {
        query.quantity = { $lte: parseInt(threshold) };
    } else {
        query.$expr = { $lte: ["$quantity", "$minStockLevel"] };
    }

    const products = await Product.find(query)
        .populate('category', 'name code')
        .sort({ quantity: 1 });

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Get product inventory logs
// @route   GET /api/v1/products/:id/logs
// @access  Private
exports.getProductLogs = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await InventoryLog.find({ product: req.params.id })
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await InventoryLog.countDocuments({ product: req.params.id });

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