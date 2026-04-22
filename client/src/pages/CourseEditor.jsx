import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Video, FileText, ChevronDown, ChevronUp, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail: '',
    category: 'Development',
    sections: []
  });
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(res.data);
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!course.title || !course.description) {
      return toast.error('Please fill all required fields');
    }

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/courses/${id}`, course);
        toast.success('Course updated!');
      } else {
        await axios.post('http://localhost:5000/api/courses', course);
        toast.success('Course created!');
      }
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to save course');
    }
  };

  const addSection = () => {
    const newSection = { title: 'New Module', lessons: [] };
    setCourse({ ...course, sections: [...course.sections, newSection] });
  };

  const removeSection = (sIdx) => {
    const sections = [...course.sections];
    sections.splice(sIdx, 1);
    setCourse({ ...course, sections });
  };

  const addLesson = (sIdx) => {
    const sections = [...course.sections];
    sections[sIdx].lessons.push({ title: 'New Lesson', type: 'video', content: '' });
    setCourse({ ...course, sections });
  };

  const removeLesson = (sIdx, lIdx) => {
    const sections = [...course.sections];
    sections[sIdx].lessons.splice(lIdx, 1);
    setCourse({ ...course, sections });
  };

  const updateLesson = (sIdx, lIdx, field, value) => {
    const sections = [...course.sections];
    sections[sIdx].lessons[lIdx][field] = value;
    setCourse({ ...course, sections });
  };

  const updateSectionTitle = (sIdx, value) => {
    const sections = [...course.sections];
    sections[sIdx].title = value;
    setCourse({ ...course, sections });
  };

  if (loading) return <div className="pt-40 text-center text-primary font-bold">Loading editor...</div>;

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-text-muted hover:text-primary font-bold transition-all">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <button onClick={handleSave} className="btn btn-primary px-8 py-3 flex items-center gap-2">
            <Save size={20} /> {isEdit ? 'Update Course' : 'Create Course'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-6">Course Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    placeholder="e.g. Complete React Mastery"
                    className="w-full px-4 py-3 rounded-xl border border-secondary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Description *</label>
                  <textarea
                    rows="4"
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    placeholder="Describe what students will learn..."
                    className="w-full px-4 py-3 rounded-xl border border-secondary focus:border-primary focus:outline-none resize-none"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Price ($) *</label>
                    <input
                      type="number"
                      value={course.price}
                      onChange={(e) => setCourse({ ...course, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Category</label>
                    <select
                      value={course.category}
                      onChange={(e) => setCourse({ ...course, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary focus:border-primary focus:outline-none bg-white"
                    >
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Course Curriculum</h3>
                <button onClick={addSection} className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
                  <Plus size={16} /> Add Section
                </button>
              </div>

              <div className="space-y-6">
                {course.sections.map((section, sIdx) => (
                  <div key={sIdx} className="p-6 bg-background rounded-2xl border border-secondary">
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-primary font-bold text-lg outline-none"
                      />
                      <button onClick={() => removeSection(sIdx)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      {section.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="bg-white p-4 rounded-xl border border-secondary">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-grow space-y-2">
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(sIdx, lIdx, 'title', e.target.value)}
                                className="w-full font-bold text-sm outline-none border-b border-transparent focus:border-primary mb-2"
                                placeholder="Lesson Title"
                              />
                              <div className="flex gap-4">
                                <select
                                  value={lesson.type}
                                  onChange={(e) => updateLesson(sIdx, lIdx, 'type', e.target.value)}
                                  className="text-xs font-bold bg-background p-1 rounded"
                                >
                                  <option value="video">Video</option>
                                  <option value="text">Text</option>
                                  <option value="pdf">PDF</option>
                                </select>
                                <input
                                  type="text"
                                  value={lesson.content}
                                  onChange={(e) => updateLesson(sIdx, lIdx, 'content', e.target.value)}
                                  className="flex-grow text-xs outline-none border-b border-secondary focus:border-primary"
                                  placeholder={lesson.type === 'video' ? 'YouTube URL' : 'Content or Link'}
                                />
                              </div>
                            </div>
                            <button onClick={() => removeLesson(sIdx, lIdx)} className="text-text-muted hover:text-red-500 self-start">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addLesson(sIdx)}
                      className="w-full py-2 border-2 border-dashed border-secondary rounded-xl text-text-muted hover:text-primary hover:border-primary transition-all text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add Lesson
                    </button>
                  </div>
                ))}

                {course.sections.length === 0 && (
                  <div className="py-12 text-center bg-background rounded-2xl border-2 border-dashed border-secondary">
                    <p className="text-text-muted mb-4">Start building your course structure</p>
                    <button onClick={addSection} className="btn btn-outline py-2 px-6">Create First Module</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Preview */}
          <div className="md:col-span-1">
            <div className="card sticky top-28">
              <h3 className="text-lg font-bold mb-6">Course Preview</h3>
              <div className="aspect-video bg-background rounded-2xl mb-6 overflow-hidden flex items-center justify-center relative group">
                {course.thumbnail ? (
                  <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="flex flex-col items-center text-text-muted">
                    <ImageIcon size={48} className="mb-2 opacity-20" />
                    <p className="text-xs font-bold">No Image</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Preview</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-text-muted italic bg-primary-light p-3 rounded-lg border border-primary/20 text-center">
                  An engaging cover image related to your category will be automatically generated upon creation.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Status:</span>
                  <span className={`font-bold ${course.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Last Updated:</span>
                  <span className="font-bold">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CourseEditor;
