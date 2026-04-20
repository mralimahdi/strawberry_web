const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// POST /login route for user authentication
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const email = username.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot use customer login. Use admin login instead.' });
    }

    let passwordMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // fallback for legacy plaintext passwords
      passwordMatch = user.password === password;
      if (passwordMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({ 
      message: 'Login successful', 
      role: user.role, 
      token: user.email,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
