// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the MONGODB_URI environment variable.
    // The fallback to 'mongodb://localhost:27017/test' is for local development if MONGODB_URI isn't set.
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error message clearly if connection fails.
    console.error('Error connecting to MongoDB:', error.message);
    // Exit the process if the database connection fails on startup.
    // This prevents your server from running without a database connection.
    process.exit(1); 
  }
};

module.exports = connectDB;
