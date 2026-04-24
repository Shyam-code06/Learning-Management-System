import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, ChevronRight, PlayCircle, Star, Clock, Activity, Home, MessageSquare, Settings, HelpCircle, User as UserIcon, Tag, X, Sparkles, FileText, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [posts, setPosts] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportInput, setSupportInput] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Academic Assistant. How can I help you with your courses today?" }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeReplyPost, setActiveReplyPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [supportMessages, aiMessages, isAiLoading]);

  useEffect(() => {
    fetchEnrollments();
    fetchCoupons();
    fetchPosts();
    fetchAdminId();
    fetchRefunds();
  }, []);

  const fetchAdminId = async () => {
    try {
      const res = await api.get('/auth/users');
      const admin = res.data.find(u => u.role === 'admin');
      if (admin) setAdminId(admin._id);
    } catch (error) {
      console.error('Error fetching admin info', error);
    }
  };

  useEffect(() => {
    if (isSupportOpen && adminId) {
      fetchChatMessages();
      const interval = setInterval(fetchChatMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isSupportOpen, adminId]);

  const fetchChatMessages = async () => {
    if (!adminId) return;
    try {
      const res = await api.get(`/chat/${adminId}`);
      setSupportMessages(res.data);
    } catch (error) {
      console.error('Error fetching chat', error);
    }
  };

  const handleSendSupportMessage = async (e) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    // AI Mode
    const userMsg = { role: 'user', content: supportInput };
    setAiMessages(prev => [...prev, userMsg]);
    setSupportInput('');
    setIsAiLoading(true);

    try {
      const res = await api.post('/chat/ai', { message: supportInput });
      
      // Robust extraction: Handle all response formats
      const aiText = res.data?.text || res.data?.data?.text || res.text || (typeof res.data === 'string' ? res.data : "I received a response but couldn't format it.");
      
      const aiMsg = { role: 'assistant', content: aiText };
      setAiMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Fetch Error:", error);
      toast.error('AI Assistant is currently unavailable');
      setAiMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later or contact support." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments/my-enrollments');
      setEnrollments(res.data?.data || res.data);
    } catch (error) {
      console.error('Error fetching enrollments', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      const couponsData = res.data?.data || res.data;
      const activeCoupons = (couponsData || []).filter(c => new Date(c.expiryDate) > new Date());
      setCoupons(activeCoupons);
    } catch (error) {
      console.error('Error fetching coupons', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community');
      setPosts(res.data?.data || res.data);
    } catch (error) {
      console.error('Error fetching posts', error);
    }
  };

  const fetchRefunds = async () => {
    try {
      const res = await api.get('/refunds/my-refunds');
      setRefunds(res.data?.data || res.data);
    } catch (error) {
      console.error('Error fetching refunds', error);
    }
  };

  const handleReply = async (postId) => {
    if (!replyContent.trim()) return;
    try {
      const res = await api.post(`/community/${postId}/reply`, { content: replyContent });
      const updatedPost = res.data?.data || res.data;
      setPosts(posts.map(p => p._id === postId ? { ...p, ...updatedPost } : p));
      setReplyContent('');
      toast.success('Reply posted!');
    } catch (error) {
      console.error('Reply Error:', error);
      toast.error('Failed to post reply');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    const loadingToast = toast.loading('Sharing with community...');
    try {
      await api.post('/community', { content: newPostContent });
      toast.dismiss(loadingToast);
      toast.success('Post shared with community!');
      setNewPostContent('');
      fetchPosts();
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || 'Failed to share post';
      toast.error(errorMsg);
    }
  };

  const handleRequestRefund = async (enrollmentId) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    try {
      await api.post('/refunds', { enrollmentId, reason });
      toast.success('Refund request submitted successfully');
      fetchEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request refund');
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await api.put(`/community/${postId}/like`);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post', error);
    }
  };

  const handleDeleteEnrollment = async (courseId) => {
    if (!window.confirm('Are you sure you want to remove this course from your dashboard? You will lose all progress.')) return;
    try {
      await api.delete(`/enrollments/course/${courseId}`);
      toast.success('Course removed from your dashboard', {
        icon: '🗑️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      fetchEnrollments();
    } catch (error) {
      toast.error('Failed to remove course');
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
                <NavButton id="community" icon={MessageSquare} label="Community" />
                
                <h3 className="hidden lg:block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 mt-4 px-4">Support</h3>
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
                    { label: 'Community', value: '24+', icon: MessageSquare, color: 'text-yellow-500', bg: 'bg-yellow-50' },
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
                            <div className="flex gap-4 items-center">
                              <Link to={`/learn/${activeCourse.courseId._id}`} className="btn btn-primary w-fit px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                                Resume Course <PlayCircle className="ml-2" size={18} />
                              </Link>
                              {refunds.find(r => r.courseId?._id === activeCourse.courseId?._id && r.status === 'pending') ? (
                                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100">
                                  Refund Pending
                                </span>
                              ) : (
                                <button 
                                  onClick={() => handleRequestRefund(activeCourse._id)}
                                  className="text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-colors"
                                >
                                  Cancel Enrollment
                                </button>
                              )}
                            </div>
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
                  {enrollments.map((enrollment, index) => {
                    const isNew = new Date(enrollment.createdAt) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                    return (
                    <motion.div key={enrollment._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <div className="card p-0 overflow-hidden group flex flex-col h-full hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <Link to={`/learn/${enrollment.courseId._id}`} className="h-40 relative overflow-hidden">
                          <img src={enrollment.courseId.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="thumbnail" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 p-3 rounded-full text-primary shadow-lg"><PlayCircle size={24} /></div>
                          </div>
                        </Link>
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{enrollment.courseId.category}</span>
                            {refunds.find(r => r.courseId?._id === enrollment.courseId?._id && r.status === 'pending') ? (
                              <span className="text-[9px] font-bold bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full border border-yellow-100">
                                Cancellation Pending
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleRequestRefund(enrollment._id)}
                                className="text-[9px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-full border border-red-100 transition-colors"
                              >
                                Cancel & Refund
                              </button>
                            )}
                          </div>
                          <h3 className="font-bold text-md mb-3 line-clamp-2 group-hover:text-primary transition-colors">{enrollment.courseId.title}</h3>
                          <div className="mt-auto pt-3 border-t border-border">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-text-muted">Progress</span>
                              <span className="text-xs font-bold">{enrollment.progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1 mb-4">
                              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${enrollment.progress}%` }}></div>
                            </div>
                            
                            {enrollment.progress === 100 ? (
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedCertificate(enrollment);
                                }}
                                className="w-full py-2.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                              >
                                <Award size={14} /> Download Certificate
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteEnrollment(enrollment.courseId._id);
                                }}
                                className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <X size={14} /> Remove Course
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )})}
                  {enrollments.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-border">
                      <p className="text-text-muted mb-4">You have not enrolled in any courses yet.</p>
                      <Link to="/courses" className="btn btn-primary px-6 py-2">Explore Catalog</Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'community' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="border-b border-border pb-6">
                  <h2 className="text-2xl font-bold mb-1">Ecera Community Hub</h2>
                  <p className="text-text-muted text-sm">Connect, share, and grow with fellow pro-learners.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Community Feed */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6 border-border bg-primary/5">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-primary"/> Share an update</h3>
                      <textarea 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Ask a question or share your progress..." 
                        className="w-full p-4 rounded-xl border border-border focus:border-primary focus:outline-none bg-white text-sm min-h-[100px] mb-4"
                      ></textarea>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-white rounded-lg text-text-muted transition-colors"><Star size={18}/></button>
                          <button className="p-2 hover:bg-white rounded-lg text-text-muted transition-colors"><Activity size={18}/></button>
                        </div>
                        <button 
                          onClick={handleCreatePost}
                          className="btn btn-primary px-6 py-2 rounded-full text-sm shadow-sm"
                        >
                          Post to Community
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {posts.length > 0 ? posts.map((post, i) => (
                        <div key={post._id} className="card p-6 border-border hover:border-primary/30 transition-all">
                          <div className="flex gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${post.type === 'admin' ? 'bg-primary text-white shadow-lg' : 'bg-secondary text-primary'}`}>
                              {post.userId?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm leading-tight flex items-center gap-2">
                                {post.userId?.name || 'Anonymous'}
                                {post.type === 'admin' && <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest">Admin</span>}
                              </h4>
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-text mb-4 whitespace-pre-wrap">{post.content}</p>
                          <div className="flex gap-6 pt-4 border-t border-secondary">
                            <button 
                              onClick={() => handleToggleLike(post._id)}
                              className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.likes?.some(l => l.toString() === user?._id?.toString()) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                            >
                              <Star size={16} fill={post.likes?.some(l => l.toString() === user?._id?.toString()) ? 'currentColor' : 'none'}/> {post.likes?.length || 0} Likes
                            </button>
                            <button 
                              onClick={() => setActiveReplyPost(activeReplyPost === post._id ? null : post._id)}
                              className={`flex items-center gap-2 text-xs font-bold transition-colors ${activeReplyPost === post._id ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                            >
                              <MessageSquare size={16}/> {post.repliesCount || 0} Replies
                            </button>
                          </div>

                          {/* Replies Section */}
                          {activeReplyPost === post._id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 pt-4 border-t border-secondary space-y-4"
                            >
                              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {(post.replies || []).map((reply, rIdx) => (
                                  <div key={rIdx} className="bg-background/50 p-3 rounded-xl border border-secondary/30">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-[10px] text-primary">{reply.userId?.name || 'Anonymous'}</span>
                                      <span className="text-[8px] text-text-muted font-bold uppercase">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-text">{reply.content}</p>
                                  </div>
                                ))}
                                {(post.replies || []).length === 0 && (
                                  <p className="text-center text-[10px] text-text-muted italic py-2">No replies yet. Be the first to comment!</p>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="flex-grow p-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary transition-all"
                                  onKeyPress={(e) => e.key === 'Enter' && handleReply(post._id)}
                                />
                                <button 
                                  onClick={() => handleReply(post._id)}
                                  className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-dark transition-all"
                                >
                                  Reply
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )) : (
                        <div className="text-center py-12 text-text-muted italic text-sm">
                          No posts yet. Be the first to share something!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <div className="card p-6 border-border">
                      <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-text-muted">Trending Topics</h3>
                      <div className="space-y-3">
                        {['#FigmaTips', '#ReactHooks', '#JobSearch', '#CodeChallenge', '#UIUXDesign'].map((tag, i) => (
                          <div key={i} className="flex justify-between items-center group cursor-pointer">
                            <span className="text-sm font-bold group-hover:text-primary transition-colors">{tag}</span>
                            <span className="text-xs text-text-muted">{(10 - i) * 15} posts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'help' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="border-b border-border pb-6">
                  <h2 className="text-2xl font-bold mb-1">Help Center</h2>
                  <p className="text-text-muted text-sm">Get support and find answers to your questions.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="card p-8 border-border">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                      <HelpCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Contact Support</h3>
                    <p className="text-text-muted text-sm mb-6">Our dedicated team at Ecera System is here to help you with any technical or academic issues.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center text-primary">
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Us</p>
                          <p className="font-bold">support@ecerasystem.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center text-primary">
                          <Activity size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Call Us (Ecera)</p>
                          <p className="font-bold">+1 (800) 123-4567</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center text-primary">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Support Hours</p>
                          <p className="font-bold">Mon-Fri, 9AM - 6PM EST</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card p-8 border-border bg-primary/5 border-primary/20">
                    <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-sm mb-2">Ecera Cancellation Policy</h4>
                        <p className="text-xs text-text-muted leading-relaxed">
                          We offer a **5-day "No-Questions-Asked" cancellation window**. If you are not satisfied, click the "Cancel & Refund" button on your course card. Once requested:
                          <ul className="list-disc ml-4 mt-2 space-y-1">
                            <li>Our admin team will review your request.</li>
                            <li>Upon approval, your access to materials will be instantly revoked.</li>
                            <li>You will see an **"Access Denied"** message if you try to view the materials.</li>
                          </ul>
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-2">How do I access my certificates?</h4>
                        <p className="text-xs text-text-muted">Once you complete 100% of the lessons in a course, your certificate will automatically appear in your course module details.</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-2">How do I reset my progress?</h4>
                        <p className="text-xs text-text-muted">Please contact our support team if you wish to restart a course from the beginning.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
      {/* Real Support Chat - Floating Assistant */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <motion.div 
          initial={false}
          animate={isSupportOpen ? 'open' : 'closed'}
          className="relative"
        >
          {isSupportOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[500px]"
            >
              {/* Chat Header */}
              <div className="bg-primary p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">AI Academic Tutor</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Powered by Ecera AI</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsSupportOpen(false);
                    setAiMessages([{ role: 'assistant', content: "Hello! I'm your AI Academic Assistant. How can I help you with your courses today?" }]);
                  }} 
                  className="hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-background/30 min-h-[300px]">
                <>
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-text border border-border rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-text border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendSupportMessage} className="p-4 bg-white border-t border-border flex gap-2">
                <input 
                  type="text" 
                  value={supportInput}
                  onChange={(e) => setSupportInput(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-grow p-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                />
                <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                  <ChevronRight size={20} />
                </button>
              </form>
            </motion.div>
          )}

          {/* Floating Bubble */}
          <button 
            onClick={() => setIsSupportOpen(!isSupportOpen)}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isSupportOpen ? 'bg-white text-primary border border-primary/20 rotate-90' : 'bg-primary text-white hover:scale-110 active:scale-95'}`}
          >
            {isSupportOpen ? <X size={32} /> : <MessageSquare size={32} />}
            {!isSupportOpen && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>}
          </button>
        </motion.div>
      </div>

      {/* 🎓 Professional Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .print-area, .print-area * { visibility: visible !important; }
              .print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 9999 !important;
              }
              .no-print { display: none !important; }
              @page { size: landscape; margin: 0; }
            }
          `}</style>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[95vh] overflow-y-auto custom-scrollbar"
          >
            <button 
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all z-10 no-print"
            >
              <X size={20} />
            </button>

            <div className="p-2 md:p-6 bg-[#0a0a0a] print-area">
              <div className="border-[12px] border-[#c5a059]/30 p-8 md:p-20 text-center relative overflow-hidden bg-white min-h-[700px] flex flex-col justify-center">
                {/* 🎨 Professional Watermark & Accents */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center select-none rotate-[-30deg]">
                  <h1 className="text-9xl font-black uppercase">ECERA SYSTEM</h1>
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-12">
                    <div className="relative">
                      <div className="w-28 h-28 bg-[#0a0a0a] rounded-full flex items-center justify-center border-4 border-[#c5a059] shadow-2xl">
                        <Award size={56} className="text-[#c5a059]" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg">
                        <ShieldCheck size={20} className="text-green-600" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[#c5a059] font-black tracking-[0.8em] uppercase text-xs mb-4">Official Accreditation</p>
                  <h1 className="text-4xl md:text-6xl font-black text-[#0a0a0a] uppercase tracking-tighter mb-16">
                    Certificate <span className="text-[#c5a059]">of Completion</span>
                  </h1>

                  <p className="text-text-muted text-xl italic mb-4">This high-authority academic credential is awarded to</p>
                  <h2 className="text-5xl md:text-7xl font-black text-[#0a0a0a] mb-12 border-b-4 border-[#c5a059]/20 inline-block px-16 pb-4">
                    {user?.name}
                  </h2>

                  <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed mb-12">
                    For demonstrating exceptional proficiency and successfully mastering all advanced requirements of the specialized professional course:
                  </p>
                  
                  <h3 className="text-2xl md:text-4xl font-black text-[#0a0a0a] mb-20 px-10 py-5 bg-[#0a0a0a]/5 rounded-none border-l-8 border-r-8 border-[#c5a059] inline-block shadow-sm">
                    {selectedCertificate.courseId?.title}
                  </h3>

                  <div className="grid grid-cols-3 gap-8 mt-12 items-end">
                    <div className="text-left space-y-3">
                      <div className="w-24 h-0.5 bg-[#0a0a0a] mb-4"></div>
                      <p className="text-[9px] font-black text-[#0a0a0a] uppercase tracking-widest opacity-40">Verification ID</p>
                      <p className="font-mono text-[11px] font-bold text-[#c5a059]">{selectedCertificate.certificateId || 'VERIFIED-ECERA-001'}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 border-4 border-[#0a0a0a]/5 p-2 rounded-xl bg-white shadow-sm mb-4">
                         {/* QR Code Placeholder */}
                         <div className="w-full h-full bg-[#0a0a0a] rounded flex items-center justify-center opacity-10">
                            <Star size={24} className="text-white" />
                         </div>
                      </div>
                      <p className="text-[8px] font-black text-text-muted uppercase tracking-tighter">Scan to Verify Official Credentials</p>
                    </div>

                    <div className="text-right space-y-3">
                      <div className="w-24 h-0.5 bg-[#0a0a0a] ml-auto mb-4"></div>
                      <p className="text-[9px] font-black text-[#0a0a0a] uppercase tracking-widest opacity-40">Date of Excellence</p>
                      <p className="font-bold text-[#0a0a0a] text-xs">{new Date(selectedCertificate.issuedAt || selectedCertificate.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-6 md:p-8 flex flex-col md:flex-row justify-center gap-4 border-t border-[#c5a059]/20 no-print">
              <button 
                onClick={() => window.print()}
                className="bg-[#c5a059] text-white px-8 py-4 rounded-none font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#b08d4a] transition-all shadow-xl shadow-[#c5a059]/10 text-xs md:text-sm"
              >
                <FileText size={18} /> Save as PDF / Print
              </button>
              <button 
                onClick={() => setSelectedCertificate(null)}
                className="bg-white/10 text-white px-8 py-4 rounded-none font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/20 transition-all text-xs md:text-sm border border-white/20"
              >
                <Home size={18} /> Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
