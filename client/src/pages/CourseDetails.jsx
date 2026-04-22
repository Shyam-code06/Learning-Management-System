import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, Play, Clock, Globe, Award, ShieldCheck, Star, ChevronDown, ChevronUp, BookOpen, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSection, setExpandedSection] = useState(0);

  useEffect(() => {
    fetchCourse();
    if (user) checkEnrollment();
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(res.data);
    } catch (error) {
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/enrollments/course/${id}`);
      if (res.data) setIsEnrolled(true);
    } catch (error) {
      setIsEnrolled(false);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }
    if (course.price === 0) {
      // Direct enrollment for free courses
      enrollDirectly();
    } else {
      navigate(`/checkout/${id}`);
    }
  };

  const enrollDirectly = async () => {
    try {
      await axios.post('http://localhost:5000/api/enrollments/enroll', { courseId: id });
      toast.success('Successfully enrolled!');
      setIsEnrolled(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  };

  if (loading) return <div className="pt-40 text-center text-primary font-bold">Loading course details...</div>;
  if (!course) return null;

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      {/* Hero Header */}
      <div className="bg-text text-white py-16 md:py-24 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-10 blur-3xl rounded-full"></div>
        <div className="container relative z-10 grid md:grid-cols-3 gap-12 items-center">
          <div className="md:col-span-2">
            <div className="flex gap-2 mb-6">
              <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Bestseller</span>
              <span className="bg-secondary bg-opacity-20 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{course.category}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{course.title}</h1>
            <p className="text-lg opacity-80 mb-8 max-w-2xl">{course.description}</p>

            <div className="flex flex-wrap gap-6 items-center text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-lg">4.8</span>
                <span className="opacity-60">(12,450 ratings)</span>
              </div>
              <div className="opacity-80 flex items-center gap-2">
                <Globe size={18} />
                <span>English, Spanish</span>
              </div>
              <div className="opacity-80 flex items-center gap-2">
                <ShieldCheck size={18} />
                <span>Last updated April 2024</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-2 text-text">
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 group">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={48} className="text-white" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl font-bold text-primary">${course.price}</span>
                  {course.price > 0 && (
                    <>
                      <span className="text-xl text-text-muted line-through">${(course.price * 1.5).toFixed(2)}</span>
                      <span className="text-green-600 font-bold">Offer Active</span>
                    </>
                  )}
                </div>

                {isEnrolled ? (
                  <Link to={`/learn/${id}`} className="btn btn-primary w-full py-4 justify-center text-lg">
                    Go to Course
                  </Link>
                ) : (
                  <button onClick={handleEnroll} className="btn btn-primary w-full py-4 justify-center text-lg">
                    Enroll Now
                  </button>
                )}

                <p className="text-xs text-center text-text-muted mt-4">30-Day Money-Back Guarantee</p>

                <div className="mt-8">
                  <h4 className="font-bold mb-4">This course includes:</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3"><Play size={16} className="text-primary" /> 12.5 hours on-demand video</li>
                    <li className="flex items-center gap-3"><Clock size={16} className="text-primary" /> Lifetime access</li>
                    <li className="flex items-center gap-3"><Award size={16} className="text-primary" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="card mb-12 p-8 border-l-8 border-primary relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                <Star size={120} />
              </div>
              <h2 className="text-2xl font-bold mb-2">The {course.category} Pathway</h2>
              <p className="text-primary-light font-bold text-sm mb-8 uppercase tracking-widest">
                {course.category === 'Development' ? 'Master Scalable Architecture & Clean Code' :
                  course.category === 'Design' ? 'Elevate User Experience & Visual Harmony' :
                    course.category === 'Business' ? 'Strategic Leadership & Operational Growth' :
                      'Drive Performance with Data-Driven Creativity'}
              </p>

              <h3 className="font-bold text-lg mb-6">What you'll master:</h3>
              <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                {(course.category === 'Development' ?
                  ['Modern Frameworks', 'System Architecture', 'Git & Version Control', 'API Integration', 'Deployment Pipelines', 'Database Management'] :
                  course.category === 'Design' ?
                    ['UI/UX Fundamentals', 'Color Theory', 'Typography Mastery', 'Interactive Prototyping', 'Design Systems', 'Visual Branding'] :
                    ['Market Analysis', 'Financial Strategy', 'Project Management', 'Business Analytics', 'Leadership Skills', 'Scale Strategies']
                ).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <span className="text-text font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <BookOpen className="text-primary" /> Course Modules
            </h2>
            <div className="space-y-0 relative before:absolute before:left-[1.65rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-secondary/50">
              {course.sections.length > 0 ? course.sections.map((section, idx) => (
                <div key={idx} className="relative mb-10 pl-12 last:mb-0">
                  {/* Step Indicator */}
                  <div className="absolute left-0 top-1 w-14 h-14 bg-white rounded-full border-4 border-primary/20 flex items-center justify-center z-10 text-primary font-bold shadow-sm">
                    {idx + 1}
                  </div>

                  <div className="card p-6 border-secondary overflow-hidden hover:border-primary/30 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">{section.title}</h3>
                        <p className="text-sm text-text-muted">{section.lessons.length} Modules in this section</p>
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Section {idx + 1}
                      </div>
                    </div>

                    <div className="space-y-3 bg-background/50 rounded-2xl p-4 border border-secondary/30">
                      {section.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="flex justify-between items-center text-sm p-3 bg-white rounded-xl border border-secondary/20 hover:shadow-md transition-all group/lesson">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center text-text-muted group-hover/lesson:bg-primary/10 group-hover/lesson:text-primary transition-colors">
                              {lesson.type === 'video' ? <Play size={16} /> : <FileText size={16} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-text group-hover/lesson:text-primary transition-colors">{lesson.title}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] uppercase font-bold text-primary-light px-1.5 py-0.5 bg-primary/5 rounded">{lesson.type}</span>
                                <span className="text-[10px] text-text-muted">• 12:45 mins</span>
                              </div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-secondary flex items-center justify-center text-text-muted opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-secondary text-text-muted">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} />
                  </div>
                  <p>No learning modules have been added to this course yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            {/* Sidebar info or related courses could go here */}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CourseDetails;
