const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  
  const existingEnrollment = await Enrollment.findOne({ userId: req.user.id, courseId });
  if (existingEnrollment) {
    throw new ApiError(400, 'Already enrolled');
  }

  const enrollment = await Enrollment.create({
    userId: req.user.id,
    courseId,
    completedLessons: [],
    progress: 0
  });

  res.status(201).json(new ApiResponse(201, enrollment, "Enrolled successfully"));
});

exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ userId: req.user.id }).populate('courseId');
  res.status(200).json(new ApiResponse(200, enrollments, "Enrollments fetched successfully"));
});

exports.getEnrollmentByCourseId = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: req.params.courseId });
  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found');
  }
  res.status(200).json(new ApiResponse(200, enrollment, "Enrollment fetched successfully"));
});

exports.updateProgress = asyncHandler(async (req, res) => {
  const { lessonId } = req.body;
  
  const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId: req.params.courseId });
  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found');
  }

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
    
    // Calculate progress
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
    enrollment.progress = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0;
    
    if (enrollment.progress === 100) {
      enrollment.completed = true;
      // Issue a certificate if not already issued
      if (!enrollment.certificateId) {
        const certSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        enrollment.certificateId = `CERT-${req.user.id.toString().substring(18)}-${certSuffix}`;
        enrollment.issuedAt = new Date();
      }
    }
    
    await enrollment.save();
  }

  res.status(200).json(new ApiResponse(200, enrollment, "Progress updated successfully"));
});

exports.getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find().populate('courseId', 'title thumbnail category');
  res.status(200).json(new ApiResponse(200, enrollments, "All enrollments fetched successfully"));
});

exports.deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOneAndDelete({ userId: req.user.id, courseId: req.params.courseId });
  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found');
  }
  res.status(200).json(new ApiResponse(200, null, "Course removed successfully from your dashboard"));
});
