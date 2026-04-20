const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: String,
        required: true
    },
    items: [{
        product: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        country: String
    },
    paymentMethod: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['new', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'],
        default: 'new'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);