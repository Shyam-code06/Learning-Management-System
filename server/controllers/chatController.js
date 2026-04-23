const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;
  
  if (!content) {
    throw new ApiError(400, "Message content is required");
  }

  const message = await Message.create({
    senderId: req.user._id,
    receiverId,
    content
  });

  res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

// @desc    Get messages between two users
// @route   GET /api/chat/:userId
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user._id, receiverId: req.params.userId },
      { senderId: req.params.userId, receiverId: req.user._id }
    ]
  }).sort({ createdAt: 1 });

  res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

// @desc    Get list of users I have chatted with (Admin)
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  // Find unique users who have messaged the admin or vice versa
  const messages = await Message.find({
    $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
  }).populate('senderId', 'name email').populate('receiverId', 'name email');

  const contacts = new Set();
  const contactList = [];

  messages.forEach(m => {
    const contact = m.senderId._id.toString() === req.user._id.toString() ? m.receiverId : m.senderId;
    if (!contacts.has(contact._id.toString())) {
      contacts.add(contact._id.toString());
      contactList.push(contact);
    }
  });

  res.status(200).json(new ApiResponse(200, contactList, "Conversations fetched"));
});
