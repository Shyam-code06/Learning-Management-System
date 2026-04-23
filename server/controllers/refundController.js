const Refund = require('../models/Refund');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Request a refund
// @route   POST /api/refunds
// @access  Private
exports.requestRefund = asyncHandler(async (req, res) => {
  const { enrollmentId, reason } = req.body;
  
  const enrollment = await Enrollment.findById(enrollmentId).populate('courseId');
  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found');
  }

  // Check 5-day policy
  const enrollmentDate = new Date(enrollment.createdAt);
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  if (enrollmentDate < fiveDaysAgo) {
    throw new ApiError(400, 'Refund policy window (5 days) has expired for this course');
  }

  // Find payment to get amount
  const payment = await Payment.findOne({ 
    userId: req.user._id, 
    courseId: enrollment.courseId._id 
  });

  const refund = await Refund.create({
    enrollmentId,
    userId: req.user._id,
    courseId: enrollment.courseId._id,
    reason,
    amount: payment ? payment.amount : enrollment.courseId.price,
    status: 'pending'
  });

  res.status(201).json(new ApiResponse(201, refund, "Refund request submitted successfully"));
});

// @desc    Get all refunds (Admin)
// @route   GET /api/refunds
// @access  Private/Admin
exports.getAllRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .populate('courseId', 'title');
  res.status(200).json(new ApiResponse(200, refunds, "Refunds fetched successfully"));
});

// @desc    Update refund status (Admin)
// @route   PUT /api/refunds/:id
// @access  Private/Admin
exports.updateRefundStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const refund = await Refund.findById(req.params.id);
  
  if (!refund) {
    throw new ApiError(404, 'Refund request not found');
  }

  refund.status = status;
  await refund.save();

  // If approved, delete enrollment
  if (status === 'approved') {
    await Enrollment.findByIdAndDelete(refund.enrollmentId);
  }

  res.status(200).json(new ApiResponse(200, refund, `Refund request ${status}`));
});

// @desc    Get my refunds
// @route   GET /api/refunds/my-refunds
// @access  Private
exports.getMyRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find({ userId: req.user._id }).populate('courseId', 'title');
  res.status(200).json(new ApiResponse(200, refunds, "Your refunds fetched successfully"));
});
