const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// Simple announcement creation for admin
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { content } = req.body;
  console.log('📢 Announcement Attempt - Body:', req.body);
  console.log('📢 Announcement Attempt - User:', req.user?._id);
  
  if (!content) {
    return res.status(400).json({ success: false, message: "Content is required" });
  }

  try {
    const announcement = new Announcement({
      adminId: req.user?._id || new mongoose.Types.ObjectId(), // Fallback for debugging
      content
    });

    const saved = await announcement.save();
    console.log('✅ Announcement Saved:', saved._id);
    
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("❌ ADMIN POST ERROR:", err);
    return res.status(500).json({ success: false, message: "DB Error: " + err.message });
  }
});
