const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const User = require('./models/User');
const Message = require('./models/Message');
const BookedTour = require('./models/BookedTour');
const Order = require('./models/Order');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/strawberry-farm');

const migrateData = async () => {
    try {
        console.log('Starting data migration...');

        // Migrate users from customers.txt
        console.log('Migrating users...');
        const customersData = await fs.readFile(path.join(__dirname, 'customers.txt'), 'utf8');
        const customerLines = customersData.split('\n').filter(line => line.trim());

        for (const line of customerLines) {
            const [srno, role, email, name, password, phone] = line.split(',');
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                const user = new User({
                    srno: parseInt(srno),
                    role,
                    email,
                    name,
                    password, // Note: passwords are plain text in file, will be hashed on login
                    phone
                });
                await user.save();
                console.log(`Migrated user: ${email}`);
            }
        }

        // Migrate messages
        console.log('Migrating messages...');
        const messagesData = await fs.readFile(path.join(__dirname, 'messages.txt'), 'utf8');
        const messageLines = messagesData.split('\n').filter(line => line.trim());

        for (const line of messageLines) {
            const parts = line.split(',');
            if (parts.length >= 7) {
                const srno = parseInt(parts[0]);
                const date = parts[1];
                const time = parts[2];
                const name = parts[3];
                const email = parts[4];
                const phone = parts[5];
                const message = parts.slice(6).join(',').replace(/^"|"$/g, '');

                const existingMessage = await Message.findOne({ srno });
                if (!existingMessage) {
                    const msg = new Message({
                        srno,
                        date,
                        time,
                        name,
                        email,
                        phone,
                        message,
                        status: 'replied' // Assuming existing messages are replied
                    });
                    await msg.save();
                    console.log(`Migrated message: ${srno}`);
                }
            }
        }

        // Migrate booked tours
        console.log('Migrating booked tours...');
        const toursData = await fs.readFile(path.join(__dirname, 'booked_tours.txt'), 'utf8');
        const tourLines = toursData.split('\n').filter(line => line.trim()).slice(1); // Skip header

        for (const line of tourLines) {
            const [srno, name, tourSelected, date, people, time, contactNumber, status] = line.split(',');
            const existingTour = await BookedTour.findOne({ srno: parseInt(srno) });
            if (!existingTour) {
                const tour = new BookedTour({
                    srno: parseInt(srno),
                    name,
                    tourSelected,
                    date,
                    people: parseInt(people),
                    time,
                    contactNumber,
                    status: status || 'booked'
                });
                await tour.save();
                console.log(`Migrated tour booking: ${srno}`);
            }
        }

        // Migrate orders
        console.log('Migrating orders...');
        const ordersData = await fs.readFile(path.join(__dirname, 'orders.txt'), 'utf8');
        const orderLines = ordersData.split('\n').filter(line => line.trim()).slice(1); // Skip header

        for (const line of orderLines) {
            // Simple CSV parsing - split by comma but handle quotes
            const parts = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    parts.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            parts.push(current);

            if (parts.length >= 12) {
                const orderNumber = parts[0];
                const customer = parts[1];
                const products = parts[2];
                const quantity = parseInt(parts[3]);
                const total = parseFloat(parts[4]);
                const street = parts[5].replace(/^"|"$/g, '');
                const city = parts[6];
                const state = parts[7];
                const country = parts[8];
                const paymentMethod = parts[9];
                const phone = parts[10];
                const status = parts[11] || 'new';

                if (!isNaN(quantity) && !isNaN(total)) {
                    const existingOrder = await Order.findOne({ orderNumber });
                    if (!existingOrder) {
                        const order = new Order({
                            orderNumber,
                            customer,
                            items: [{
                                product: products,
                                quantity: quantity
                            }],
                            total,
                            shippingAddress: {
                                street,
                                city,
                                state,
                                country
                            },
                            paymentMethod,
                            phone,
                            status
                        });
                        await order.save();
                        console.log(`Migrated order: ${orderNumber}`);
                    }
                }
            }
        }

        // Migrate completed orders
        console.log('Migrating completed orders...');
        const completedOrdersData = await fs.readFile(path.join(__dirname, 'completed_orders.txt'), 'utf8');
        const completedOrderLines = completedOrdersData.split('\n').filter(line => line.trim()).slice(1); // Skip header

        for (const line of completedOrderLines) {
            // Simple CSV parsing - split by comma but handle quotes
            const parts = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    parts.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            parts.push(current);

            if (parts.length >= 12) {
                const orderNumber = parts[0];
                const customer = parts[1];
                const products = parts[2];
                const quantity = parseInt(parts[3]);
                const total = parseFloat(parts[4]);
                const street = parts[5].replace(/^"|"$/g, '');
                const city = parts[6];
                const state = parts[7];
                const country = parts[8];
                const paymentMethod = parts[9];
                const phone = parts[10];
                const status = 'completed';

                if (!isNaN(quantity) && !isNaN(total)) {
                    const existingOrder = await Order.findOne({ orderNumber });
                    if (!existingOrder) {
                        const order = new Order({
                            orderNumber,
                            customer,
                            items: [{
                                product: products,
                                quantity: quantity
                            }],
                            total,
                            shippingAddress: {
                                street,
                                city,
                                state,
                                country
                            },
                            paymentMethod,
                            phone,
                            status
                        });
                        await order.save();
                        console.log(`Migrated completed order: ${orderNumber}`);
                    }
                }
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        mongoose.connection.close();
    }
};

migrateData();