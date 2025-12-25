const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errorResponse');

// --- Suppliers ---

// @desc    Get all suppliers
// @route   GET /api/v1/partners/suppliers
// @access  Private
exports.getSuppliers = asyncHandler(async (req, res, next) => {
    const suppliers = await Supplier.find({ isActive: true }).sort('-createdAt');
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
});

// @desc    Get single supplier
// @route   GET /api/v1/partners/suppliers/:id
// @access  Private
exports.getSupplier = asyncHandler(async (req, res, next) => {
    const supplier = await Supplier.findById(req.params.id).populate('products');
    if (!supplier) throw new NotFoundError('Supplier');
    res.status(200).json({ success: true, data: supplier });
});

// @desc    Create supplier
// @route   POST /api/v1/partners/suppliers
// @access  Private
exports.createSupplier = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user._id;
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
});

// @desc    Update supplier
// @route   PUT /api/v1/partners/suppliers/:id
// @access  Private
exports.updateSupplier = asyncHandler(async (req, res, next) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!supplier) throw new NotFoundError('Supplier');
    res.status(200).json({ success: true, data: supplier });
});

// @desc    Delete supplier
// @route   DELETE /api/v1/partners/suppliers/:id
// @access  Private
exports.deleteSupplier = asyncHandler(async (req, res, next) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!supplier) throw new NotFoundError('Supplier');
    res.status(200).json({ success: true, data: {} });
});

// --- Customers ---

// @desc    Get all customers
// @route   GET /api/v1/partners/customers
// @access  Private
exports.getCustomers = asyncHandler(async (req, res, next) => {
    const customers = await Customer.find({ isActive: true }).sort('-createdAt');
    res.status(200).json({ success: true, count: customers.length, data: customers });
});

// @desc    Get single customer
// @route   GET /api/v1/partners/customers/:id
// @access  Private
exports.getCustomer = asyncHandler(async (req, res, next) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) throw new NotFoundError('Customer');
    res.status(200).json({ success: true, data: customer });
});

// @desc    Create customer
// @route   POST /api/v1/partners/customers
// @access  Private
exports.createCustomer = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user._id;
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
});

// @desc    Update customer
// @route   PUT /api/v1/partners/customers/:id
// @access  Private
exports.updateCustomer = asyncHandler(async (req, res, next) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!customer) throw new NotFoundError('Customer');
    res.status(200).json({ success: true, data: customer });
});

// @desc    Delete customer
// @route   DELETE /api/v1/partners/customers/:id
// @access  Private
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!customer) throw new NotFoundError('Customer');
    res.status(200).json({ success: true, data: {} });
});
