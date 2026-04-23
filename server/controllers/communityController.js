const mongoose = require('mongoose');
const Post = require('../models/Post');
const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Create a new post
// @route   POST /api/community
// @access  Private
exports.createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Post content is required' });
  }

  try {
    const post = new Post({
      userId: req.user._id,
      content: content.trim(),
      type: 'student'
    });

    const savedPost = await post.save();


    return res.status(201).json({
      success: true,
      message: "Post shared with the community!",
      data: savedPost
    });
  } catch (error) {
    console.error('❌ Community Post Error:', error);
    return res.status(500).json({ success: false, message: 'Database error: ' + error.message });
  }
});

// @desc    Get all posts (Merged with Announcements)
// @route   GET /api/community
// @access  Private
exports.getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'name').populate('replies.userId', 'name').lean();
    const announcements = await Announcement.find().populate('adminId', 'name').lean();

    // Format announcements to look like posts for the UI
    const formattedAnnouncements = announcements.map(a => ({
      ...a,
      userId: a.adminId,
      type: 'admin',
      isAnnouncement: true
    }));

    const mergedFeed = [...posts, ...formattedAnnouncements].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      data: mergedFeed
    });
  } catch (error) {
    console.error('FEED FETCH ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch community feed' });
  }
});

// @desc    Like/Unlike a post
// @route   PUT /api/community/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    let modelType = 'post';

    if (!post) {
      post = await Announcement.findById(req.params.id);
      modelType = 'announcement';
    }

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const likes = post.likes || [];
    const likeIndex = likes.findIndex(id => id.toString() === userId);
    
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a post
// @route   DELETE /api/community/:id
// @access  Private (Admin or Owner)
exports.deletePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);
  let isAnn = false;

  if (!post) {
    post = await Announcement.findById(req.params.id);
    isAnn = true;
  }

  if (!post) {
    return res.status(404).json({ success: false, message: 'Content not found' });
  }

  const userId = req.user._id.toString();
  const ownerId = isAnn ? post.adminId?.toString() : post.userId?.toString();

  if (req.user.role !== 'admin' && userId !== ownerId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (isAnn) {
    await Announcement.findByIdAndDelete(req.params.id);
  } else {
    await Post.findByIdAndDelete(req.params.id);
  }

  res.status(200).json({ success: true, message: 'Content removed successfully' });
});

// @desc    Reply to a post
// @route   POST /api/community/:id/reply
// @access  Private
exports.replyToPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Reply content is required' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  post.replies.push({
    userId: req.user._id,
    content: content.trim()
  });
  post.repliesCount = post.replies.length;

  await post.save();
  
  // Return the full post with populated user in replies for the UI
  const updatedPost = await Post.findById(req.params.id).populate('userId', 'name').populate('replies.userId', 'name');

  res.status(200).json({ success: true, data: updatedPost });
});
