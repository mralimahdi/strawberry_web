const mongoose = require('mongoose');
const { databaseConfig } = require('./config');

const connectDB = async () => {
    try {
        await mongoose.connect(databaseConfig.mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;