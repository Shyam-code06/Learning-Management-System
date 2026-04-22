import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Users, BookOpen, DollarSign, TrendingUp, Search, Power, Tag, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: '', expiryDate: '' });

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 1240, 
    totalRevenue: 12450 
  });

  useEffect(() => {
    fetchCourses();
    fetchCoupons();
    fetchUsers();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses/admin');
      setCourses(res.data);
      setStats(prev => ({ ...prev, totalCourses: res.data.length }));
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/coupons');
      setCoupons(res.data);
    } catch (error) {
      console.error('Error fetching coupons', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users');
      setUsersList(res.data);
      setStats(prev => ({ ...prev, totalStudents: res.data.length }));
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/payments');
      const totalRevenue = res.data.reduce((acc, curr) => acc + curr.amount, 0);
      setStats(prev => ({ ...prev, totalRevenue }));
    } catch (error) {
      console.error('Error fetching payments', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/enrollments');
      setEnrollments(res.data);
    } catch (error) {
      console.error('Error fetching enrollments', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCoupons();
    fetchUsers();
    fetchPayments();
    fetchEnrollments();
  }, []);

  const deleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const togglePublish = async (course) => {
    try {
      await axios.put(`http://localhost:5000/api/courses/${course._id}`, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/coupons', newCoupon);
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
      await axios.delete(`http://localhost:5000/api/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
      toast.success('User removed');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

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
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            
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

                <div className="grid md:grid-cols-4 gap-6">
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Total Modules</p>
                        <h3 className="text-3xl font-bold text-text">{stats.totalCourses}</h3>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary"><BookOpen size={20} /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-green-600 text-xs font-semibold"><TrendingUp size={14} /> +12%</div>
                  </div>
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Active Users</p>
                        <h3 className="text-3xl font-bold text-text">{stats.totalStudents}</h3>
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Users size={20} /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-green-600 text-xs font-semibold"><TrendingUp size={14} /> +5.2%</div>
                  </div>
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-text">${stats.totalRevenue}</h3>
                      </div>
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><DollarSign size={20} /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-green-600 text-xs font-semibold"><TrendingUp size={14} /> +24%</div>
                  </div>
                  <div className="card p-6 border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">System Status</p>
                        <h3 className="text-xl font-bold text-green-600 mt-2">Operational</h3>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600"><Power size={20} /></div>
                    </div>
                    <div className="mt-4 text-xs font-semibold text-text-muted">All services online</div>
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
                          <td className="px-6 py-4 text-sm">45 Students</td>
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
                    <input type="text" placeholder="Search users..." className="w-full pl-9 pr-4 py-2 rounded-md border border-border focus:border-primary focus:outline-none text-sm bg-background" />
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
                      {usersList.length > 0 ? usersList.map(u => {
                        const userEnrollments = enrollments.filter(e => e.userId === u._id);
                        return (
                        <tr key={u._id} className="hover:bg-background transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-sm">{u.name}</span>
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
                              <div className="flex flex-col gap-1">
                                {userEnrollments.map(e => (
                                  <span key={e._id} className="text-[10px] font-bold bg-secondary/50 px-2 py-1 rounded w-fit border border-border">
                                    {e.courseId?.title || 'Unknown Course'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted">No enrollments</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u._id !== user?._id ? (
                              <button onClick={() => removeUser(u._id)} className="p-2 rounded-lg border border-secondary text-red-500 hover:shadow-sm transition-all" title="Remove User">
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span className="text-xs text-text-muted italic">You</span>
                            )}
                          </td>
                        </tr>
                      )}) : (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-text-muted">No users found.</td></tr>
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
