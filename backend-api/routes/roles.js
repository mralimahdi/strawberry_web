const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { body } = require('express-validator');

// Get all roles
router.get('/', async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
});

// Get role by ID
router.get('/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching role', error: error.message });
    }
});

// Create new role
router.post('/', [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('permissions').isArray()
], async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Check if role already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const role = new Role({
            name,
            description,
            permissions
        });

        await role.save();

        res.status(201).json({
            message: 'Role created successfully',
            role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating role', error: error.message });
    }
});

// Update role
router.put('/:id', [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('permissions').optional().isArray()
], async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const role = await Role.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.json({
            message: 'Role updated successfully',
            role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating role', error: error.message });
    }
});

// Delete role
router.delete('/:id', async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting role', error: error.message });
    }
});

// Add permission to role
router.post('/:id/permissions', [
    body('resource').notEmpty(),
    body('actions').isArray()
], async (req, res) => {
    try {
        const { resource, actions } = req.body;
        
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.permissions.push({ resource, actions });
        role.updatedAt = new Date();
        await role.save();

        res.json({
            message: 'Permission added successfully',
            role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding permission', error: error.message });
    }
});

// Remove permission from role
router.delete('/:id/permissions/:permissionId', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.permissions = role.permissions.filter(
            p => p._id.toString() !== req.params.permissionId
        );
        role.updatedAt = new Date();
        await role.save();

        res.json({
            message: 'Permission removed successfully',
            role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error removing permission', error: error.message });
    }
});

module.exports = router;
