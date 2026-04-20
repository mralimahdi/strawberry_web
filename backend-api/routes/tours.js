const express = require('express');
const router = express.Router();
const BookedTour = require('../models/BookedTour');

// Get all tour bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await BookedTour.find().sort({ srno: 1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching tour bookings:', error);
        res.status(500).json({ error: 'Failed to read tour bookings.' });
    }
});

// Get tour booking by serial number
router.get('/:srno', async (req, res) => {
    try {
        const srno = parseInt(req.params.srno);
        if (isNaN(srno)) {
            return res.status(400).json({ error: 'Invalid serial number.' });
        }

        const booking = await BookedTour.findOne({ srno });
        if (!booking) {
            return res.status(404).json({ message: 'Tour booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching tour booking:', error);
        res.status(500).json({ error: 'Failed to read tour booking.' });
    }
});

// Delete a tour booking
router.delete('/:srno', async (req, res) => {
    try {
        const srno = parseInt(req.params.srno);
        if (isNaN(srno)) {
            return res.status(400).json({ error: 'Invalid serial number.' });
        }

        const booking = await BookedTour.findOneAndDelete({ srno });
        if (!booking) {
            return res.status(404).json({ message: 'Tour booking not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting tour booking:', error);
        res.status(500).json({ error: 'Failed to delete tour booking.' });
    }
});

// Create new tour booking
router.post('/', async (req, res) => {
    try {
        const { name, tourSelected, date, people, time, contactNumber, email } = req.body;
        if (!name || !tourSelected || !date || !people || !time || !contactNumber) {
            return res.status(400).json({ error: 'All fields required.' });
        }

        // Get next srno
        const lastBooking = await BookedTour.findOne().sort({ srno: -1 });
        const nextSrno = lastBooking ? lastBooking.srno + 1 : 1;

        // Create new tour booking
        const newBooking = new BookedTour({
            srno: nextSrno,
            name,
            tourSelected,
            date,
            people: parseInt(people),
            time,
            contactNumber,
            email: email || '',
            status: 'booked'
        });

        await newBooking.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving tour booking:', error);
        res.status(500).json({ error: 'Failed to save tour booking.' });
    }
});

module.exports = router;

module.exports = router;
