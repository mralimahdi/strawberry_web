const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { saveTokensToFile } = require('../utils/tokenUtils');
const User = require('../models/User');

// Ensure resetTokens exists
if (!global.resetTokens) {
    global.resetTokens = new Map();
}

// Password validation function
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!password || password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must include at least one uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must include at least one lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must include at least one number' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must include at least one special character' };
    }

    return { valid: true };
};

// Reset password endpoint
router.post('/', async (req, res) => {
    try {
        console.log('Reset password request received', req.body);
        const { token, email, password } = req.body;

        if (!token || !email || !password) {
            console.log('Missing fields:', { token: !!token, email: !!email, password: !!password });
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check token validity
        const tokenData = global.resetTokens.get(token);
        console.log('Token data:', tokenData);
        if (!tokenData) {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        if (tokenData.email !== email) {
            console.log('Email mismatch:', { tokenEmail: tokenData.email, providedEmail: email });
            return res.status(400).json({ message: 'Token does not match email' });
        }

        if (Date.now() > tokenData.expiry) {
            global.resetTokens.delete(token);
            // Save updated tokens to file
            await saveTokensToFile();
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }

        // Find and update user in MongoDB
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Remove used token
        global.resetTokens.delete(token);

        // Save updated tokens to file
        await saveTokensToFile();

        console.log('Password reset successful for user:', email);
        res.json({
            success: true,
            message: 'Password has been successfully reset'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting your password'
        });
    }
});

module.exports = router;
