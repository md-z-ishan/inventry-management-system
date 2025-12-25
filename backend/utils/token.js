const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Set JWT token cookie
const setTokenCookie = (res, token) => {
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.cookie('token', token, options);
};

// Generate Refresh Token
const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

module.exports = {
    generateToken,
    setTokenCookie,
    generateRefreshToken
};