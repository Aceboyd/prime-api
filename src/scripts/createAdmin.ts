import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/userSchema'; // Adjust path to your User model
import connectDB from '../db'; // Import connectDB

const createAdmin = async () => {
  try {
    // Connect to MongoDB using connectDB
    await connectDB();
    console.log('MongoDB connection established');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('AdminPassword123!', saltRounds);

    // Create admin user
    const adminUser = new User({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      country: 'Global',
      phone: '+1234567890',
      role: 'admin',
      total_balance: 0,
      total_deposit: 0,
      total_profit: 0,
      kyc_status: 'approved',
      selected_trader: null,
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error: unknown) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createAdmin();