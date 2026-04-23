import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import AdminDashboard from './pages/AdminDashboard';
import CourseEditor from './pages/CourseEditor';
import StudentDashboard from './pages/StudentDashboard';
import LearningPage from './pages/LearningPage';
import Checkout from './pages/Checkout';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isLearningPage = location.pathname.startsWith('/learn');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/course/:id" element={<CourseDetails />} />

          {/* Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/learn/:id" element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout/:id" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/new" element={
            <ProtectedRoute adminOnly={true}>
              <CourseEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/edit/:id" element={
            <ProtectedRoute adminOnly={true}>
              <CourseEditor />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isLearningPage && <Footer />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2D2D2D',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#FA8072',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
