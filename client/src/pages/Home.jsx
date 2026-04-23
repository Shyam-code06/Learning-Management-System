import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle, Play, Star, Users, Award, BookOpen, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [highestDiscount, setHighestDiscount] = useState(80); // Default to 80 if no coupons

  useEffect(() => {
    const fetchHighestDiscount = async () => {
      try {
        const res = await api.get('/coupons');
        const activeCoupons = res.data.filter(c => new Date(c.expiryDate) > new Date() && c.isActive);
        if (activeCoupons.length > 0) {
          const max = Math.max(...activeCoupons.map(c => c.discountPercent));
          setHighestDiscount(max);
        }
      } catch (error) {
        console.error('Error fetching highest discount', error);
      }
    };
    fetchHighestDiscount();
  }, []);
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20">
              <Tag size={16} /> <span>Limited Time: Save up to {highestDiscount}% on all modules!</span>
            </div>
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {Array.from("Ecera System LMS").map((letter, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="inline-block"
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
              <br />
              <span className="text-primary">
                {Array.from("Learning").map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            </motion.h1>
            <p className="text-xl text-text-muted mb-8 max-w-lg">
              Master new skills with our premium courses designed by industry experts. Join thousands of learners achieving their goals today with <span className="text-primary font-bold underline underline-offset-4 decoration-2">heavy student discounts</span> and massive savings on Every Module!
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link to="/register" className="btn btn-primary px-8 py-4 text-lg shadow-lg shadow-primary/20">
                Claim My Discount
              </Link>
              <Link to="/courses" className="btn btn-outline px-8 py-4 text-lg">
                View All Courses
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-xs font-bold shadow-sm">
                    U{i}
                  </div>
                ))}
              </div>
              <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" /> <span className="font-bold text-text">4.9/5</span> from 10k+ Learners</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary opacity-30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent opacity-20 rounded-full blur-3xl animate-pulse"></div>
            <img
              src="/hero.png"
              alt="Learning Workspace"
              className="relative z-10 rounded-3xl shadow-2xl w-full animate-float"
            />

            {/* Floating Discount Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -10 }}
              transition={{ delay: 1.5, type: 'spring' }}
              className="absolute -top-6 -right-6 z-20 bg-accent text-white px-6 py-4 rounded-2xl shadow-xl font-bold flex flex-col items-center"
            >
              <span className="text-3xl">{highestDiscount}%</span>
              <span className="text-xs uppercase tracking-tighter">Discount</span>
            </motion.div>

            {/* Floating stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 z-20 glass p-4 rounded-2xl shadow-lg flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-text-muted">Completed</p>
                <p className="font-bold">450+ Lessons</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Ecera System?</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Our enterprise-grade platform provides the robust tools and analytics you need to scale your organizational training.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <Play size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Videos</h3>
              <p className="text-text-muted">High-quality video lessons taught by industry leaders in various fields.</p>
            </div>

            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Certifications</h3>
              <p className="text-text-muted">Earn recognized certificates upon course completion to boost your resume.</p>
            </div>

            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Community</h3>
              <p className="text-text-muted">Join a vibrant community of learners to share knowledge and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to empower your workforce?</h2>
          <p className="text-xl mb-10 text-primary-light">Join Ecera System today and deploy scalable training solutions across your organization.</p>
          <Link to="/register" className="bg-black text-primary px-10 py-4 rounded-xl font-bold- text-lg hover:shadow-xl transition-all">
            Get Started
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
