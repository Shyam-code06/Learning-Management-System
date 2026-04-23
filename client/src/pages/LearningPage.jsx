import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Play, CheckCircle, Menu, X, FileText, ChevronDown, ChevronUp, Lock, PlayCircle, LayoutDashboard } from 'lucide-react';
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
      setLoading(true);
      const courseRes = await api.get(`/courses/${id}`);
      const courseData = courseRes.data?.data || courseRes.data;
      
      if (!courseData) throw new Error("Course not found");
      setCourse(courseData);

      try {
        const enrollRes = await api.get(`/enrollments/course/${id}`);
        setEnrollment(enrollRes.data?.data || enrollRes.data);
      } catch (err) {

        if (user?.role === 'admin') {
          setEnrollment({ progress: 0, completedLessons: [] });
        }
        // Don't throw here, allow course to still be viewed
      }

      if (courseData.sections?.length > 0 && courseData.sections[0].lessons?.length > 0) {
        setActiveLesson(courseData.sections[0].lessons[0]);
      }
    } catch (error) {
      console.error("Fetch Data Error:", error);
      toast.error("Failed to load course content");
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
      const res = await api.put(`/enrollments/progress/${id}`, { lessonId });
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
    <div className="flex h-screen bg-background overflow-hidden relative z-50">

      <div className="flex flex-1 w-full relative pt-16">
        <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
          <div className="max-w-5xl mx-auto p-6 md:p-12 pb-32">
            {activeLesson ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

                {/* 🛡️ Secure Material Viewer */}
                <div className="bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden relative group" onContextMenu={(e) => e.preventDefault()}>
                  {/* Security Watermark */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none z-50 rotate-[-15deg] overflow-hidden">
                    <div className="text-xl md:text-3xl font-black uppercase tracking-[1.5rem] whitespace-nowrap text-text text-center">
                      {`PROTECTED CONTENT - ${user?.email?.toUpperCase()} - ${new Date().toLocaleDateString()}`}
                    </div>
                  </div>

                  {activeLesson.type === 'video' ? (
                    <div className="aspect-video bg-black shadow-inner">
                      {activeLesson.content?.includes('youtube.com') || activeLesson.content?.includes('youtu.be') ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${activeLesson.content.includes('watch?v=') ? activeLesson.content.split('watch?v=')[1].split('&')[0] : activeLesson.content.split('/').pop()}`}
                          className="w-full h-full"
                          allowFullScreen
                          title="YouTube Video"
                        ></iframe>
                      ) : (
                        <video key={activeLesson.content} controls controlsList="nodownload" className="w-full h-full">
                          <source src={activeLesson.content} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ) : activeLesson.type === 'pdf' ? (
                    <div className="h-[750px] w-full bg-secondary/30">
                      <iframe src={`${activeLesson.content}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-none" title="Material Viewer"></iframe>
                    </div>
                  ) : (
                    <div className="p-12 md:p-20 bg-white min-h-[500px]">
                      <div className="prose prose-slate max-w-none">
                        <div className="text-xl leading-[2.2rem] text-text-muted whitespace-pre-wrap font-medium">
                          {activeLesson.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 📝 Lesson Info & Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-8 rounded-3xl border border-border shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold">
                        {activeLesson.type} Module
                      </span>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-background px-3 py-1 rounded-lg">
                        {activeLesson.duration || '5:00'} MINS
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text">{activeLesson.title}</h1>
                  </div>

                  <button
                    onClick={() => markComplete(activeLesson._id)}
                    disabled={isLessonComplete(activeLesson._id)}
                    className={`flex items-center gap-3 py-4 px-10 rounded-2xl font-bold transition-all ${isLessonComplete(activeLesson._id)
                      ? 'bg-green-50 text-green-600 border border-green-100 cursor-default'
                      : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-1'
                      }`}
                  >
                    {isLessonComplete(activeLesson._id) ? (
                      <><CheckCircle size={22} /> Completed</>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                </div>

                {/* 📖 Instructor Guide Card */}
                {course && (
                  <div className="bg-white p-10 rounded-3xl border border-border shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <h3 className="text-xl font-bold mb-6 text-text uppercase tracking-widest flex items-center gap-3">
                      <FileText size={20} className="text-primary" /> Instructor's Guide
                    </h3>
                    <p className="text-text-muted leading-relaxed text-lg italic opacity-80">
                      {course.description}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-border mt-10">
                <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mb-8">
                  <PlayCircle size={48} className="text-primary/20" />
                </div>
                <h2 className="text-2xl font-bold text-text mb-3">Select a module to begin</h2>
                <p className="text-text-muted max-w-sm mx-auto">Your academic journey continues here. Choose a lesson from the sidebar to start learning.</p>
              </div>
            )}
          </div>
        </div>

        {/* 📑 Sidebar - Course Content */}
        {course && (
          <div className={`
            ${sidebarOpen ? 'w-[400px]' : 'w-0'} 
            h-full bg-white border-l border-border transition-all duration-300 overflow-hidden flex flex-col z-40
            ${!sidebarOpen ? 'invisible md:hidden' : ''}
            fixed md:relative right-0 top-0
          `}>
            <div className="p-8 border-b border-border bg-white sticky top-0 z-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-bold text-xl tracking-tight text-text">Course Curriculum</h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Structured Learning Path</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-text-muted p-2 hover:bg-background rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{enrollment?.progress || 0}% Completed</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    {enrollment?.completedLessons?.length || 0}/{course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} Steps
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${enrollment?.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-background/30 custom-scrollbar">
              {course.sections.map((section, sIdx) => (
                <div key={sIdx} className="rounded-2xl overflow-hidden bg-white border border-border shadow-sm">
                  <button onClick={() => toggleSection(sIdx)} className={`w-full p-5 flex justify-between items-center transition-all text-left ${expandedSections.includes(sIdx) ? 'bg-primary/5' : 'hover:bg-background'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${expandedSections.includes(sIdx) ? 'bg-primary text-white' : 'bg-background text-text-muted'}`}>
                        {sIdx + 1}
                      </div>
                      <span className="font-bold text-sm text-text uppercase tracking-wide">{section.title}</span>
                    </div>
                    {expandedSections.includes(sIdx) ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} />}
                  </button>

                  {expandedSections.includes(sIdx) && (
                    <div className="p-3 space-y-2 border-t border-border bg-white">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson._id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border ${activeLesson?._id === lesson._id
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                            : 'border-transparent hover:border-primary/20 hover:bg-primary/5 text-text-muted hover:text-primary'
                            }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${activeLesson?._id === lesson._id ? 'bg-white/20' : 'bg-background'}`}>
                            {lesson.type === 'video' ? <PlayCircle size={18} /> : lesson.type === 'pdf' ? <FileText size={18} /> : <FileText size={18} />}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-bold truncate mb-1">{lesson.title}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] uppercase font-bold tracking-widest ${activeLesson?._id === lesson._id ? 'text-white/80' : 'text-text-muted'}`}>
                                {lesson.type}
                              </span>
                              <span className="opacity-30">•</span>
                              <span className={`text-[9px] uppercase font-bold tracking-widest ${activeLesson?._id === lesson._id ? 'text-white/80' : 'text-text-muted'}`}>
                                {lesson.duration || '5:00'}
                              </span>
                            </div>
                          </div>
                          {isLessonComplete(lesson._id) && (
                            <CheckCircle size={16} className={activeLesson?._id === lesson._id ? 'text-white' : 'text-green-500'} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPage;
