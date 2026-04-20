const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/strawberry-farm');

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            console.log('Updating admin credentials...');
            
            // Update admin credentials
            const hashedPassword = await bcrypt.hash('admin123', 10);
            existingAdmin.email = 'admin@strawberryfarm.com';
            existingAdmin.password = hashedPassword;
            existingAdmin.name = 'Administrator';
            await existingAdmin.save();
            
            console.log('Admin credentials updated successfully!');
            console.log('Email: admin@strawberryfarm.com');
            console.log('Password: admin123');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Get next srno
        const lastUser = await User.findOne().sort({ srno: -1 });
        const nextSrno = lastUser ? lastUser.srno + 1 : 1;

        // Create admin user
        const admin = new User({
            srno: nextSrno,
            role: 'admin',
            email: 'admin@strawberryfarm.com',
            name: 'Administrator',
            password: hashedPassword,
            phone: ''
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@strawberryfarm.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createAdmin();