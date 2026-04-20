const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Order = require('./models/Order');
const BookedTour = require('./models/BookedTour');
const Message = require('./models/Message');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/strawberry-farm';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB:', MONGODB_URI);

    // Clear existing dashboard collections
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      BookedTour.deleteMany({}),
      Message.deleteMany({})
    ]);

    const adminPassword = await bcrypt.hash('Admin@123', 10);

    const users = [
      {
        srno: 1,
        role: 'admin',
        email: 'admin@strawberryfarm.test',
        name: 'Admin User',
        password: adminPassword,
        phone: '555-0000'
      },
      {
        srno: 2,
        role: 'user',
        email: 'tony@example.com',
        name: 'Tony Stark',
        password: await bcrypt.hash('Tony1234', 10),
        phone: '+1-555-0101'
      },
      {
        srno: 3,
        role: 'user',
        email: 'natasha@example.com',
        name: 'Natasha Romanoff',
        password: await bcrypt.hash('Natasha123', 10),
        phone: '+1-555-0102'
      },
      {
        srno: 4,
        role: 'user',
        email: 'steve@example.com',
        name: 'Steve Rogers',
        password: await bcrypt.hash('Steve1234', 10),
        phone: '+1-555-0103'
      },
      {
        srno: 5,
        role: 'user',
        email: 'bruce@example.com',
        name: 'Bruce Banner',
        password: await bcrypt.hash('Bruce1234', 10),
        phone: '+1-555-0104'
      },
      {
        srno: 6,
        role: 'user',
        email: 'peter@example.com',
        name: 'Peter Parker',
        password: await bcrypt.hash('Peter1234', 10),
        phone: '+1-555-0105'
      }
    ];

    const orders = [
      {
        orderNumber: 'ORD1001',
        customer: 'Tony Stark',
        items: [{ product: 'Fresh Strawberries', quantity: 2 }],
        total: 24.98,
        shippingAddress: {
          street: '123 Berry Lane',
          city: 'Springfield',
          state: 'Illinois',
          country: 'USA'
        },
        paymentMethod: 'Credit Card',
        phone: '+1-555-0101',
        email: 'tony@example.com',
        status: 'new'
      },
      {
        orderNumber: 'ORD1002',
        customer: 'Natasha Romanoff',
        items: [{ product: 'Organic Raspberry Jam', quantity: 1 }],
        total: 15.50,
        shippingAddress: {
          street: '22 Freedom Blvd',
          city: 'New York',
          state: 'New York',
          country: 'USA'
        },
        paymentMethod: 'PayPal',
        phone: '+1-555-0102',
        email: 'natasha@example.com',
        status: 'new'
      },
      {
        orderNumber: 'ORD1003',
        customer: 'Steve Rogers',
        items: [{ product: 'Strawberry Yogurt Pack', quantity: 3 }],
        total: 27.00,
        shippingAddress: {
          street: '1 Liberty Ave',
          city: 'Boston',
          state: 'Massachusetts',
          country: 'USA'
        },
        paymentMethod: 'Mobile Pay',
        phone: '+1-555-0103',
        email: 'steve@example.com',
        status: 'new'
      },
      {
        orderNumber: 'ORD1004',
        customer: 'Bruce Banner',
        items: [{ product: 'Strawberry Smoothie Kit', quantity: 2 }],
        total: 19.98,
        shippingAddress: {
          street: '77 Green Way',
          city: 'Dayton',
          state: 'Ohio',
          country: 'USA'
        },
        paymentMethod: 'Credit Card',
        phone: '+1-555-0104',
        email: 'bruce@example.com',
        status: 'new'
      },
      {
        orderNumber: 'ORD2001',
        customer: 'Peter Parker',
        items: [{ product: 'Berry & Nut Gift Box', quantity: 1 }],
        total: 32.99,
        shippingAddress: {
          street: '20 Midtown St',
          city: 'Queens',
          state: 'New York',
          country: 'USA'
        },
        paymentMethod: 'Debit Card',
        phone: '+1-555-0105',
        email: 'peter@example.com',
        status: 'completed'
      },
      {
        orderNumber: 'ORD2002',
        customer: 'Natasha Romanoff',
        items: [{ product: 'Strawberry & Honey Basket', quantity: 2 }],
        total: 45.00,
        shippingAddress: {
          street: '22 Freedom Blvd',
          city: 'New York',
          state: 'New York',
          country: 'USA'
        },
        paymentMethod: 'PayPal',
        phone: '+1-555-0102',
        email: 'natasha@example.com',
        status: 'completed'
      },
      {
        orderNumber: 'ORD2003',
        customer: 'Tony Stark',
        items: [{ product: 'Strawberry Dessert Pack', quantity: 4 }],
        total: 52.00,
        shippingAddress: {
          street: '123 Berry Lane',
          city: 'Springfield',
          state: 'Illinois',
          country: 'USA'
        },
        paymentMethod: 'Credit Card',
        phone: '+1-555-0101',
        email: 'tony@example.com',
        status: 'completed'
      }
    ];

    const tours = [
      {
        srno: 1,
        name: 'Tony Stark',
        tourSelected: 'Sunset Berry Farm Tour',
        date: '2026-05-01',
        people: 2,
        time: '10:00 AM',
        contactNumber: '+1-555-0101',
        email: 'tony@example.com',
        status: 'booked'
      },
      {
        srno: 2,
        name: 'Natasha Romanoff',
        tourSelected: 'Strawberry Picking Experience',
        date: '2026-05-03',
        people: 3,
        time: '2:00 PM',
        contactNumber: '+1-555-0102',
        email: 'natasha@example.com',
        status: 'completed'
      },
      {
        srno: 3,
        name: 'Steve Rogers',
        tourSelected: 'Berry Farm Family Walk',
        date: '2026-05-05',
        people: 4,
        time: '11:30 AM',
        contactNumber: '+1-555-0103',
        email: 'steve@example.com',
        status: 'booked'
      },
      {
        srno: 4,
        name: 'Bruce Banner',
        tourSelected: 'Organic Farm Tasting Tour',
        date: '2026-05-07',
        people: 1,
        time: '9:00 AM',
        contactNumber: '+1-555-0104',
        email: 'bruce@example.com',
        status: 'cancelled'
      },
      {
        srno: 5,
        name: 'Peter Parker',
        tourSelected: 'Harvest Festival Tour',
        date: '2026-05-09',
        people: 2,
        time: '4:00 PM',
        contactNumber: '+1-555-0105',
        email: 'peter@example.com',
        status: 'booked'
      }
    ];

    const messages = [
      {
        srno: 1,
        date: '2026-04-10',
        time: '09:20 AM',
        name: 'Tony Stark',
        email: 'tony@example.com',
        phone: '+1-555-0101',
        message: 'Can I change my delivery address for the order?',
        status: 'pending'
      },
      {
        srno: 2,
        date: '2026-04-11',
        time: '11:45 AM',
        name: 'Natasha Romanoff',
        email: 'natasha@example.com',
        phone: '+1-555-0102',
        message: 'Do you offer gift wrapping for strawberry baskets?',
        status: 'replied'
      },
      {
        srno: 3,
        date: '2026-04-12',
        time: '02:15 PM',
        name: 'Steve Rogers',
        email: 'steve@example.com',
        phone: '+1-555-0103',
        message: 'What is the time slot for the farm tour?',
        status: 'pending'
      },
      {
        srno: 4,
        date: '2026-04-13',
        time: '05:05 PM',
        name: 'Bruce Banner',
        email: 'bruce@example.com',
        phone: '+1-555-0104',
        message: 'Is the farm open on weekends?',
        status: 'replied'
      },
      {
        srno: 5,
        date: '2026-04-14',
        time: '07:30 PM',
        name: 'Peter Parker',
        email: 'peter@example.com',
        phone: '+1-555-0105',
        message: 'Can I book a tour for my family next month?',
        status: 'pending'
      }
    ];

    await User.insertMany(users);
    await Order.insertMany(orders);
    await BookedTour.insertMany(tours);
    await Message.insertMany(messages);

    console.log('Dummy dashboard data seeded successfully.');
    console.log('Admin login: admin@strawberryfarm.test / Admin@123');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();
