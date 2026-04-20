const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// Path to files
const CUSTOMERS_FILE = path.join(__dirname, '..', 'customers.txt');

// Verify JWT token
exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Read customers file
        const customersData = await fs.readFile(CUSTOMERS_FILE, 'utf8');
        const customers = customersData.split('\n').filter(line => line.trim());
        
        // Find user
        const user = customers.find(line => {
            const [id, role, email] = line.split(',');
            return id === decoded.userId;
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const [id, role, email, name, password] = user.split(',');
        req.user = { id, role, email, name };

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Check role permissions
exports.checkPermissions = (resource, requiredActions) => {
    return async (req, res, next) => {
        try {
            const role = await Role.findById(req.user.role);
            
            if (!role) {
                return res.status(403).json({ message: 'Role not found' });
            }

            const resourcePermissions = role.permissions.find(
                p => p.resource === resource
            );

            if (!resourcePermissions) {
                return res.status(403).json({ 
                    message: 'You do not have permission to access this resource' 
                });
            }

            const hasRequiredPermissions = requiredActions.every(
                action => resourcePermissions.actions.includes(action)
            );

            if (!hasRequiredPermissions) {
                return res.status(403).json({ 
                    message: 'You do not have sufficient permissions for this action' 
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ 
                message: 'Error checking permissions', 
                error: error.message 
            });
        }
    };
};

// Activity logger middleware
exports.logActivity = (actionType) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        res.json = async function(data) {
            try {
                const ActivityLog = require('../models/ActivityLog');
                await new ActivityLog({
                    user: req.user._id,
                    action: actionType,
                    resourceType: req.baseUrl.split('/')[2], // Extracts resource type from URL
                    resourceId: req.params.id || null,
                    details: {
                        method: req.method,
                        path: req.path,
                        body: req.body,
                        result: data
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }).save();
            } catch (error) {
                console.error('Error logging activity:', error);
            }
            
            res.json = originalJson;
            return res.json(data);
        };
        next();
    };
};

// Error handler middleware
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Invalid ID format'
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate key error',
            field: Object.keys(err.keyPattern)[0]
        });
    }

    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
