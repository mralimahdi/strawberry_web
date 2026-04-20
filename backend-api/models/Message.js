const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    srno: {
        type: Number,
        required: true,
        unique: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'replied'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);