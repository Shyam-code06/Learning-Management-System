import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Filter, Star, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      const coursesData = res.data?.data || res.data;
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Development', 'Design', 'Business', 'Marketing'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || course.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Explore Courses</h1>
            <p className="text-text-muted">Discover your next skill from our curated collection</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary focus:border-primary focus:outline-none bg-white shadow-sm"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${category === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-text-muted border border-secondary hover:border-primary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-80 animate-pulse bg-white border border-secondary opacity-50"></div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/course/${course._id}`} className="card overflow-hidden block p-0">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm font-bold text-text">4.8</span>
                      <span className="text-xs text-text-muted">(2.4k reviews)</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-text-muted mb-6">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>12h 30m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={16} />
                        <span>24 Lessons</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-secondary">
                      <span className="text-2xl font-bold text-primary">${course.price}</span>
                      <div className="flex items-center text-primary font-bold gap-1 text-sm">
                        View Details <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-secondary">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center text-primary mx-auto mb-6">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">No courses found</h2>
            <p className="text-text-muted">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default CourseCatalog;
