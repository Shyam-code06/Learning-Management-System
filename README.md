# Learning Management System

A full-stack learning management platform built with React and Node.js/Express, allowing students to browse, enroll in courses, and administrators to manage course content and track enrollments.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)

## ✨ Features

### Student Features
- User authentication (Register/Login)
- Browse course catalog
- View detailed course information
- Enroll in courses
- Track learning progress
- Access enrolled courses on dashboard
- Apply coupon codes for discounts
- **AI Chatbot with Gemini** - Get instant help with course-related questions

### Admin Features
- Admin dashboard for course management
- Create, edit, and delete courses
- Manage course content and sections
- View student enrollments
- Track course sales and revenue
- Coupon management system
- **AI Assistant for Admins** - Get strategic insights and platform analytics

### General Features
- Secure JWT-based authentication
- Role-based access control (Student/Admin)
- Payment processing integration
- Responsive UI with Bootstrap & React
- RESTful API architecture

## 🛠️ Tech Stack

### Frontend
- **React** 19.2 - UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Bootstrap 5** - UI framework
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Google Gemini AI** - AI-powered chatbot and admin assistant

## 📁 Project Structure

```
Learning-Management-System/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CourseCatalog.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CourseEditor.jsx
│   │   │   └── LearningPage.jsx
│   │   ├── context/                # React Context
│   │   │   └── AuthContext.jsx     # Authentication state
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── index.html
│
├── server/                          # Node.js/Express backend
│   ├── controllers/                # Route handlers
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── paymentController.js
│   │   └── couponController.js
│   ├── models/                     # MongoDB schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Payment.js
│   │   └── Coupon.js
│   ├── routes/                     # API routes
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── couponRoutes.js
│   ├── middleware/                 # Express middleware
│   │   └── authMiddleware.js
│   ├── config/                     # Configuration files
│   │   └── db.js                  # Database connection
│   ├── index.js                   # Express app entry point
│   ├── seed.js                    # Database seeding script
│   └── package.json
│
└── README.md                       # This file
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0 or higher)
- **npm** (v6.0 or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Shyam-code06/Learning-Management-System.git
cd Learning-Management-System
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## ⚙️ Configuration

### Backend Setup (.env file)

Create a `.env` file in the `server` directory:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lms
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Payment Gateway (if applicable)
PAYMENT_API_KEY=your_payment_api_key

# Email Configuration (optional)
EMAIL_SERVICE=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

### Frontend Setup (.env file)

Create a `.env` file in the `client` directory:

```bash
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

#### Start the Backend Server

```bash
cd server
npm start
# or
npm run dev
```

The server will run on `http://localhost:5000`

#### Start the Frontend Application

In a new terminal:

```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173` (or another available port)

### Production Build

#### Build Frontend

```bash
cd client
npm run build
```

This creates an optimized production build in `client/dist/`

#### Deploy Backend

Deploy the server to your hosting platform (Heroku, AWS, DigitalOcean, etc.)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Admin only)
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments/:id` - Get enrollment details

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get payment history

### Coupons
- `POST /api/coupons` - Create coupon (Admin only)
- `GET /api/coupons/validate/:code` - Validate coupon code
- `DELETE /api/coupons/:id` - Delete coupon (Admin only)

### AI Chatbot
- `POST /api/ai/ask` - Ask AI chatbot (Student) - Get instant help with course-related questions using Google Gemini
- `POST /api/ai/admin` - Ask AI assistant (Admin) - Get strategic insights and platform analytics

## 🤖 AI Chatbot Integration

This project includes an AI-powered chatbot using **Google Gemini** to enhance the learning experience.

### Student AI Chatbot
- Located in the student dashboard
- Provides instant answers to course-related questions
- Uses enrolled course context for personalized responses
- Powered by Google Gemini AI (gemma-3-27b-it model)

### Admin AI Assistant
- Located in the admin dashboard
- Provides strategic insights and platform analytics
- Analyzes revenue, student, and course statistics
- Helps administrators make data-driven decisions

### Setup Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your server `.env` file:

```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> **Note:** The AI features will work in demo mode without an API key, but for full functionality, a valid Gemini API key is required.

## 💡 Usage

### For Students

1. Visit the home page and click "Register"
2. Create an account with your credentials
3. Log in to access the course catalog
4. Browse available courses
5. Click on a course to view details
6. Click "Enroll Now" to enroll in the course
7. Proceed to checkout and complete payment
8. Access enrolled courses from your student dashboard

### For Administrators

1. Log in with admin credentials
2. Access the admin dashboard
3. Manage courses: Create, edit, or delete courses
4. View student enrollments and revenue
5. Manage coupon codes
6. Monitor platform activity

## 🗄️ Database

### MongoDB Collections

- **Users**: Stores user account information
- **Courses**: Stores course details and content
- **Enrollments**: Tracks student course enrollments
- **Payments**: Records payment transactions
- **Coupons**: Manages discount coupon codes

## 📝 Seeding the Database

To populate the database with sample data:

```bash
cd server
node seed.js
```

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 is already in use, modify the `PORT` in `.env` or change it in `server/index.js`

### Database Connection Error
- Verify MongoDB is running
- Check your `MONGODB_URI` in `.env`
- Ensure network access is allowed (if using MongoDB Atlas)

### CORS Errors
- Verify the `VITE_API_URL` matches your backend URL
- Check CORS configuration in `server/index.js`

### Module Not Found
- Delete `node_modules` folder
- Run `npm install` again

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Shyam Kachhadiya

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Learning!** 🎓