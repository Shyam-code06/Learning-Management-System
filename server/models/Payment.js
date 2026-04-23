const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  transactionId: { type: String, required: true },
  couponCode: { type: String }
}, { timestamps: true });

paymentSchema.index({ userId: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
