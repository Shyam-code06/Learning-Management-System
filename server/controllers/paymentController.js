const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.processPayment = asyncHandler(async (req, res) => {
  const { courseId, amount, couponCode } = req.body;
  
  // Simulate payment success
  const payment = await Payment.create({
    userId: req.user.id,
    courseId,
    amount,
    paymentStatus: 'completed',
    transactionId: 'SIM_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    couponCode
  });

  // Create enrollment automatically after successful payment
  await Enrollment.create({
    userId: req.user.id,
    courseId,
    completedLessons: [],
    progress: 0
  });

  res.status(201).json(new ApiResponse(201, payment, "Payment processed successfully"));
});

exports.getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id }).populate('courseId');
  res.status(200).json(new ApiResponse(200, payments, "My payments fetched successfully"));
});

exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate('courseId').populate('userId', 'name email');
  res.status(200).json(new ApiResponse(200, payments, "All payments fetched successfully"));
});
