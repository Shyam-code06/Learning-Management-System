import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Users, BookOpen, DollarSign, TrendingUp, Search, Power, Tag, Home, MessageSquare, X, Activity, TrendingDown, ChevronRight, ChevronDown, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [announcementContent, setAnnouncementContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [posts, setPosts] = useState([]);
  
  // Chat State
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Bot State
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState([
    { text: 'Hello Admin! I am Ecera AI. How can I help you manage your academy today?', type: 'bot' }
  ]);
  const [botInput, setBotInput] = useState('');
  const [isBotAiLoading, setIsBotAiLoading] = useState(false);
  const botEndRef = useRef(null);

  useEffect(() => {
    botEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages, isBotAiLoading]);

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: '', expiryDate: '' });

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0, 
    totalRevenue: 0 
  });

  // Process data for charts
  const enrollmentChartData = (enrollments || []).reduce((acc, curr) => {
    if (!curr?.createdAt) return acc;
    const date = new Date(curr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.students += 1;
    } else {
      acc.push({ date, students: 1 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);

  const revenueChartData = (payments || []).reduce((acc, curr) => {
    if (!curr?.createdAt) return acc;
    const date = new Date(curr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += (curr.amount || 0);
    } else {
      acc.push({ date, revenue: (curr.amount || 0) });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);

  useEffect(() => {
    fetchCourses();
    fetchCoupons();
    fetchUsers();
    fetchPayments();
    fetchEnrollments();
    fetchRefunds();
    fetchConversations();
    fetchPosts();
    
    // Interval to check for new messages
    const chatPoll = setInterval(fetchConversations, 10000);
    return () => clearInterval(chatPoll);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
      // Simple heuristic for unread: if total messages in a convo changed since last check
      // For now, let's just use the count of conversations as a placeholder or check for unread flag if added to model
    } catch (error) {
      console.error('Error fetching conversations', error);
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchChatHistory();
      const interval = setInterval(fetchChatHistory, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  const fetchChatHistory = async () => {
    if (!selectedContact) return;
    try {
      const res = await api.get(`/chat/${selectedContact._id}`);
      setChatMessages(res.data);
    } catch (error) {
      console.error('Error fetching chat history', error);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedContact) return;
    try {
      await api.post('/chat', { receiverId: selectedContact._id, content: chatInput });
      setChatInput('');
      fetchChatHistory();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts', error);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/community/${id}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleStartChat = (student) => {
    setSelectedContact(student);
    setActiveTab('chat');
    // Fetch messages for this specific student
    fetchMessages(student._id);
  };

  const handleBotAction = (type) => {
    let response = '';
    if (type === 'revenue') response = `Current platform revenue is $${stats.totalRevenue}. Most sales coming from high-demand technical modules.`;
    if (type === 'status') response = 'System status: All services are operational. Latency is within normal limits (24ms).';
    if (type === 'users') response = `We have ${stats.totalStudents} active students. Enrollment is up 12% this week!`;
    
    setBotMessages(prev => [...prev, { text: response, type: 'bot' }]);
  };

  const handleBotSubmit = async (e) => {
    e.preventDefault();
    if (!botInput.trim()) return;
    
    const userMsg = { text: botInput, type: 'user' };
    setBotMessages(prev => [...prev, userMsg]);
    const currentInput = botInput;
    setBotInput('');
    setIsBotAiLoading(true);
    
    try {
      const res = await api.post('/chat/ai-admin', { 
        message: currentInput,
        stats: stats
      });
      
      // Robust extraction: Handle all response formats
      const aiText = res.data?.text || res.data?.data?.text || res.text || (typeof res.data === 'string' ? res.data : "I'm having trouble analyzing the platform data right now.");
      
      setBotMessages(prev => [...prev, { text: aiText, type: 'bot' }]);
    } catch (error) {
      console.error("Admin AI Error:", error);
      setBotMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the intelligence server. Please try again later.", type: 'bot' }]);
    } finally {
      setIsBotAiLoading(false);
    }
  };

  const filteredUsers = (usersList || []).filter(u => 
    u?.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u?.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/admin');
      const coursesData = res.data?.data || res.data;
      setCourses(coursesData);
      setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch (error) {
      console.error('Error fetching coupons', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      const usersData = res.data?.data || res.data;
      setUsersList(usersData);
      setStats(prev => ({ ...prev, totalStudents: usersData.length }));
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      const paymentsData = res.data?.data || res.data;
      setPayments(paymentsData);
      const totalRevenue = (paymentsData || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setStats(prev => ({ ...prev, totalRevenue }));
    } catch (error) {
      console.error('Error fetching payments', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments');
      setEnrollments(res.data?.data || res.data);
    } catch (error) {
      console.error('Error fetching enrollments', error);
    }
  };

  const fetchRefunds = async () => {
    try {
      const res = await api.get('/refunds');
      setRefunds(res.data?.data || res.data);
    } catch (error) {
      console.error('Error fetching refunds', error);
    }
  };

  const handleUpdateRefundStatus = async (id, status) => {
    try {
      await api.put(`/refunds/${id}`, { status });
      toast.success(`Refund request ${status}`);
      fetchRefunds();
      fetchPayments();
      fetchEnrollments();
    } catch (error) {
      toast.error('Failed to update refund status');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementContent.trim()) return;
    
    const loadingToast = toast.loading('Publishing announcement...');
    try {
      const token = localStorage.getItem('token');
      // Bypassing api wrapper to ensure direct delivery but keeping security
      await axios.post('http://localhost:5000/api/announcements', 
        { content: announcementContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.dismiss(loadingToast);
      toast.success('ALIVE! Announcement is now live on the Community Hub.');
      setAnnouncementContent('');
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || error.message || 'Connection failed';
      toast.error(`CRITICAL ERROR: ${errorMsg}`);
      console.error('CRITICAL POST FAILURE:', error);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const togglePublish = async (course) => {
    try {
      await api.put(`/courses/${course._id}`, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', newCoupon);
      toast.success('Coupon created successfully');
      setNewCoupon({ code: '', discountPercent: '', expiryDate: '' });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('User removed');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  const NavButton = ({ id, icon: Icon, label, badge }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-between gap-2 lg:gap-3 px-4 py-2 lg:py-3 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0 lg:w-full ${
        activeTab === id 
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
        : 'text-text hover:bg-background hover:text-primary'
      }`}
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <Icon size={18} className="lg:w-5 lg:h-5" /> 
        <span className="text-sm lg:text-base">{label}</span>
      </div>
      {badge && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>}
    </button>
  );

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Menu */}
          <div className="lg:w-64 flex-shrink-0 w-full overflow-hidden">
            <div className="card p-3 lg:p-4 lg:sticky lg:top-28 shadow-sm border-border flex flex-col">
              <div className="hidden sm:flex lg:flex-col items-center lg:items-start text-left gap-4 mb-4 lg:mb-6 px-2 lg:px-4">
                <div className="w-12 h-12 lg:w-20 lg:h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xl lg:text-3xl font-bold shadow-sm border-2 border-white flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <h2 className="font-bold text-lg lg:text-xl text-text leading-tight">{user?.name || 'Admin'}</h2>
                  <p className="text-xs lg:text-sm text-text-muted">System Administrator</p>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
                <h3 className="hidden lg:block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 mt-2 px-4">Menu</h3>
                <NavButton id="overview" icon={Home} label="Overview" />
                <NavButton id="courses" icon={BookOpen} label="Modules" />
                <NavButton id="users" icon={Users} label="Users" />
                <NavButton id="coupons" icon={Tag} label="Coupons" />
                <NavButton id="refunds" icon={DollarSign} label="Refunds" />
                <NavButton id="announcements" icon={MessageSquare} label="Announcements" />
                <NavButton id="chat" icon={Activity} label="Support Chat" badge={conversations.length > 0} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            
            {activeTab === 'chat' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-14rem)] flex gap-6">
                {/* Conversations List */}
                <div className="w-80 bg-white rounded-3xl border border-border overflow-hidden flex flex-col shadow-sm">
                  <div className="p-6 border-b border-border bg-background/50">
                    <h3 className="font-bold text-lg">Conversations</h3>
                    <p className="text-xs text-text-muted mt-1">Direct student messages</p>
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    {conversations.length > 0 ? conversations.map(contact => (
                      <button 
                        key={contact._id}
                        onClick={() => setSelectedContact(contact)}
                        className={`w-full p-6 text-left border-b border-secondary hover:bg-primary/5 transition-all flex items-center gap-4 ${selectedContact?._id === contact._id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                      >
                        <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center font-bold text-primary shadow-sm">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{contact.name}</p>
                          <p className="text-xs text-text-muted truncate">{contact.email}</p>
                        </div>
                      </button>
                    )) : (
                      <div className="p-12 text-center text-text-muted italic text-sm">No active chats found.</div>
                    )}
                  </div>
                </div>

                {/* Chat Window */}
                <div className="flex-grow bg-white rounded-3xl border border-border overflow-hidden flex flex-col shadow-sm">
                  {selectedContact ? (
                    <>
                      <div className="p-6 border-b border-border bg-background/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">
                            {selectedContact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight">{selectedContact.name}</h3>
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Online & Student</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-5 rounded-3xl text-sm font-medium shadow-md ${
                              msg.senderId === user?._id 
                              ? 'bg-primary text-white rounded-tr-none' 
                              : 'bg-white text-text border border-border rounded-tl-none'
                            }`}>
                              {msg.content}
                              <p className={`text-[9px] mt-2 opacity-50 ${msg.senderId === user?._id ? 'text-white' : 'text-text-muted'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={handleSendChat} className="p-6 bg-white border-t border-border flex gap-4">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type your reply..." 
                          className="flex-grow p-4 bg-background border border-border rounded-2xl text-sm focus:outline-none focus:border-primary transition-all"
                        />
                        <button type="submit" className="bg-primary text-white px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-2 font-bold">
                          Send <ChevronRight size={18} />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
                      <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6 text-primary animate-pulse">
                        <MessageSquare size={48} />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-text">Select a student to start chatting</h3>
                      <p className="text-text-muted max-w-xs">Reply to student queries in real-time to provide the best academic support.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-border pb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-text">Ecera Admin Console</h1>
                    <p className="text-text-muted text-sm">System administration and academy management.</p>
                  </div>
                  <Link to="/admin/course/new" className="btn btn-primary py-2 px-6 rounded-full">
                    <Plus size={18} /> New Module
                  </Link>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Total Modules</p>
                        <h3 className="text-3xl font-bold text-text">{stats.totalCourses}</h3>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary"><BookOpen size={20} /></div>
                    </div>
                  </div>
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Active Users</p>
                        <h3 className="text-3xl font-bold text-text">{stats.totalStudents}</h3>
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Users size={20} /></div>
                    </div>
                  </div>
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-text">${stats.totalRevenue}</h3>
                      </div>
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><DollarSign size={20} /></div>
                    </div>
                  </div>
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Pending Refunds</p>
                        <h3 className="text-3xl font-bold text-red-600">{refunds.filter(r => r.status === 'pending').length}</h3>
                      </div>
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600"><TrendingDown size={20} /></div>
                    </div>
                  </div>
                </div>

                {/* Analytical Graphs Section */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  {/* Student Growth Chart */}
                  <div className="card p-8 border-border bg-white">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-text">Student Growth</h3>
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Users size={20} /></div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={enrollmentChartData}>
                          <defs>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF4B7B" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#FF4B7B" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="students" stroke="#FF4B7B" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue Growth Chart */}
                  <div className="card p-8 border-border bg-white">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-text">Revenue Stream</h3>
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><DollarSign size={20} /></div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                          <Tooltip formatter={(val) => `$${val}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* System Health / Live Activity */}
                <div className="card p-8 border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="text-green-500" />
                    <h3 className="text-xl font-bold">System Health & Live Activity</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="font-bold text-sm">Server Status</span>
                      </div>
                      <span className="text-xs font-bold text-green-600 uppercase">Operational</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {refunds.slice(0, 4).map(r => (
                        <div key={r._id} className="p-4 border border-border rounded-xl flex justify-between items-center bg-white/50">
                          <div>
                            <p className="text-xs font-bold text-text-muted mb-1">New Refund Request</p>
                            <p className="text-sm font-bold">{r.userId?.name}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'refunds' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0 border-border">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-bold text-text flex items-center gap-2"><DollarSign size={20} className="text-red-500"/> Cancellation & Refunds</h3>
                  <p className="text-sm text-text-muted mt-1">Review student cancellation requests within the 5-day window.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-background text-text-muted text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {refunds.length > 0 ? refunds.map(r => (
                        <tr key={r._id} className="hover:bg-background transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-sm">{r.userId?.name || 'Deleted User'}</p>
                            <p className="text-xs text-text-muted">{r.userId?.email || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm">{r.courseId?.title || 'Unknown Course'}</td>
                          <td className="px-6 py-4 font-bold text-sm text-red-500">${r.amount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                              r.status === 'approved' ? 'bg-green-100 text-green-600' : 
                              r.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                              'bg-red-100 text-red-600'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {r.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleUpdateRefundStatus(r._id, 'approved')} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all shadow-sm"><Activity size={18} /></button>
                                <button onClick={() => handleUpdateRefundStatus(r._id, 'rejected')} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all shadow-sm"><Plus className="rotate-45" size={18} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-text-muted">No refund requests found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'announcements' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                {/* Announcement Creator */}
                <div className="card p-8 border-border">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={24} className="text-primary"/> Community Hub & Advertising</h3>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-text-muted uppercase tracking-wider">Broadcast Content</label>
                      <textarea 
                        value={announcementContent}
                        onChange={(e) => setAnnouncementContent(e.target.value)}
                        placeholder="Write a message, advertisement, or update for the entire community..." 
                        className="w-full p-6 rounded-2xl border border-border focus:border-primary focus:outline-none min-h-[160px] text-sm bg-background/30 font-medium"
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="btn btn-primary px-12 py-4 rounded-2xl shadow-xl shadow-primary/20 font-bold">
                        Post to Community
                      </button>
                    </div>
                  </form>
                </div>

                {/* Community Feed Preview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Live Community Feed</h3>
                    <button onClick={fetchPosts} className="text-xs font-bold text-primary hover:underline">Refresh Feed</button>
                  </div>
                  <div className="grid gap-6">
                    {posts && posts.length > 0 ? posts.map(post => (
                      <div key={post._id} className="card p-6 border-border hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${post.type === 'admin' ? 'bg-primary' : 'bg-secondary text-primary'}`}>
                              {(post.userId?.name || post.adminId?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm flex items-center gap-2">
                                {post.userId?.name || post.adminId?.name || 'Community Member'}
                                {post.type === 'admin' && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified Admin</span>}
                              </p>
                              <p className="text-[10px] text-text-muted font-medium">{new Date(post.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <button onClick={() => deletePost(post._id, post.isAnnouncement)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 transition-all rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="mt-4 text-sm text-text leading-relaxed font-medium">
                          {post.content}
                        </p>
                      </div>
                    )) : (
                      <div className="text-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
                        <MessageSquare className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
                        <p className="text-text-muted font-bold">No community activity yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0 border-border">
                <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-lg font-bold text-text">Content Modules</h3>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input type="text" placeholder="Search modules..." className="w-full pl-9 pr-4 py-2 rounded-md border border-border focus:border-primary focus:outline-none text-sm bg-background" />
                    </div>
                    <Link to="/admin/course/new" className="btn btn-primary px-4"><Plus size={18} /></Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-background text-text-muted text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Enrollments</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {loading ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-text-muted">Loading courses...</td></tr>
                      ) : courses.map(course => (
                        <tr key={course._id} className="hover:bg-background transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={course.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
                              <div>
                                <p className="font-bold text-sm">{course.title}</p>
                                <p className="text-xs text-text-muted">{course.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold">${course.price}</td>
                          <td className="px-6 py-4 text-sm font-bold">
                            {(enrollments || []).filter(e => (e.courseId?._id || e.courseId) === course._id).length} Students
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${course.isPublished ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => togglePublish(course)} className={`p-2 rounded-lg border border-secondary hover:shadow-sm transition-all ${course.isPublished ? 'text-yellow-600' : 'text-green-600'}`}><Power size={18} /></button>
                              <Link to={`/admin/course/edit/${course._id}`} className="p-2 rounded-lg border border-secondary text-blue-500 hover:shadow-sm transition-all"><Edit size={18} /></Link>
                              <button onClick={() => deleteCourse(course._id)} className="p-2 rounded-lg border border-secondary text-red-500 hover:shadow-sm transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0 border-border">
                <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-lg font-bold text-text flex items-center gap-2"><Users size={20} className="text-primary"/> Registered Users</h3>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search by name or email..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-md border border-border focus:border-primary focus:outline-none text-sm bg-background" 
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-background text-text-muted text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Enrolled Courses</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {filteredUsers.length > 0 ? filteredUsers.map(u => {
                        const userEnrollments = enrollments.filter(e => e.userId === u._id);
                        return (
                        <tr 
                          key={u._id} 
                          onClick={() => setSelectedUser({ ...u, enrollments: userEnrollments })}
                          className="hover:bg-primary/5 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-sm group-hover:text-primary transition-colors">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-muted">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-600'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {userEnrollments.length > 0 ? (
                              <div className="flex flex-col gap-3">
                                {userEnrollments.map(e => (
                                  <div key={e._id} className="min-w-[150px]">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-bold text-text truncate max-w-[100px]">
                                        {e.courseId?.title || 'Unknown Course'}
                                      </span>
                                      <span className="text-[10px] font-bold text-primary">{e.progress}%</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
                                      <div 
                                        className="bg-primary h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${e.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted">No enrollments</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u._id !== user?._id ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeUser(u._id);
                                }} 
                                className="p-2 rounded-lg border border-secondary text-red-500 hover:bg-red-50 hover:border-red-200 transition-all" 
                                title="Remove User"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span className="text-xs text-text-muted italic">You</span>
                            )}
                          </td>
                        </tr>
                      )}) : (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-text-muted">No users found matching your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'coupons' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="card p-6 border-border">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Tag size={20} className="text-primary"/> Create New Coupon</h3>
                  <form onSubmit={handleCreateCoupon} className="grid md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-text-muted uppercase tracking-wider">Coupon Code</label>
                      <input type="text" required value={newCoupon.code} onChange={e=>setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER50" className="w-full px-3 py-2 border border-secondary rounded-lg focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-text-muted uppercase tracking-wider">Discount (%)</label>
                      <input type="number" required min="1" max="100" value={newCoupon.discountPercent} onChange={e=>setNewCoupon({...newCoupon, discountPercent: e.target.value})} placeholder="e.g. 20" className="w-full px-3 py-2 border border-secondary rounded-lg focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-text-muted uppercase tracking-wider">Expiry Date</label>
                      <input type="date" required value={newCoupon.expiryDate} onChange={e=>setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-secondary rounded-lg focus:border-primary focus:outline-none" />
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-2"><Plus size={16}/> Add Coupon</button>
                  </form>
                </div>

                <div className="card overflow-hidden p-0 border-border">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-text">Active Coupons</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-background text-text-muted text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Code</th>
                          <th className="px-6 py-4">Discount</th>
                          <th className="px-6 py-4">Expiry Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary">
                        {coupons.length > 0 ? coupons.map(coupon => (
                          <tr key={coupon._id} className="hover:bg-background transition-colors">
                            <td className="px-6 py-4 font-bold text-primary">{coupon.code}</td>
                            <td className="px-6 py-4 font-bold">{coupon.discountPercent}% OFF</td>
                            <td className="px-6 py-4 text-sm">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              {new Date(coupon.expiryDate) > new Date() ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-600">Active</span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-600">Expired</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => deleteCoupon(coupon._id)} className="p-2 rounded-lg border border-secondary text-red-500 hover:shadow-sm transition-all"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="px-6 py-12 text-center text-text-muted">No coupons created yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          </div> {/* flex-grow */}
        </div> {/* flex */}
      </div> {/* container */}

      {/* User Progress Modal - "Square Div" style */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-border"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20">
                    {selectedUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text leading-tight">{selectedUser?.name || 'User'}</h2>
                    <p className="text-sm text-text-muted">{selectedUser?.email || 'No Email'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <Power size={20} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" /> Learning Velocity
                  </h3>
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active Now</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Enrolled</p>
                    <p className="text-2xl font-bold">{selectedUser?.enrollments?.length || 0} <span className="text-xs font-medium">Courses</span></p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-2xl font-bold">{selectedUser?.enrollments?.filter(e => e.progress === 100).length || 0} <span className="text-xs font-medium">Items</span></p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(selectedUser?.enrollments || []).length > 0 ? selectedUser.enrollments.map(e => (
                    <div key={e._id} className="p-4 rounded-2xl border border-border hover:border-primary/30 transition-all bg-background/50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm truncate max-w-[200px]">{e.courseId?.title || 'Unknown Course'}</span>
                        <span className="text-primary font-bold text-sm">{e.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${e.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(255,75,123,0.3)]"
                        ></motion.div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-text-muted italic text-sm">
                      This user has no active enrollments.
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full mt-8 btn btn-primary py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                Close Insights
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Ecera AI Bot - Floating Assistant */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <motion.div 
          initial={false}
          animate={isBotOpen ? 'open' : 'closed'}
          className="relative"
        >
          {isBotOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[500px]"
            >
              {/* Bot Header */}
              <div className="bg-primary p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Ecera AI Assistant</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Online & Ready</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsBotOpen(false);
                    setBotMessages([{ text: 'Hello Admin! I am Ecera AI. How can I help you manage your academy today?', type: 'bot' }]);
                  }} 
                  className="hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>

              {/* Bot Messages */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-background/30 min-h-[300px]">
                {botMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                      msg.type === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-text border border-border rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isBotAiLoading && (
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
                <div ref={botEndRef} />
              </div>


              {/* Bot Input */}
              <form onSubmit={handleBotSubmit} className="p-4 bg-white border-t border-border flex gap-2">
                <input 
                  type="text" 
                  value={botInput}
                  onChange={(e) => setBotInput(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="flex-grow p-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                />
                <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          )}

          {/* Floating Bubble */}
          <button 
            onClick={() => setIsBotOpen(!isBotOpen)}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isBotOpen ? 'bg-white text-primary border border-primary/20 rotate-90' : 'bg-primary text-white hover:scale-110 active:scale-95'}`}
          >
            {isBotOpen ? <X size={32} /> : <MessageSquare size={32} />}
            {!isBotOpen && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
