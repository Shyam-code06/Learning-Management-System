const express = require('express');
const { createCoupon, getCoupons, validateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);
router.post('/validate', protect, validateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
