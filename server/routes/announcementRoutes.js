const express = require('express');
const router = express.Router();
const { createAnnouncement } = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, createAnnouncement);

module.exports = router;
