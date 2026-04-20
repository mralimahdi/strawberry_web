const express = require('express');
const router = express.Router();
const { HelpTicket, FAQ } = require('../models/HelpCenter');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/tickets');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Get all help tickets
router.get('/tickets', async (req, res) => {
    try {
        const { status, category, priority, assignedTo } = req.query;
        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;

        const tickets = await HelpTicket.find(query)
            .populate('user', 'username email')
            .populate('assignedTo', 'username email')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching help tickets', error: error.message });
    }
});

// Get user's tickets
router.get('/tickets/user/:userId', async (req, res) => {
    try {
        const tickets = await HelpTicket.find({ user: req.params.userId })
            .populate('user', 'username email')
            .populate('assignedTo', 'username email')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user tickets', error: error.message });
    }
});

// Get ticket by ID
router.get('/tickets/:id', async (req, res) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id)
            .populate('user', 'username email')
            .populate('assignedTo', 'username email');
            
        if (!ticket) {
            return res.status(404).json({ message: 'Help ticket not found' });
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching help ticket', error: error.message });
    }
});

// Create new help ticket
router.post('/tickets', upload.array('attachments', 5), [
    body('subject').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').isIn(['general', 'orders', 'tours', 'technical', 'billing', 'other']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
    try {
        const attachments = req.files?.map(file => ({
            filename: file.originalname,
            path: file.path
        }));

        const ticket = new HelpTicket({
            ...req.body,
            attachments
        });

        await ticket.save();

        res.status(201).json({
            message: 'Help ticket created successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating help ticket', error: error.message });
    }
});

// Add response to ticket
router.post('/tickets/:id/responses', [
    body('message').trim().notEmpty()
], async (req, res) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Help ticket not found' });
        }

        ticket.responses.push({
            responder: req.body.responderId,
            message: req.body.message
        });
        
        ticket.updatedAt = new Date();
        await ticket.save();

        res.json({
            message: 'Response added successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding response', error: error.message });
    }
});

// Update ticket status
router.patch('/tickets/:id/status', [
    body('status').isIn(['open', 'in-progress', 'resolved', 'closed'])
], async (req, res) => {
    try {
        const { status } = req.body;
        
        const ticket = await HelpTicket.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status,
                    resolvedAt: status === 'resolved' ? new Date() : undefined,
                    updatedAt: new Date()
                }
            },
            { new: true }
        )
        .populate('user', 'username email')
        .populate('assignedTo', 'username email');

        if (!ticket) {
            return res.status(404).json({ message: 'Help ticket not found' });
        }

        res.json({
            message: 'Ticket status updated successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating ticket status', error: error.message });
    }
});

// Assign ticket to support staff
router.patch('/tickets/:id/assign', [
    body('assignedTo').isMongoId()
], async (req, res) => {
    try {
        const { assignedTo } = req.body;

        const ticket = await HelpTicket.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    assignedTo,
                    status: 'in-progress',
                    updatedAt: new Date()
                }
            },
            { new: true }
        )
        .populate('user', 'username email')
        .populate('assignedTo', 'username email');

        if (!ticket) {
            return res.status(404).json({ message: 'Help ticket not found' });
        }

        res.json({
            message: 'Ticket assigned successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning ticket', error: error.message });
    }
});

// Delete ticket
router.delete('/tickets/:id', async (req, res) => {
    try {
        const ticket = await HelpTicket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Help ticket not found' });
        }
        res.json({ message: 'Help ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting help ticket', error: error.message });
    }
});

// FAQ Routes

// Get all FAQs
router.get('/faqs', async (req, res) => {
    try {
        const { category } = req.query;
        const query = { isPublished: true };
        if (category) query.category = category;

        const faqs = await FAQ.find(query).sort({ category: 1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
    }
});

// Create new FAQ
router.post('/faqs', [
    body('question').trim().notEmpty(),
    body('answer').trim().notEmpty(),
    body('category').isIn(['general', 'orders', 'tours', 'technical', 'billing', 'other'])
], async (req, res) => {
    try {
        const faq = new FAQ(req.body);
        await faq.save();

        res.status(201).json({
            message: 'FAQ created successfully',
            faq
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating FAQ', error: error.message });
    }
});

// Update FAQ
router.put('/faqs/:id', [
    body('question').optional().trim(),
    body('answer').optional().trim(),
    body('category').optional().isIn(['general', 'orders', 'tours', 'technical', 'billing', 'other']),
    body('isPublished').optional().isBoolean()
], async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    ...req.body,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        res.json({
            message: 'FAQ updated successfully',
            faq
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating FAQ', error: error.message });
    }
});

// Delete FAQ
router.delete('/faqs/:id', async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting FAQ', error: error.message });
    }
});

module.exports = router;
