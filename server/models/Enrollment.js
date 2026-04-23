const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }], // IDs of lessons from Course
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  certificateId: { type: String, unique: true, sparse: true },
  issuedAt: { type: Date }
}, { timestamps: true });

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
