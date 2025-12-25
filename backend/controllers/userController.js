const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { NotFoundError, AuthorizationError } = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/emailService');
const { ROLES } = require('../config/constants');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role) {
        query.role = role;
    }

    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    // Execute query
    const users = await User.find(query)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Log audit
    await AuditLog.create({
        action: 'VIEW',
        entity: 'USER',
        description: `Viewed users list (${users.length} users)`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        count: users.length,
        total,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        },
        data: users
    });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        throw new NotFoundError('User');
    }

    // Check authorization (admin can view all, users can only view themselves)
    if (req.user.role !== ROLES.ADMIN && req.user._id.toString() !== req.params.id) {
        throw new AuthorizationError();
    }

    // Log audit
    await AuditLog.create({
        action: 'VIEW',
        entity: 'USER',
        entityId: user._id,
        description: `Viewed user details: ${user.email}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, department, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'staff',
        department,
        phone,
        createdBy: req.user._id
    });

    // Log audit
    await AuditLog.create({
        action: 'CREATE',
        entity: 'USER',
        entityId: user._id,
        description: `Created new user: ${user.email} with role ${user.role}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        newData: user.toObject(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user, password);

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt
        }
    });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if (!user) {
        throw new NotFoundError('User');
    }

    // Store old data for audit
    const oldData = user.toObject();

    // Update fields
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        department: req.body.department,
        phone: req.body.phone,
        isActive: req.body.isActive
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    user = await User.findByIdAndUpdate(
        req.params.id,
        fieldsToUpdate,
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    // Track changes for audit
    const changes = [];
    Object.keys(fieldsToUpdate).forEach(key => {
        if (oldData[key] !== user[key]) {
            changes.push({
                field: key,
                oldValue: oldData[key],
                newValue: user[key]
            });
        }
    });

    // Log audit
    await AuditLog.create({
        action: 'UPDATE',
        entity: 'USER',
        entityId: user._id,
        description: `Updated user: ${user.email}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        oldData,
        newData: user.toObject(),
        changes,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new NotFoundError('User');
    }

    // Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
        throw new Error('You cannot delete your own account');
    }

    // Store data for audit
    const oldData = user.toObject();

    // Soft delete (deactivate)
    user.isActive = false;
    await user.save();

    // Log audit
    await AuditLog.create({
        action: 'DELETE',
        entity: 'USER',
        entityId: user._id,
        description: `Deactivated user: ${user.email}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        oldData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get user activity
// @route   GET /api/v1/users/:id/activity
// @access  Private/Admin
exports.getUserActivity = asyncHandler(async (req, res, next) => {
    const { days = 7 } = req.query;

    const activity = await AuditLog.aggregate([
        {
            $match: {
                performedBy: req.params.id,
                createdAt: {
                    $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                actions: { $push: "$action" },
                entities: { $push: "$entity" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 }
        },
        {
            $project: {
                date: "$_id",
                actions: 1,
                entities: 1,
                count: 1,
                _id: 0
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: activity
    });
});