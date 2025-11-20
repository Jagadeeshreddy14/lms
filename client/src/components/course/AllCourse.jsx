import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  ChevronDown,
  Calendar,
  Loader
} from 'lucide-react';

import { getAllCourses } from '../../Api/courseApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import CourseCard from './CourseCard.jsx';

const AllCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllCourses();
      
      console.log("All courses response:", response);
      
      if (response?.success) {
        setCourses(response.courses || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError(err?.message || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = courses.map(course => course.category).filter(Boolean);
    return [...new Set(categories)];
  };

  // Filter and sort logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.educator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel || course.difficulty === selectedLevel;
    
    let matchesPrice = true;
    if (priceRange === 'free') matchesPrice = course.price === 0;
    else if (priceRange === 'paid') matchesPrice = course.price > 0;
    else if (priceRange === 'under50') matchesPrice = course.price > 0 && course.price <= 50;
    else if (priceRange === 'over50') matchesPrice = course.price > 50;

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'students':
        return (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const EmptyState = () => (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="text-center py-16"
    >
      <BookOpen className="w-20 h-20 text-slate-600 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-white mb-4">No courses found</h3>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        {searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || priceRange !== 'all'
          ? "Try adjusting your search criteria or filters to find more courses."
          : "There are currently no courses available. Check back soon for new content!"
        }
      </p>
      <button
        onClick={() => {
          setSearchTerm('');
          setSelectedCategory('all');
          setSelectedLevel('all');
          setPriceRange('all');
        }}
        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
      >
        <Search className="w-5 h-5" />
        <span>Clear Filters</span>
      </button>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Loading Courses</h3>
        <p className="text-slate-400">Please wait while we fetch the latest courses...</p>
      </div>
    </div>
  );

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
      <div className="container mx-auto px-6 lg:px-8 pb-16">
        
        {/* Header Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Courses</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Discover thousands of courses from expert instructors and advance your skills
          </p>
          
          {/* Course Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-300">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{courses.length}</div>
              <div className="text-sm">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{getUniqueCategories().length}</div>
              <div className="text-sm">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0)}
              </div>
              <div className="text-sm">Students Enrolled</div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8"
        >
          {/* Search Input */}
          <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-600"
            >
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Price</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="under50">Under ₹50</option>
                  <option value="over50">Over ₹50</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="students">Most Students</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-1">Error Loading Courses</h3>
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchCourses}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="flex items-center justify-between mb-8"
          >
            <div className="text-slate-400">
              Showing {sortedCourses.length} of {courses.length} courses
              {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || priceRange !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setPriceRange('all');
                  }}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Courses Grid using your CourseCard component */}
        {!loading && !error && sortedCourses.length > 0 && (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {sortedCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedCourses.length === 0 && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center py-16"
          >
            <BookOpen className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No courses found</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || priceRange !== 'all'
                ? "Try adjusting your search criteria or filters to find more courses."
                : "There are currently no courses available. Check back soon for new content!"
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
                setPriceRange('all');
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Search className="w-5 h-5" />
              <span>Clear Filters</span>
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AllCourse;