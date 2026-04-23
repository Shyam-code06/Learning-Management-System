const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, communityController.createPost);
router.get('/', protect, communityController.getAllPosts);
router.put('/:id/like', protect, communityController.toggleLike);
router.post('/:id/reply', protect, communityController.replyToPost);
router.delete('/:id', protect, communityController.deletePost);

module.exports = router;
