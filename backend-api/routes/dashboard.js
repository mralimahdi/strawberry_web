const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Order = require('../models/Order');
const BookedTour = require('../models/BookedTour');
const Message = require('../models/Message');
const User = require('../models/User');
const { requireCustomer } = require('../utils/authHelpers');

// New Orders
// Delete order
router.post('/orders/:id/delete', async (req, res) => {
  try {
    const orderNumber = req.params.id;
    const deleted = await Order.findOneAndDelete({ orderNumber });
    if (!deleted) return res.status(404).json({ success: false });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false });
  }
});

// Cancel (delete) new order from dashboard (for /api/dashboard/orders/cancel)
router.post('/orders/cancel', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Order ID required' });
    const deleted = await Order.findOneAndDelete({ orderNumber: id, status: 'new' });
    if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false });
  }
});

// Save new order
router.post('/orders/new', requireCustomer, async (req, res) => {
  try {
    const { customer, products, quantity, total, street, city, state, country, phone, email, paymentMethod } = req.body;
    const orderNumber = 'ORD' + Date.now();
    const order = new Order({
      orderNumber,
      customer: customer || '',
      items: [{ product: products || '', quantity: Number(quantity) || 0 }],
      total: Number(total) || 0,
      shippingAddress: {
        street: street || '',
        city: city || '',
        state: state || '',
        country: country || ''
      },
      paymentMethod: paymentMethod || '',
      phone: phone || '',
      email: email || '',
      status: 'new'
    });
    await order.save();
    res.json({ success: true, id: orderNumber });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orders/new', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'new' }).sort({ createdAt: -1 });
    res.json(orders.map(order => ({
      id: order.orderNumber,
      customer: order.customer,
      products: order.items.map(item => item.product).join(', '),
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.total,
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      country: order.shippingAddress.country,
      paymentMethod: order.paymentMethod,
      phone: order.phone
    })));
  } catch (error) {
    console.error('Error fetching new orders:', error);
    res.status(500).json([]);
  }
});

router.post('/orders/:id/complete', async (req, res) => {
  try {
    const orderNumber = req.params.id;
    const order = await Order.findOne({ orderNumber });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = 'completed';
    await order.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ success: false });
  }
});

router.get('/orders/completed', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' }).sort({ updatedAt: -1 });
    res.json(orders.map(order => ({
      id: order.orderNumber,
      customer: order.customer,
      products: order.items.map(item => item.product).join(', '),
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.total,
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      country: order.shippingAddress.country,
      paymentMethod: order.paymentMethod,
      phone: order.phone,
      status: order.status
    })));
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    res.status(500).json([]);
  }
});

// Delete completed order by id from dashboard (for /api/dashboard/orders/delete)
router.post('/orders/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Order ID required' });
    const deleted = await Order.findOneAndDelete({ orderNumber: id, status: 'completed' });
    if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting completed order:', error);
    res.status(500).json({ success: false });
  }
});

// Mark order as completed
router.post('/orders/completed', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Order ID required' });
    const order = await Order.findOne({ orderNumber: id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = 'completed';
    await order.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking order completed:', error);
    res.status(500).json({ success: false });
  }
});

// Booked Tours
router.post('/tours/booked/:id/delete', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await BookedTour.findOneAndDelete({ srno: Number(id) });
    if (!deleted) return res.status(404).json({ success: false, message: 'Tour not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting booked tour:', error);
    res.status(500).json({ success: false });
  }
});

