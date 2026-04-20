const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// Get all activity logs
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, type, userId, startDate, endDate } = req.query;

        const query = {};
        
        if (type) query.resourceType = type;
        if (userId) query.user = userId;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await ActivityLog.find(query)
            .populate('user', 'username email')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await ActivityLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
    }
});

// Get activity logs by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 50, type, startDate, endDate } = req.query;

        const query = { user: req.params.userId };
        
        if (type) query.resourceType = type;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await ActivityLog.find(query)
            .populate('user', 'username email')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await ActivityLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching user activity logs', 
            error: error.message 
        });
    }
});

// Get activity log by ID
router.get('/:id', async (req, res) => {
    try {
        const log = await ActivityLog.findById(req.params.id)
            .populate('user', 'username email');
            
        if (!log) {
            return res.status(404).json({ message: 'Activity log not found' });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity log', error: error.message });
    }
});

// Create new activity log
router.post('/', async (req, res) => {
    try {
        const log = new ActivityLog({
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        await log.save();

        res.status(201).json({
            message: 'Activity log created successfully',
            log
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating activity log', error: error.message });
    }
});

// Delete activity log (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const log = await ActivityLog.findByIdAndDelete(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Activity log not found' });
        }
        res.json({ message: 'Activity log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting activity log', error: error.message });
    }
});

// Clear old activity logs (admin only)
router.delete('/', async (req, res) => {
    try {
        const { olderThan } = req.query;
        if (!olderThan) {
            return res.status(400).json({ message: 'olderThan parameter is required' });
        }

        const date = new Date(olderThan);
        const result = await ActivityLog.deleteMany({
            timestamp: { $lt: date }
        });

        res.json({
            message: 'Old activity logs cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing activity logs', error: error.message });
    }
});

module.exports = router;
