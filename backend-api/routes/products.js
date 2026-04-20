const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/products'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new product (admin only)
router.post('/', [auth, isAdmin, upload.single('image')], async (req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: `/uploads/products/${req.file.filename}`,
            stock: req.body.stock
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update product (admin only)
router.patch('/:id', [auth, isAdmin], async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        updates.forEach(update => product[update] = req.body[update]);
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product (admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Delete product image if exists
        if (product.image) {
            const imagePath = path.join(__dirname, '../public', product.image);
            await fs.unlink(imagePath).catch(() => {});
        }
        
        await product.remove();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