router.post('/tours/delete', async (req, res) => {
  try {
    const { srno } = req.body;
    if (!srno) return res.status(400).json({ success: false, message: 'Tour srno required' });
    const deleted = await BookedTour.findOneAndDelete({ srno: Number(srno) });
    if (!deleted) return res.status(404).json({ success: false, message: 'Tour not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting booked tour:', error);
    res.status(500).json({ success: false });
  }
});

router.post('/tours/booked', requireCustomer, async (req, res) => {
  try {
    const { name, tourSelected, date, people, time, contactNumber, email } = req.body;
    const last = await BookedTour.findOne().sort({ srno: -1 });
    const srno = last ? last.srno + 1 : 1;
    const bookedTour = new BookedTour({
      srno,
      name: name || '',
      tourSelected: tourSelected || '',
      date: date || '',
      people: String(people || ''),
      time: time || '',
      contactNumber: contactNumber || '',
      email: email || '',
      status: 'booked'
    });
    await bookedTour.save();
    res.json({ success: true, srno });
  } catch (error) {
    console.error('Error saving booked tour:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/tours/booked', async (req, res) => {
  try {
    const tours = await BookedTour.find().sort({ srno: 1 });
    res.json(tours.map(tour => ({
      srno: tour.srno,
      name: tour.name,
      tourSelected: tour.tourSelected,
      date: tour.date,
      people: tour.people,
      time: tour.time,
      contactNumber: tour.contactNumber,
      status: tour.status
    })));
  } catch (error) {
    console.error('Error fetching booked tours:', error);
    res.status(500).json([]);
  }
});

// Messages
router.post('/messages/reply', async (req, res) => {
  const { messageId, fromEmail, toEmail, message } = req.body;

  if (!messageId || !fromEmail || !toEmail || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const transporter = require('../config/email.config');
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: 'Response to your message',
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><p>${message}</p><br><hr><p style="color: #666; font-size: 0.9em;">This is a reply to your message sent to Strawberry Farm</p></div>`
    });

    const updated = await Message.findOneAndUpdate(
      { srno: Number(messageId) },
      { status: 'replied' },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: true, message: 'Email sent but message status was not found' });
    }

    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply: ' + error.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ srno: 1 });
    res.json(messages.map(msg => ({
      srno: msg.srno,
      date: msg.date,
      time: msg.time,
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      message: msg.message,
      status: msg.status
    })));
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json([]);
  }
});

router.post('/messages/delete', async (req, res) => {
  try {
    const { srno } = req.body;
    if (!srno) return res.status(400).json({ error: 'Invalid srno provided.' });
    const deleted = await Message.findOneAndDelete({ srno: Number(srno) });
    if (!deleted) return res.status(404).json({ error: 'Message not found.' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

// Customers - Primary (registered) vs Secondary (interaction) details
router.get('/customers', async (req, res) => {
  try {
    const customers = [];

    // Get all registered users (primary customers)
    const users = await User.find({ role: 'user' }).lean();

    for (const user of users) {
      const primaryDetails = {
        name: user.name,
        email: user.email,
        phone: user.phone
      };

      // Find all interactions by this user via email
      const secondaryDetails = {
        orders: await Order.find({ email: user.email }).lean(),
        tours: await BookedTour.find({ email: user.email }).lean(),
        messages: await Message.find({ email: user.email }).lean()
      };

      // Aggregate interaction types
      const types = [];
      if (secondaryDetails.orders.length > 0) types.push('order');
      if (secondaryDetails.tours.length > 0) types.push('tour');
      if (secondaryDetails.messages.length > 0) types.push('message');

      // Get latest payment method, tour, message status
      let paymentMethod = '-';
      if (secondaryDetails.orders.length > 0) {
        paymentMethod = secondaryDetails.orders[0].paymentMethod || '-';
      }

      let tourName = '-';
      let tourStatus = '-';
      if (secondaryDetails.tours.length > 0) {
        tourName = secondaryDetails.tours[0].tourSelected || '-';
        tourStatus = secondaryDetails.tours[0].status || '-';
      }

      let messageStatus = '-';
      if (secondaryDetails.messages.length > 0) {
        messageStatus = secondaryDetails.messages[0].status || '-';
      }

      let orderStatus = '-';
      if (secondaryDetails.orders.length > 0) {
        orderStatus = secondaryDetails.orders[0].status || '-';
      }

      customers.push({
        srno: user.srno || customers.length + 1,
        // PRIMARY DETAILS (from registration)
        name: primaryDetails.name,
        email: primaryDetails.email,
        phone: primaryDetails.phone,
        // SECONDARY DETAILS (from interactions)
        type: types.join(', ') || '-',
        orderCount: secondaryDetails.orders.length,
        tourCount: secondaryDetails.tours.length,
        messageCount: secondaryDetails.messages.length,
        paymentMethod: paymentMethod,
        tourName: tourName,
        tourStatus: tourStatus,
        messageStatus: messageStatus,
        lastOrderStatus: orderStatus
      });
    }

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json([]);
  }
});

router.post('/customers/remove', async (req, res) => {
  try {
    const { srno } = req.body;
    if (!srno) return res.status(400).json({ success: false, message: 'Customer srno required' });
    const deleted = await User.findOneAndDelete({ srno: Number(srno), role: { $ne: 'admin' } });
    if (!deleted) return res.status(404).json({ success: false, message: 'Customer not found.' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing customer:', error);
    res.status(500).json({ success: false, message: 'Failed to remove customer.' });
  }
});

module.exports = router;
