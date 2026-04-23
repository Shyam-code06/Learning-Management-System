const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Refund', refundSchema);
