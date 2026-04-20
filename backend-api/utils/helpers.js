const transporter = require('../config/email.config');
const crypto = require('crypto');

// Send email
exports.sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@strawberryfarm.com',
        to,
        subject,
        html
    };

    return transporter.sendMail(mailOptions);
};

// Generate verification email
exports.sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const html = `
        <h1>Email Verification</h1>
        <p>Hello ${user.firstName},</p>
        <p>Please click the link below to verify your email address:</p>
        <p>
            <a href="${verificationUrl}">Verify Email</a>
        </p>
        <p>If you didn't create an account, you can ignore this email.</p>
    `;

    return exports.sendEmail(user.email, 'Verify Your Email', html);
};

// Generate password reset email
exports.sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const html = `
        <h1>Password Reset Request</h1>
        <p>Hello ${user.firstName},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p>
            <a href="${resetUrl}">Reset Password</a>
        </p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
    `;

    return exports.sendEmail(user.email, 'Reset Your Password', html);
};

// Generate random token
exports.generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate order number
exports.generateOrderNumber = (prefix = 'ORD') => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}${day}-${random}`;
};

// Format currency
exports.formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
};

// Calculate order total
exports.calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};

// Format date
exports.formatDate = (date, format = 'long') => {
    const options = {
        long: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        short: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        },
        time: {
            hour: '2-digit',
            minute: '2-digit'
        }
    };

    return new Date(date).toLocaleString('en-US', options[format]);
};

// Validate phone number
exports.validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
};

// Sanitize user input
exports.sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Parse pagination parameters
exports.parsePaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

// Handle async route
exports.asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Generate slug
exports.generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};
