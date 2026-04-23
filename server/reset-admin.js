const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db');
    
    const email = 'admin@ecerasystem.com';
    const admin = await User.findOne({ email });
    
    if (admin) {
      admin.password = 'password123'; // The pre-save hook in User model will hash this automatically
      await admin.save();
      console.log(`Successfully reset password for ${email} to: password123`);
    } else {
      console.log(`Admin user with email ${email} not found.`);
    }
    process.exit();
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
