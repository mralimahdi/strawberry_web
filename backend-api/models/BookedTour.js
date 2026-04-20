const mongoose = require('mongoose');

const bookedTourSchema = new mongoose.Schema({
    srno: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    tourSelected: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    people: {
        type: Number,
        required: true,
        min: 1
    },
    time: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed'],
        default: 'booked'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BookedTour', bookedTourSchema);