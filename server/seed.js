const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Coupon = require('./models/Coupon');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db');
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await Course.deleteMany();
    await Coupon.deleteMany();

    // Create a demo admin if doesn't exist
    let admin = await User.findOne({ email: 'admin@edubloom.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@edubloom.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Create sample courses
    const courses = [
      {
        title: 'Mastering Modern React with Framer Motion',
        description: 'Learn how to build stunning, interactive user interfaces using React and Framer Motion. This course covers everything from basic animations to complex physics-based transitions.',
        price: 49.99,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'Development',
        instructor: admin._id,
        isPublished: true,
        sections: [
          {
            title: 'Introduction to Motion',
            lessons: [
              { title: 'Welcome to the Course', type: 'video', content: 'https://www.youtube.com/watch?v=znbCa4Rr054' },
              { title: 'Setting up your environment', type: 'text', content: 'Install Node.js and create a new React project using Vite.' }
            ]
          },
          {
            title: 'Advanced Animations',
            lessons: [
              { title: 'Gestures and Hover effects', type: 'video', content: 'https://www.youtube.com/watch?v=2V1WK-s5_wM' },
              { title: 'Physics based transitions', type: 'video', content: 'https://www.youtube.com/watch?v=PkPz7S262-w' }
            ]
          }
        ]
      },
      {
        title: 'Premium SaaS Design System',
        description: 'Design like a pro. Learn the principles of creating high-end SaaS platforms with consistent design tokens, layout grids, and premium aesthetics.',
        price: 79.99,
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'Design',
        instructor: admin._id,
        isPublished: true,
        sections: [
          {
            title: 'Design Foundations',
            lessons: [
              { title: 'Color Theory for SaaS', type: 'video', content: 'https://www.youtube.com/watch?v=LAKmZ-3POnY' },
              { title: 'Typography and Hierarchy', type: 'video', content: 'https://www.youtube.com/watch?v=W0f_uU96XpM' }
            ]
          }
        ]
      }
    ];

    await Course.insertMany(courses);
    console.log('Sample courses inserted');

    // Create coupons
    const coupons = [
      { code: 'WELCOME10', discountPercent: 10, expiryDate: new Date('2025-12-31'), isActive: true },
      { code: 'PROMO20', discountPercent: 20, expiryDate: new Date('2025-12-31'), isActive: true },
      { code: 'BIGSALE50', discountPercent: 50, expiryDate: new Date('2025-12-31'), isActive: true }
    ];

    await Coupon.insertMany(coupons);
    console.log('Coupons inserted');

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
