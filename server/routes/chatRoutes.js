const express = require('express');
const { sendMessage, getMessages, getConversations } = require('../controllers/chatController');
const { askAI, askAdminAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, sendMessage);
router.post('/ai', protect, askAI);
router.post('/ai-admin', protect, askAdminAI);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);

module.exports = router;
