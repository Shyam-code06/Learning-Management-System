const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
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

  try {
    const course = await Course.create({
      title,
      description,
      price,
      thumbnail: autoThumbnail,
      category,
      instructor: req.user.id,
      sections: []
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      course.title = req.body.title || course.title;
      course.description = req.body.description || course.description;
      course.price = req.body.price || course.price;
      course.thumbnail = req.body.thumbnail || course.thumbnail;
      course.category = req.body.category || course.category;
      course.sections = req.body.sections || course.sections;
      course.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : course.isPublished;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
