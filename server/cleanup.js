const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const dotenv = require('dotenv');
dotenv.config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db');
    const admin = await User.findOne({ email: 'admin@ecerasystem.com' });
    
    if (admin) {
      console.log(`Admin found: ${admin.name} (${admin._id})`);
      
      // Delete courses NOT created by admin
      const deleteResult = await Course.deleteMany({ instructor: { $ne: admin._id } });
      console.log(`Deleted ${deleteResult.deletedCount} courses that were not created by admin.`);

      // Update remaining courses with professional photos based on category
      const photos = {
        'Development': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
        'Design': 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&q=80',
        'Marketing': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80',
        'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
      };

      const courses = await Course.find({ instructor: admin._id });
      for (const course of courses) {
        const photo = photos[course.category] || photos['Development'];
        await Course.findByIdAndUpdate(course._id, { thumbnail: photo });
      }
      console.log(`Updated thumbnails for ${courses.length} courses with professional images.`);
      
    } else {
      console.log('Admin user not found.');
    }
    process.exit();
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanup();
