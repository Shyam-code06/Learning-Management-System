const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const user = await User.create({ name, email, password, role });
  
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };

  res.status(201).json(new ApiResponse(201, userData, "User registered successfully"));
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.comparePassword(password))) {
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    };
    res.status(200).json(new ApiResponse(200, userData, "User logged in successfully"));
  } else {
    throw new ApiError(401, 'Invalid email or password');
  }
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  await user.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "User removed successfully"));
});
