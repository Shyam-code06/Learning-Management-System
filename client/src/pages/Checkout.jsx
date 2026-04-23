import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Tag, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCourse();
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
    } catch (error) {
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    if (discount > 0) {
      toast.error('Only one coupon can be applied per order');
      return;
    }
    try {
      const res = await api.post('/coupons/validate', { code: couponCode });
      setDiscount(res.data.discountPercent);
      toast.success(`Exclusive Discount Applied! ${res.data.discountPercent}% OFF your total.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
      setDiscount(0);
    }
  };

  const finalPrice = course ? (course.price * (1 - discount / 100)).toFixed(2) : 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(async () => {
      try {
        await api.post('/payments/process', {
          courseId: id,
          amount: finalPrice,
          couponCode: discount > 0 ? couponCode : null
        });
        
        setIsSuccess(true);
        toast.success('Payment successful!');
        setTimeout(() => navigate(`/learn/${id}`), 3000);
      } catch (error) {
        toast.error('Payment processing failed');
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (loading) return <div className="pt-40 text-center text-primary font-bold">Preparing checkout...</div>;

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <AnimatePresence mode='wait'>
          {!isSuccess ? (
            <motion.div 
              key="checkout-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid md:grid-cols-5 gap-8"
            >
              <div className="md:col-span-3 space-y-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="text-primary" /> Payment Method
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border-2 border-primary bg-primary bg-opacity-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-text rounded-md flex items-center justify-center text-white font-bold text-[10px]">VISA</div>
                        <div>
                          <p className="font-bold">Visa ending in 4242</p>
                          <p className="text-xs text-text-muted">Expires 12/26</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-4 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-secondary flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-[#003087] rounded-md flex items-center justify-center text-white font-bold text-[10px]">PayPal</div>
                        <p className="font-bold">PayPal Account</p>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-secondary"></div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Tag className="text-primary" /> Coupon Code
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow px-4 py-3 rounded-xl border border-secondary focus:border-primary focus:outline-none"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="btn btn-outline px-6"
                    >
                      Apply
                    </button>
                  </div>
                  {discount > 0 && (
                    <p className="mt-2 text-green-600 text-sm font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Coupon applied successfully!
                    </p>
                  )}
                  <p className="mt-4 text-xs text-text-muted">Try "WELCOME10" or "PROMO20" (if Admin created them)</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="card sticky top-28">
                  <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                  <div className="flex gap-4 mb-6 pb-6 border-b border-secondary">
                    <img src={course.thumbnail} alt={course.title} className="w-20 h-20 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold line-clamp-2 text-sm">{course.title}</h4>
                      <p className="text-xs text-text-muted mt-1">Instructor: {course.instructor?.name || 'Expert'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Original Price:</span>
                      <span>${course.price}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Coupon Discount ({discount}%):</span>
                        <span>-${(course.price * discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-secondary text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${finalPrice}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full btn btn-primary py-4 justify-center text-lg shadow-xl"
                  >
                    {isProcessing ? 'Processing...' : `Pay $${finalPrice}`}
                    {!isProcessing && <ArrowRight size={20} />}
                  </button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
                    <ShieldCheck size={16} />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card py-20 text-center"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="text-4xl font-bold mb-4">Payment Successful!</h2>
              <p className="text-xl text-text-muted mb-8">
                Welcome to the course. We're redirecting you to your learning dashboard.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => navigate(`/learn/${id}`)}
                  className="btn btn-primary px-10 py-4"
                >
                  Start Learning Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
};

export default Checkout;
