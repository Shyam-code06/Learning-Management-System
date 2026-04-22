const express = require('express');
const { enrollInCourse, getMyEnrollments, updateProgress, getEnrollmentByCourseId, getAllEnrollments } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllEnrollments);
router.post('/enroll', protect, enrollInCourse);
router.get('/my-enrollments', protect, getMyEnrollments);
router.get('/course/:courseId', protect, getEnrollmentByCourseId);
router.put('/progress/:courseId', protect, updateProgress);

module.exports = router;
