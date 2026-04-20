const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware for input validation
const validateRegistration = [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().escape(),
    body('lastName').trim().escape()
];

const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
];

// Register a new user
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get next srno
        const lastUser = await User.findOne().sort({ srno: -1 });
        const nextSrno = lastUser ? lastUser.srno + 1 : 1;

        // Create new user object
        const newUser = new User({
            srno: nextSrno,
            role: 'user',
            email,
            name: `${firstName} ${lastName}`,
            password: hashedPassword,
            phone: ''
        });

        await newUser.save();

        // Create token
        const token = jwt.sign(
            { userId: newUser._id, srno: newUser.srno, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                srno: newUser.srno,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login user
// Admin login endpoint
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, password });

        // Find admin user
        const user = await User.findOne({ email, role: 'admin' });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                success: true,
                role: 'admin',
                name: user.name
            });
        } else {
            res.json({
                success: false,
                message: 'Invalid credentials or not an admin'
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, srno: user.srno, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                srno: user.srno,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        // Token verification middleware will be added later
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error getting user profile', error: error.message });
    }
});

// Request password reset
// Removed broken forgot-password route to avoid "User is not defined" error.
// Please use /api/forgot-password endpoint instead for password reset requests.
// router.post('/forgot-password', async (req, res) => {
//     try {
//         const { email } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Generate reset token
//         const resetToken = jwt.sign(
//             { userId: user._id },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         user.resetPasswordToken = resetToken;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//         await user.save();

//         // TODO: Send password reset email
//         // This will be implemented later with nodemailer

//         res.json({ message: 'Password reset email sent' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error requesting password reset', error: error.message });
//     }
// });

// Reset password
// Refactored reset-password route to use customers.txt instead of undefined User model
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Read users from file
        const data = await fs.readFile(USERS_FILE, 'utf8');
        const users = data.split('\n').filter(line => line.trim()).map(line => {
            const [id, role, email, name, password, phone, resetToken, resetExpiry] = line.split(',');
            return { id, role, email, name, password, phone, resetToken, resetExpiry };
        });

        // Find user with matching reset token and valid expiry
        const userIndex = users.findIndex(u => u.resetToken === token && Number(u.resetExpiry) > Date.now());

        if (userIndex === -1) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and clear reset token and expiry
        users[userIndex].password = hashedPassword;
        users[userIndex].resetToken = '';
        users[userIndex].resetExpiry = '';

        // Write updated users back to file
        const updatedData = users.map(u => [
            u.id, u.role, u.email, u.name, u.password, u.phone, u.resetToken, u.resetExpiry
        ].join(',')).join('\n');

        await fs.writeFile(USERS_FILE, updatedData, 'utf8');

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
});

module.exports = router;
