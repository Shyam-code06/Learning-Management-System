import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Play, CheckCircle, ChevronRight, Menu, X, FileText, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LearningPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState([0]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      const courseRes = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(courseRes.data);
      
      try {
        const enrollRes = await axios.get(`http://localhost:5000/api/enrollments/course/${id}`);
        setEnrollment(enrollRes.data);
      } catch (err) {
        // If not enrolled but is admin, allow viewing
        if (user.role === 'admin') {
          setEnrollment({ progress: 0, completedLessons: [] });
        } else {
          throw err;
        }
      }
      
      // Set first lesson as active
      if (courseRes.data.sections.length > 0 && courseRes.data.sections[0].lessons.length > 0) {
        setActiveLesson(courseRes.data.sections[0].lessons[0]);
      }
    } catch (error) {
      toast.error('Access denied or course not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (idx) => {
    if (expandedSections.includes(idx)) {
      setExpandedSections(expandedSections.filter(i => i !== idx));
    } else {
      setExpandedSections([...expandedSections, idx]);
    }
  };

  const markComplete = async (lessonId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/enrollments/progress/${id}`, { lessonId });
      setEnrollment(res.data);
      toast.success('Lesson completed!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const isLessonComplete = (lessonId) => {
    return enrollment?.completedLessons?.includes(lessonId);
  };

  if (loading) return <div className="pt-40 text-center text-primary font-bold">Loading classroom...</div>;

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Main Content */}
      <div className={`flex-grow overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'md:mr-96' : ''}`}>
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {activeLesson ? (
              <div className="space-y-6">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                  {activeLesson.type === 'video' ? (
                    <iframe 
                      src={activeLesson.content.includes('youtube.com') || activeLesson.content.includes('youtu.be') 
                        ? activeLesson.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') 
                        : activeLesson.content} 
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-12 bg-text text-center">
                      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 border-4 border-primary/10">
                        <FileText size={48} className="text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2">{activeLesson.title}</h2>
                      <p className="text-primary-light font-bold mb-8 opacity-80 uppercase tracking-widest text-xs">
                        {activeLesson.type === 'pdf' ? 'PDF Document Attached' : 'Text Lesson'}
                      </p>
                      {activeLesson.type === 'pdf' ? (
                        <a 
                          href={activeLesson.content} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary px-10 py-4 shadow-xl shadow-primary/20 flex items-center gap-2"
                        >
                          <FileText size={20} /> View / Download PDF
                        </a>
                      ) : (
                        <div className="max-w-xl text-lg opacity-80 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
                          {activeLesson.content}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{activeLesson.title}</h1>
                    <p className="text-text-muted">Part of Section: {course.sections.find(s => s.lessons.some(l => l._id === activeLesson._id))?.title}</p>
                  </div>
                  
                  <button 
                    onClick={() => markComplete(activeLesson._id)}
                    disabled={isLessonComplete(activeLesson._id)}
                    className={`btn py-4 px-8 ${isLessonComplete(activeLesson._id) ? 'bg-green-100 text-green-600' : 'btn-primary'}`}
                  >
                    {isLessonComplete(activeLesson._id) ? (
                      <span className="flex items-center gap-2"><CheckCircle size={20} /> Completed</span>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                </div>

                <div className="card p-8">
                  <h3 className="text-xl font-bold mb-4">Lesson Overview</h3>
                  <div className="prose prose-pink max-w-none text-text-muted leading-relaxed">
                    {activeLesson.type === 'text' || activeLesson.type === 'pdf' ? (
                      <div className="bg-background/50 p-6 rounded-2xl border border-secondary mb-4 italic">
                        {activeLesson.content}
                      </div>
                    ) : null}
                    <p className="mb-4">
                      Welcome to this module on <span className="font-bold text-text">{activeLesson.title}</span>. 
                      This lesson is part of the <span className="font-bold text-text">{course.title}</span> curriculum.
                    </p>
                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                      <h4 className="font-bold text-primary mb-2">Instructor Notes:</h4>
                      <p className="text-sm">
                        {course.description.substring(0, 300)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <Play size={64} className="text-primary mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-bold text-text-muted">Select a lesson to start learning</h2>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Course Content */}
      <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white border-l border-secondary w-full md:w-96 z-40 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-secondary">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Course Content</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-text-muted md:hidden"><X /></button>
            </div>
            
            <div className="mb-2 flex justify-between items-end">
              <span className="text-sm font-bold text-primary">{enrollment?.progress || 0}% Complete</span>
              <span className="text-xs text-text-muted">{enrollment?.completedLessons?.length || 0}/{course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} Lessons</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${enrollment?.progress || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {course.sections.map((section, sIdx) => (
              <div key={section._id} className="border border-secondary rounded-2xl overflow-hidden">
                <button 
                  onClick={() => toggleSection(sIdx)}
                  className="w-full px-4 py-3 flex justify-between items-center bg-background bg-opacity-30 hover:bg-opacity-50 transition-all"
                >
                  <span className="font-bold text-sm text-left">{section.title}</span>
                  {expandedSections.includes(sIdx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {expandedSections.includes(sIdx) && (
                  <div className="py-2">
                    {section.lessons.map((lesson, lIdx) => (
                      <button
                        key={lesson._id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-background transition-all text-sm ${activeLesson?._id === lesson._id ? 'bg-primary bg-opacity-5 border-l-4 border-primary' : ''}`}
                      >
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isLessonComplete(lesson._id) ? 'bg-green-500 text-white' : 'border border-secondary text-text-muted'}`}>
                          {isLessonComplete(lesson._id) ? <CheckCircle size={14} /> : (lesson.type === 'video' ? <Play size={12} /> : <FileText size={12} />)}
                        </div>
                        <span className={`text-left ${activeLesson?._id === lesson._id ? 'font-bold text-primary' : ''}`}>{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button (Mobile) */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce"
        >
          <Menu />
        </button>
      )}

      
    </div>
  );
};

export default LearningPage;
