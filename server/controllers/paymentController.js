const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');

exports.processPayment = async (req, res) => {
  const { courseId, amount, couponCode } = req.body;
  try {
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

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).populate('courseId');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('courseId').populate('userId', 'name email');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
