import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Clock,
  Star,
  Users,
  BookOpen,
  X,
  Loader
} from 'lucide-react';
import {searchCourses} from '../../Api/courseApi.js';

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
  const response = await searchCourses(searchTerm.trim());
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search courses');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopularSearch = async (term) => {
    setSearchTerm(term);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
    const response = await searchCourses(term);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search courses');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Your Perfect
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent block mt-2">
              Learning Path
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover thousands of courses designed to help you master new skills and advance your career
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg"
                />
              </div>
              
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters removed per user request */}
        </motion.div>

        {/* Popular Searches */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Popular Searches</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['JavaScript', 'Python', 'React', 'Data Science', 'UI/UX Design', 'Machine Learning'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handlePopularSearch(tag)}
                  className="px-6 py-3 bg-slate-800/50 border border-slate-600/50 rounded-full text-slate-300 hover:text-white hover:border-slate-500/50 transition-all duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

     

        {/* Search Results */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          {isLoading ? (
            <div className="text-center">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-12">
                <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-2xl font-semibold text-white mb-2">Searching...</h3>
                <p className="text-slate-400">Finding the perfect courses for you</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/30 rounded-2xl p-12">
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-red-400 mb-2">Search Error</h3>
                <p className="text-slate-400">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Search Results</h2>
                  <p className="text-slate-400">Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {searchResults.map((course) => (
                    <CourseCard key={course._id} course={course} navigate={navigate} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-12">
                  <SearchIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-slate-400 mb-2">No Results Found</h3>
                  <p className="text-slate-500">
                    No courses found for "{searchTerm}". Try different keywords or browse our popular searches above.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="text-center">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-12">
                <SearchIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-slate-400 mb-2">Start Your Search</h3>
                <p className="text-slate-500">Enter a keyword to find the perfect course for you</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// CourseCard component for displaying individual course results
const CourseCard = ({ course, navigate }) => {
  const formatPrice = (price, discount = 0) => {
    if (price === 0) return 'Free';
    const discountedPrice = price - (price * discount / 100);
    return `$${discountedPrice.toFixed(2)}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleViewCourse = () => {
    navigate(`/course/${course._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all duration-300"
    >
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-slate-500" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
            {formatPrice(course.price, course.discount)}
          </span>
          {course.discount > 0 && (
            <span className="block text-xs text-slate-300 line-through mt-1">
              ${course.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Published Badge */}
        {course.isPublished && (
          <div className="absolute top-4 left-4">
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2 overflow-hidden" 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-sm mb-4 overflow-hidden"
           style={{
             display: '-webkit-box',
             WebkitLineClamp: 3,
             WebkitBoxOrient: 'vertical',
           }}>
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center text-slate-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatDuration(course.totalDuration)}</span>
          </div>
          
          <div className="flex items-center text-slate-400">
            <Users className="w-4 h-4 mr-1" />
            <span>{course.enrolledStudents?.length || 0} students</span>
          </div>
          
          <div className="flex items-center text-yellow-400">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span>{getAverageRating(course.ratings)}</span>
          </div>
        </div>

        {/* Educator */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
            {course.educator?.avatar ? (
              <img
                src={course.educator.avatar}
                alt={course.educator.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {course.educator?.name?.charAt(0) || 'E'}
              </span>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {course.educator?.name || 'Anonymous Educator'}
            </p>
            <p className="text-slate-400 text-xs">Educator</p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleViewCourse}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          View Course
        </button>
      </div>
    </motion.div>
  );
};

export default Search;
