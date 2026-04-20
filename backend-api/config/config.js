// Database configuration
exports.databaseConfig = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/strawberry-farm'
};

// Email configuration
exports.emailConfig = {
    verificationTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    passwordResetTokenExpiry: 60 * 60 * 1000, // 1 hour
    smtp: {
        service: 'gmail',
        auth: {
            user: 'syedalimahdi1234@gmail.com',
            pass: 'yqqv pkro oeiz mlrz' // App password generated from Google Account
        }
    },
    templates: {
        welcome: {
            subject: 'Welcome to Strawberry Farm!',
            template: 'welcome'
        },
        verifyEmail: {
            subject: 'Verify Your Email',
            template: 'verify-email'
        },
        passwordReset: {
            subject: 'Reset Your Password',
            template: 'password-reset'
        },
        orderConfirmation: {
            subject: 'Order Confirmation',
            template: 'order-confirmation'
        },
        tourBooking: {
            subject: 'Tour Booking Confirmation',
            template: 'tour-booking'
        }
    }
};

// Order configuration
exports.orderConfig = {
    statuses: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    paymentStatuses: ['pending', 'completed', 'failed', 'refunded'],
    cancelTimeLimit: 24 * 60 * 60 * 1000, // 24 hours
    shippingMethods: {
        standard: {
            name: 'Standard Shipping',
            price: 5.99,
            estimatedDays: '3-5'
        },
        express: {
            name: 'Express Shipping',
            price: 14.99,
            estimatedDays: '1-2'
        }
    }
};

// Tour configuration
exports.tourConfig = {
    types: {
        standard: {
            name: 'Standard Tour',
            price: 25.00,
            duration: 60, // minutes
            maxPeople: 20
        },
        educational: {
            name: 'Educational Tour',
            price: 20.00,
            duration: 90,
            maxPeople: 30
        },
        premium: {
            name: 'Premium Tour',
            price: 40.00,
            duration: 120,
            maxPeople: 10
        },
        private: {
            name: 'Private Tour',
            price: 100.00,
            duration: 90,
            maxPeople: 6
        }
    },
    bookingTimeLimit: 24 * 60 * 60 * 1000, // 24 hours before tour
    cancellationTimeLimit: 24 * 60 * 60 * 1000 // 24 hours before tour
};

// Help center configuration
exports.helpConfig = {
    ticketCategories: ['general', 'orders', 'tours', 'technical', 'billing', 'other'],
    priorities: {
        low: {
            name: 'Low',
            responseTime: '48 hours'
        },
        medium: {
            name: 'Medium',
            responseTime: '24 hours'
        },
        high: {
            name: 'High',
            responseTime: '12 hours'
        },
        urgent: {
            name: 'Urgent',
            responseTime: '4 hours'
        }
    },
    maxAttachments: 5,
    maxAttachmentSize: 5 * 1024 * 1024 // 5MB
};

// User roles configuration
exports.rolesConfig = {
    types: {
        admin: {
            name: 'Administrator',
            permissions: ['*']
        },
        manager: {
            name: 'Manager',
            permissions: [
                'users:read',
                'orders:*',
                'tours:*',
                'help:*'
            ]
        },
        guide: {
            name: 'Tour Guide',
            permissions: [
                'tours:read',
                'tours:update'
            ]
        },
        customer: {
            name: 'Customer',
            permissions: [
                'orders:create',
                'orders:read',
                'tours:read',
                'tours:book',
                'help:create',
                'help:read'
            ]
        }
    }
};

// Security configuration
exports.securityConfig = {
    passwordMinLength: 8,
    passwordMaxLength: 128,
    passwordPattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    jwtExpiryTime: '24h',
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
};

// File upload configuration
exports.uploadConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    imageResizeOptions: {
        width: 800,
        height: 800,
        fit: 'inside'
    }
};

// API configuration
exports.apiConfig = {
    version: 'v1',
    baseUrl: '/api/v1',
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};
