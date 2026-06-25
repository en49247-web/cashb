const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cashXcrypto');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default admin account
    const adminExists = await User.findOne({ email: 'admin@cashXcrypto.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'System Admin',
        email: 'admin@cashXcrypto.com',
        password: hashedPassword,
        phone: '1234567890',
        countryCode: '+1',
        role: 'admin',
        kycStatus: 'Verified'
      });
      console.log('Default admin account seeded successfully: admin@cashXcrypto.com / admin123');
    }
  } catch (error) {
    console.error(`Database Connection/Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
