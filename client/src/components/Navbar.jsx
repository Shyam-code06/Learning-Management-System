import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, LogOut, Menu, X, Layers, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLearningPage = location.pathname.startsWith('/learn');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-black/10 ${scrolled ? 'bg-primary-light/90 backdrop-blur-md shadow-md py-3' : 'bg-primary-light py-5'}`}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 text-xl font-bold text-text">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
            <Layers size={18} />
          </div>
          <span>Ecera System</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          {!isLearningPage && (
            <>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
            </>
          )}
          
          {user ? (
            <div className="flex items-center gap-4">
              {(location.pathname !== '/dashboard' || isLearningPage) && (
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 btn btn-outline py-2 px-4">
                  <LayoutDashboard size={18} />
                  {isLearningPage ? 'Go to Dashboard' : 'Dashboard'}
                </Link>
              )}
              {!isLearningPage && (
                <button onClick={logout} className="p-2 text-text-muted hover:text-primary transition-colors">
                  <LogOut size={20} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="btn btn-outline py-2 px-6">Login</Link>
              <Link to="/register" className="btn btn-primary py-2 px-6">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-text" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full p-6 flex flex-col gap-4 animate-fade shadow-lg">
          {!isLearningPage && (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/courses" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
            </>
          )}
          {user ? (
            <>
              {(location.pathname !== '/dashboard' || isLearningPage) && (
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                  {isLearningPage ? 'Go to Dashboard' : 'Dashboard'}
                </Link>
              )}
              {!isLearningPage && <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-primary">Logout</button>}
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline inline-block text-center" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary inline-block text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

    </nav>
  );
};

export default Navbar;
