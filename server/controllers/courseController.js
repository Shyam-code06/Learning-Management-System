const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true });
  res.status(200).json(new ApiResponse(200, courses, "Courses fetched successfully"));
});

exports.getAdminCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user.id });
  res.status(200).json(new ApiResponse(200, courses, "Admin courses fetched successfully"));
});

exports.getCourseById = asyncHandler(async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid Course ID format. Please use a valid 24-character hex ID.");
  }
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }
  res.status(200).json(new ApiResponse(200, course, "Course fetched successfully"));
});

exports.createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, category } = req.body;

  // Constant high-quality images based on category
  const categoryImages = {
    Development: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    Design: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
    Business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    Marketing: 'https://images.unsplash.com/photo-1533750516457-a7f992034fce?auto=format&fit=crop&w=800&q=80',
    Default: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80'
  };

  const autoThumbnail = req.body.thumbnail || (categoryImages[category] || categoryImages.Default);

  const course = await Course.create({
    title,
    description,
    price,
    thumbnail: autoThumbnail,
    category,
    instructor: req.user.id,
    sections: req.body.sections || []
  });

  res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  course.title = req.body.title || course.title;
  course.description = req.body.description || course.description;
  course.price = req.body.price || course.price;
  course.thumbnail = req.body.thumbnail || course.thumbnail;
  course.category = req.body.category || course.category;
  course.sections = req.body.sections || course.sections;
  course.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : course.isPublished;

  const updatedCourse = await course.save();
  res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  await course.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Course removed successfully"));
});
