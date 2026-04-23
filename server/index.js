const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes
const authRouter = require('./routes/authRoutes');
const courseRouter = require('./routes/courseRoutes');
const enrollmentRouter = require('./routes/enrollmentRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const couponRouter = require('./routes/couponRoutes');
const communityRouter = require('./routes/communityRoutes');
const refundRouter = require('./routes/refundRoutes');

app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/community', communityRouter);
app.use('/api/refunds', refundRouter);
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Error Handling Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
