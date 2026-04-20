const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    srno: {
        type: Number,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);