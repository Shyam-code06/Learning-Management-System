const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }], // IDs of lessons from Course
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
