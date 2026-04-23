const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code, isActive: true });
  
  if (coupon && new Date(coupon.expiryDate) > new Date()) {
    res.status(200).json(new ApiResponse(200, coupon, "Coupon is valid"));
  } else {
    throw new ApiError(400, 'Invalid or expired coupon');
  }
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }
  await coupon.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Coupon removed successfully"));
});
