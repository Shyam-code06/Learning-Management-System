const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enrollInCourse = async (req, res) => {
  const { courseId } = req.body;
  try {
    const existingEnrollment = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (existingEnrollment) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId,
      completedLessons: [],
      progress: 0
    });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id }).populate('courseId');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEnrollmentByCourseId = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId: req.params.courseId });
    if (enrollment) {
      res.json(enrollment);
    } else {
      res.status(404).json({ message: 'Enrollment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  const { lessonId } = req.body;
  try {
    const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId: req.params.courseId });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      
      // Calculate progress
      const course = await Course.findById(req.params.courseId);
      const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
      enrollment.progress = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0;
      
      if (enrollment.progress === 100) enrollment.completed = true;
      
      await enrollment.save();
    }
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate('courseId', 'title thumbnail category');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
