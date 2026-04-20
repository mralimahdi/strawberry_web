const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { rejectAdminIfLoggedIn } = require('../utils/authHelpers');

// Helper to get current date and time as strings
function getDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM
  return { date, time };
}

// Save a new message
router.post('/', rejectAdminIfLoggedIn, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'All fields required.' });
    }

    const { date, time } = getDateTime();

    // Get next srno
    const lastMessage = await Message.findOne().sort({ srno: -1 });
    const nextSrno = lastMessage ? lastMessage.srno + 1 : 1;

    // Create new message
    const newMessage = new Message({
      srno: nextSrno,
      date,
      time,
      name,
      email,
      phone,
      message,
      status: 'pending'
    });

    await newMessage.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ srno: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

router.post('/delete', async (req, res) => {
  try {
    const { srno } = req.body;
    if (!srno || isNaN(srno)) {
      return res.status(400).json({ error: 'Invalid srno provided.' });
    }

    const message = await Message.findOneAndDelete({ srno: parseInt(srno) });
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

module.exports = router;
