const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const { generateToken, setTokenCookie, generateRefreshToken } = require('../utils/token');
const { AuthenticationError, DuplicateError, NotFoundError } = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/emailService');

// Helper to set tokens
const createSendToken = async (user, statusCode, res, req) => {
    const token = generateToken(user._id);

    // Create Refresh Token
    const refreshToken = generateRefreshToken();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expires,
        createdByIp: req.ip
    });

    // Set Refresh Token Cookie
    const cookieOptions = {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/api/v1/auth/refresh-token'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);
    setTokenCookie(res, token);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        data: {
            user,
            token
        }
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    console.log('Register request received:', req.body);
    const { name, email, password, role, department, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new DuplicateError('User');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'staff',
        department,
        phone,
        createdBy: req.user?._id
    });

    try {
        // Log audit
        await AuditLog.create({
            action: 'CREATE',
            entity: 'USER',
            entityId: user._id,
            description: `User registered: ${user.email}`,
            performedBy: user._id,
            performedByName: user.name,
            userRole: user.role,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        // Send welcome email
        await emailService.sendWelcomeEmail(user);

        // Send tokens
        await createSendToken(user, 201, res, req);
    } catch (error) {
        console.error('Error during registration process:', error);
        await User.findByIdAndDelete(user._id);
        throw error;
    }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        throw new AuthenticationError('Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        // Log failed attempt
        await User.findByIdAndUpdate(user._id, {
            $push: {
                loginHistory: {
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    status: 'FAILED'
                }
            }
        });
        throw new AuthenticationError('Invalid credentials');
    }

    // Update last login and history
    user.lastLogin = new Date();
    user.loginHistory.push({
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'SUCCESS'
    });

    // Convert Mongoose doc to object before modifications if strictly needed, 
    // but here we are saving the document so we update properties directly.
    // However, loginHistory push works on document.

    await user.save({ validateBeforeSave: false });

    // Log audit
    await AuditLog.create({
        action: 'LOGIN',
        entity: 'USER',
        entityId: user._id,
        description: `User logged in: ${user.email}`,
        performedBy: user._id,
        performedByName: user.name,
        userRole: user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'SUCCESS'
    });

    await createSendToken(user, 200, res, req);
});

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AuthenticationError('No refresh token found');
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken }).populate('user');

    if (!tokenDoc || !tokenDoc.isActive) {
        throw new AuthenticationError('Invalid or expired refresh token');
    }

    const { user } = tokenDoc;

    // Revoke old token and create new pair (Rotation)
    tokenDoc.revoked = Date.now();
    tokenDoc.revokedByIp = req.ip;
    tokenDoc.replacedByToken = generateRefreshToken(); // Placeholder if we kept the old doc active but marked replaced
    await tokenDoc.save();

    // Actually we can just create a fresh one and let the old one stay revoked.
    // Or we strictly rotate. 
    // Let's call createSendToken which creates a NEW refresh token. 
    // Ideally we should link the new one to the old one if implementing deep rotation chain tracking.

    await createSendToken(user, 200, res, req);
});

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
    // Log audit
    await AuditLog.create({
        action: 'LOGOUT',
        entity: 'USER',
        entityId: req.user._id,
        description: `User logged out: ${req.user.email}`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'SUCCESS'
    });

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                loginHistory: user.loginHistory,
                createdAt: user.createdAt
            }
        }
    });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
        phone: req.body.phone
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
        req.user._id,
        fieldsToUpdate,
        {
            new: true,
            runValidators: true
        }
    );

    // Log audit
    await AuditLog.create({
        action: 'UPDATE',
        entity: 'USER',
        entityId: user._id,
        description: `User updated their profile`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        oldData: req.user.toObject(),
        newData: user.toObject(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone
            }
        }
    });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isPasswordMatch = await user.comparePassword(req.body.currentPassword);

    if (!isPasswordMatch) {
        throw new AuthenticationError('Current password is incorrect');
    }

    user.password = req.body.newPassword;
    await user.save();

    // Log audit
    await AuditLog.create({
        action: 'UPDATE',
        entity: 'USER',
        entityId: user._id,
        description: `User changed password`,
        performedBy: req.user._id,
        performedByName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        }
    });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        throw new Error('No user found with this email');
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        // Send email logic here
        console.log('Reset password email would be sent to:', user.email);
        console.log('Reset URL:', resetUrl);

        res.status(200).json({
            success: true,
            data: 'Email sent'
        });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        throw new Error('Email could not be sent');
    }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Invalid token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log audit
    await AuditLog.create({
        action: 'UPDATE',
        entity: 'USER',
        entityId: user._id,
        description: `User reset password via email`,
        performedBy: user._id,
        performedByName: user.name,
        userRole: user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        }
    });
});