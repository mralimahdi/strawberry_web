
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

// Route imports
const registerRoutes = require('./routes/register');
const dashboardRoutes = require('./routes/dashboard');
const messagesRoutes = require('./routes/messages');
const forgotPasswordRoutes = require('./routes/forgot-password');
const resetPasswordRoutes = require('./routes/reset-password');
const authRoutes = require('./routes/auth');

const app = express();
app.disable('etag');

// Middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost',
  'http://127.0.0.1',
  'file://'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..')));
// Serve frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve CSS files correctly to fix MIME type errors
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));



// Routes (file-based only)
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/reset-password', resetPasswordRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'An error occurred while processing your request',
        error: err.message
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;

function startServer() {
    try {
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please free up port ${PORT} and try again.`);
                process.exit(1);
            } else {
                console.error('Server error:', err);
            }
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Make sure we release the port if the app is shutting down
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    process.exit(0);
});

startServer();
