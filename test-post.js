const mongoose = require('mongoose');
const Post = require('./server/models/Post');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
    console.log('Connected to DB');

    // Create a dummy user ID if none exists or just use a random hex
    const dummyId = new mongoose.Types.ObjectId();

    const post = await Post.create({
      userId: dummyId,
      content: "Test Announcement from script",
      type: 'admin'
    });

    console.log('Post created successfully:', post);
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

test();
