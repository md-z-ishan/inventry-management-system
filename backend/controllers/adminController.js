const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../config/constants');

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    // 1. User Stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const suspendedUsers = await User.countDocuments({ isActive: false });

    // 2. Recent Login Activity (Last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await AuditLog.countDocuments({
        action: 'LOGIN',
        createdAt: { $gte: oneDayAgo },
        status: 'SUCCESS'
    });

    const failedLogins = await AuditLog.countDocuments({
        action: 'LOGIN',
        createdAt: { $gte: oneDayAgo },
        status: 'FAILURE'
    });

    // 3. Get recent activities for widget
    const recentActivities = await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'name email role');

    res.status(200).json({
        success: true,
        data: {
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers
            },
            logins: {
                recent: recentLogins,
                failed: failedLogins
            },
            recentActivities
        }
    });
});

// @desc    Get system logs
// @route   GET /api/v1/admin/logs
// @access  Private/Admin
exports.getSystemLogs = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, action, user, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by Action
    if (action) {
        query.action = action;
    }

    // Filter by User (search by name or use specific ID)
    if (user) {
        // If it's a valid ObjectId, assume it's a specific user ID
        if (user.match(/^[0-9a-fA-F]{24}$/)) {
            query.performedBy = user;
        } else {
            // Otherwise, we might need to search users first or store performedByName in AuditLog (which we do!)
            query.performedByName = { $regex: user, $options: 'i' };
        }
    }

    // Filter by Date Range
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }

    const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('performedBy', 'name email role');

    const total = await AuditLog.countDocuments(query);

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
