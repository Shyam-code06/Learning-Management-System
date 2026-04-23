const express = require('express');
const router = express.Router();
const { requestRefund, getAllRefunds, updateRefundStatus } = require('../controllers/refundController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, requestRefund).get(protect, admin, getAllRefunds);
router.route('/my-refunds').get(protect, require('../controllers/refundController').getMyRefunds);
router.route('/:id').put(protect, admin, updateRefundStatus);

module.exports = router;
