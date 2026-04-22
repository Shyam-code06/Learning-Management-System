const express = require('express');
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, getAdminCourses } = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCourses);
router.get('/admin', protect, admin, getAdminCourses);
router.get('/:id', getCourseById);
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

module.exports = router;
