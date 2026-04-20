const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { role, name, email, password, phone } = req.body;
        if (!role || !name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing fields.' });
        }

        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.json({ success: false, message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const lastUser = await User.findOne().sort({ srno: -1 });
        const nextSrno = lastUser ? lastUser.srno + 1 : 1;

        const newUser = new User({
            srno: nextSrno,
            role,
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || ''
        });

        await newUser.save();
        return res.json({ success: true });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
