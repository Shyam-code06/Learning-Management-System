import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, ChevronRight, PlayCircle, Star, Clock, Activity, Home, MessageSquare, Settings, HelpCircle, User as UserIcon, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchEnrollments();
    fetchCoupons();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/enrollments/my-enrollments');
      setEnrollments(res.data);
    } catch (error) {
      console.error('Error fetching enrollments', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/coupons');
      const activeCoupons = res.data.filter(c => new Date(c.expiryDate) > new Date() && c.isActive);
      setCoupons(activeCoupons);
    } catch (error) {
      console.error('Error fetching coupons', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const activeCourse = enrollments.length > 0 ? enrollments[0] : null;
  const otherCourses = enrollments.length > 1 ? enrollments.slice(1) : [];

  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 lg:gap-3 px-4 py-2 lg:py-3 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0 lg:w-full ${
        activeTab === id 
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
        : 'text-text hover:bg-background hover:text-primary'
      }`}
    >
      <Icon size={18} className="lg:w-5 lg:h-5" /> 
      <span className="text-sm lg:text-base">{label}</span>
    </button>
  );

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Menu */}
          <div className="lg:w-64 flex-shrink-0 w-full overflow-hidden">
            <div className="card p-3 lg:p-4 lg:sticky lg:top-28 shadow-sm border-border flex flex-col">
              
              {/* Profile Block - Hidden on very small screens, row on mobile, col on desktop */}
              <div className="hidden sm:flex lg:flex-col items-center lg:items-start text-left gap-4 mb-4 lg:mb-6 px-2 lg:px-4">
                <div className="w-12 h-12 lg:w-20 lg:h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xl lg:text-3xl font-bold shadow-sm border-2 border-white flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="font-bold text-lg lg:text-xl text-text leading-tight">{user?.name || 'Student'}</h2>
                  <p className="text-xs lg:text-sm text-text-muted">Pro Learner</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
                <h3 className="hidden lg:block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 mt-2 px-4">Menu</h3>
                <NavButton id="dashboard" icon={Home} label="Dashboard" />
                <NavButton id="courses" icon={BookOpen} label="My Courses" />
                <NavButton id="certificates" icon={Award} label="Certificates" />
                <NavButton id="community" icon={MessageSquare} label="Community" />
                
                <h3 className="hidden lg:block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 mt-4 px-4">Support</h3>
                <NavButton id="profile" icon={UserIcon} label="Profile" />
                <NavButton id="settings" icon={Settings} label="Settings" />
                <NavButton id="help" icon={HelpCircle} label="Help Center" />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow">
            
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-text mb-2">
                      {getGreeting()}, <span className="text-primary">{user?.name?.split(' ')[0] || 'Student'}!</span>
                    </h1>
                    <p className="text-text-muted text-sm">Ready to continue your learning journey?</p>
                  </div>
                  <Link to="/courses" className="btn btn-outline hover:bg-primary hover:text-white transition-all px-6 py-2 rounded-full flex items-center gap-2">
                    Explore Catalog <ChevronRight size={16} />
                  </Link>
                </div>

                {/* Available Coupons Banner */}
                {coupons.length > 0 && (
                  <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 text-white shadow-md flex justify-between items-center overflow-hidden relative">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                      <Tag size={120} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Tag size={20} /> Special Offers Available!</h3>
                      <p className="text-sm opacity-90">Use these codes at checkout to get discounts on your next course.</p>
                    </div>
                    <div className="flex gap-3 relative z-10">
                      {coupons.slice(0, 2).map(coupon => (
                        <div key={coupon._id} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30 text-center">
                          <span className="block font-bold tracking-wider text-lg">{coupon.code}</span>
                          <span className="text-[10px] uppercase font-bold opacity-90">{coupon.discountPercent}% OFF</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Enrolled', value: enrollments.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Completed', value: enrollments.filter(e => e.completed).length, icon: Award, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Certificates', value: 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                    { label: 'Hours', value: '12.5h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' }
                  ].map((stat, i) => (
                    <div key={i} className="card p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform border-border">
                      <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mb-3`}>
                        <stat.icon size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-text mb-1">{stat.value}</h3>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {loading ? (
                  <div className="animate-pulse space-y-6">
                    <div className="h-48 bg-white rounded-2xl w-full"></div>
                  </div>
                ) : enrollments.length > 0 ? (
                  <>
                    {activeCourse && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <Activity className="text-primary" size={20} />
                          <h2 className="text-xl font-bold">Jump Back In</h2>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border flex flex-col md:flex-row group hover:shadow-md transition-all">
                          <div className="md:w-2/5 relative overflow-hidden h-48 md:h-auto">
                            <img src={activeCourse.courseId.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Thumbnail" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{activeCourse.courseId.category}</span>
                            </div>
                          </div>
                          <div className="md:w-3/5 p-6 flex flex-col justify-center">
                            <h3 className="text-xl font-bold mb-2">{activeCourse.courseId.title}</h3>
                            <p className="text-sm text-text-muted mb-6 line-clamp-2">{activeCourse.courseId.description}</p>
                            <div className="mb-6">
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-text">Progress</span>
                                <span className="text-sm font-bold text-primary">{activeCourse.progress}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${activeCourse.progress}%` }} transition={{ duration: 1, delay: 0.3 }} className="bg-primary h-full rounded-full"></motion.div>
                              </div>
                            </div>
                            <Link to={`/learn/${activeCourse.courseId._id}`} className="btn btn-primary w-fit px-6 py-2 rounded-full text-sm shadow-sm hover:shadow-md">
                              Resume <PlayCircle className="ml-1" size={16} />
                            </Link>
                          </div>
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="card py-16 text-center rounded-2xl border-dashed border-2 border-border bg-white">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Your Learning Journey Awaits!</h2>
                    <p className="text-text-muted mb-6 max-w-md mx-auto text-sm">You haven't enrolled in any courses yet. Discover our premium catalog.</p>
                    <Link to="/courses" className="btn btn-primary px-8 py-3 rounded-full shadow-md hover:shadow-lg">Explore Catalog</Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="border-b border-border pb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">My Courses</h2>
                    <p className="text-text-muted text-sm">Track and resume your learning progress.</p>
                  </div>
                  <Link to="/courses" className="text-primary text-sm font-bold hover:underline">Browse More</Link>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrollment, index) => (
                    <motion.div key={enrollment._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Link to={`/learn/${enrollment.courseId._id}`} className="card p-0 overflow-hidden group flex flex-col h-full hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <div className="h-40 relative overflow-hidden">
                          <img src={enrollment.courseId.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="thumbnail" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 p-3 rounded-full text-primary shadow-lg"><PlayCircle size={24} /></div>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{enrollment.courseId.category}</span>
                          <h3 className="font-bold text-md mb-3 line-clamp-2 group-hover:text-primary transition-colors">{enrollment.courseId.title}</h3>
                          <div className="mt-auto pt-3 border-t border-border">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-text-muted">Progress</span>
                              <span className="text-xs font-bold">{enrollment.progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1">
                              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${enrollment.progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  {enrollments.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-border">
                      <p className="text-text-muted mb-4">You have not enrolled in any courses yet.</p>
                      <Link to="/courses" className="btn btn-primary px-6 py-2">Explore Catalog</Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Placeholder Tabs */}
            {['certificates', 'community', 'profile', 'settings', 'help'].includes(activeTab) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card py-20 text-center rounded-3xl border-dashed border-2 border-border bg-white flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                  {activeTab === 'certificates' && <Award size={40} />}
                  {activeTab === 'community' && <MessageSquare size={40} />}
                  {activeTab === 'profile' && <UserIcon size={40} />}
                  {activeTab === 'settings' && <Settings size={40} />}
                  {activeTab === 'help' && <HelpCircle size={40} />}
                </div>
                <h2 className="text-2xl font-bold mb-2 capitalize">{activeTab}</h2>
                <p className="text-text-muted mb-6 max-w-sm">
                  This section is currently under development. Check back soon for new features!
                </p>
                <button onClick={() => setActiveTab('dashboard')} className="btn btn-outline px-6 py-2">
                  Return to Dashboard
                </button>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
