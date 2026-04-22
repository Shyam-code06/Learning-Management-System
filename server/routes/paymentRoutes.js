const express = require('express');
const { processPayment, getMyPayments, getAllPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/process', protect, processPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/', getAllPayments);

module.exports = router;
