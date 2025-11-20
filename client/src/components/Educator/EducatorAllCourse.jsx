import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Edit,
  Eye,
  Trash2,
  Star,
  Users,
  Clock,
  BookOpen,
  TrendingUp,
  Copy,
  Archive,
  AlertCircle,
  Loader,
  IndianRupee
} from 'lucide-react';

// Import API functions
import { getEducatorCourses, deleteCourse, toggleCourse, getAllCourses } from '../../Api/courseApi.js';
import { getAllStudentsAndEducators } from '../../Api/userApi.js';
// Import auth context to get current user
import { useAuth } from '../../context/AuthContext.jsx';

const EducatorAllCourse = () => {
  const { user, loading: authLoading } = useAuth(); // Get current user and loading state from context
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOwnership, setFilterOwnership] = useState('all'); // 'all', 'mine', 'others'
  const [viewType, setViewType] = useState('mine'); // 'platform' or 'mine' - changed default to 'mine'
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Courses data from backend
  const [courses, setCourses] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 0,
    totalEducators: 0
  });


  useEffect(() => {
    // Only fetch courses after user authentication is complete
    if (!authLoading) {
      fetchCourses();
    }
  }, [authLoading, viewType]); // Added viewType dependency

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch different data based on view type
      let coursesResponse, platformResponse;
      
      if (viewType === 'mine') {
        // Fetch only the educator's courses (both published and unpublished)
        [coursesResponse, platformResponse] = await Promise.all([
          getEducatorCourses(),
          getAllStudentsAndEducators()
        ]);
      } else {
        // Fetch all published courses from the platform
        [coursesResponse, platformResponse] = await Promise.all([
          getAllCourses(), // Only returns published courses
          getAllStudentsAndEducators()
        ]);
      }
      
      if (coursesResponse.success && coursesResponse.courses) {
        const allCourses = coursesResponse.courses;
        
        // Debug: Log the raw course data to see educator information
        console.log('Raw course data:', allCourses[0]);
        if (allCourses[0]?.educator) {
          console.log('Educator data:', allCourses[0].educator);
        }
        
        // Transform the data to match our component's expected format
        const transformedCourses = allCourses.map(course => {
          console.log('Course educator data:', course.educator);
          return {
            id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            discount: course.discount || 0,
            thumbnail: course.thumbnail,
            status: course.isPublished ? 'published' : 'draft',
            rating: calculateAverageRating(course.ratings),
            students: course.enrolledStudents?.length || 0,
            lessons: course.lectures?.length || 0,
            duration: formatDuration(course.totalDuration),
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            educator: course.educator, // Include educator info
            instructor: course.instructor, // Also include instructor field if it exists
            isOwnCourse: user && course.educator && course.educator._id === user._id // Check if current user owns this course
          };
        });
        
        setCourses(transformedCourses);
      } else {
        throw new Error(coursesResponse.message || 'Failed to fetch courses');
      }

      // Set platform stats - using same structure as EducatorStudents
      if (platformResponse) {
        const payload = platformResponse?.data ?? platformResponse;
        let allUsers = [];
        
        // Handle different response structures
        if (Array.isArray(payload)) {
          allUsers = payload;
        } else if (payload.data && Array.isArray(payload.data)) {
          allUsers = payload.data;
        } else {
          allUsers = payload.students ?? payload.users ?? [];
        }
        
        // Filter users by role
        const students = allUsers.filter(user => user.role === 'student');
        const educators = allUsers.filter(user => user.role === 'educator');
        
        setPlatformStats({
          totalStudents: students.length,
          totalEducators: educators.length
        });
        
        console.log('Platform Stats:', {
          totalUsers: allUsers.length,
          totalStudents: students.length,
          totalEducators: educators.length
        });
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate average rating
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  // Helper function to format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting course:', courseId);
      const response = await deleteCourse(courseId);
      console.log('Delete course response:', response);
      
      if (response.success) {
        // Remove the course from the local state
        setCourses(courses.filter(course => course.id !== courseId));
        console.log('Course deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete course');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err.message || 'Failed to delete course');
    }
  };

  // Handle course toggle (publish/unpublish)
  const handleToggleCourse = async (courseId, currentStatus) => {
    try {
      console.log('Toggling course status:', courseId, currentStatus);
      const response = await toggleCourse(courseId);
      console.log('Toggle course response:', response);
      
      if (response.success) {
        // Update the course status in local state
        setCourses(courses.map(course => 
          course.id === courseId 
            ? { ...course, status: currentStatus === 'published' ? 'draft' : 'published' }
            : course
        ));
        console.log('Course status toggled successfully');
      } else {
        throw new Error(response.message || 'Failed to toggle course status');
      }
    } catch (err) {
      console.error('Error toggling course status:', err);
      setError(err.message || 'Failed to toggle course status');
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesOwnership = filterOwnership === 'all' || 
                           (filterOwnership === 'mine' && (course.isOwnCourse || false)) ||
                           (filterOwnership === 'others' && !(course.isOwnCourse || false));
    return matchesSearch && matchesStatus && matchesOwnership;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'students':
        return b.students - a.students;
      case 'revenue':
        return (b.students * b.price) - (a.students * a.price);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const EmptyState = () => (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="text-center py-16"
    >
      <BookOpen className="w-20 h-20 text-slate-600 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-white mb-4">No courses available</h3>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        There are currently no courses available on the platform. Be the first to create one!
      </p>
      <Link
        to="/educator/add-course"
        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
      >
        <BookOpen className="w-5 h-5" />
        <span>Create Your First Course</span>
      </Link>
    </motion.div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 group">
      {/* Course Thumbnail - Made shorter */}
      <div className="relative h-36 bg-gradient-to-r from-blue-600 to-purple-600">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-black/20" />
        )}
        <div className="absolute top-3 left-3">
          <button
            onClick={() => course.isOwnCourse && handleToggleCourse(course.id, course.status)}
            disabled={!course.isOwnCourse}
            className={`px-2 py-1 backdrop-blur-sm rounded-full text-white text-xs transition-all duration-200 ${
              course.isOwnCourse ? 'hover:scale-105' : 'cursor-not-allowed opacity-75'
            } ${
              course.status === 'published' 
                ? 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30' 
                : course.status === 'draft'
                ? 'bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30'
                : 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30'
            }`}
          >
            {course.status}
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
            <Star className="w-3 h-3 fill-current text-yellow-400" />
            <span>{course.rating || 0}</span>
          </div>
        </div>
        <div className="absolute bottom-3 right-3">
          {course.isOwnCourse && (
            <button 
              onClick={() => handleDeleteCourse(course.id, course.title)}
              className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-600/70 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Course Info - Made more compact */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">
          {course.title}
        </h3>
        
        {/* Educator Info - More compact */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {(course.educator?.name || course.instructor || user?.name || 'Unknown')?.charAt(0)?.toUpperCase() || 'E'}
            </span>
          </div>
          <span className="text-slate-400 text-xs">
            by {course.educator?.name || course.instructor || user?.name || 'Unknown Educator'}
          </span>
          {course.isOwnCourse && (
            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              Your Course
            </span>
          )}
        </div>

        {/* Course Stats - Made more compact */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">{course.students} students</span>
          </div>
          <div className="flex items-center space-x-1">
            <IndianRupee className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">₹{course.price}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">{course.lessons} lessons</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">{course.duration}</span>
          </div>
        </div>

        {/* Actions - Always show edit button as enabled */}
        <div className="flex space-x-2 pt-3 border-t border-slate-700">
          <Link
            to={`/course/${course.id}`}
            className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200 flex items-center justify-center space-x-1 text-sm"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </Link>
          <Link
            to={`/educator/edit-course/${course.id}`}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-1 cursor-pointer hover:scale-105 text-sm"
            onClick={() => console.log('Edit button clicked for course:', course.id)}
          >
            <Edit className="w-3 h-3" />
            <span>Edit</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
      <div className="container mx-auto px-6 lg:px-8 pb-16">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/educator/dashboard"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {viewType === 'mine' ? 'My Courses' : 'All Platform Courses'}
              </h1>
              <p className="text-slate-300 mt-2">
                {viewType === 'mine' 
                  ? 'Manage your courses (published and unpublished)'
                  : 'Browse all published courses on the platform'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Type Toggle */}
            <div className="flex bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType('mine')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  viewType === 'mine' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setViewType('platform')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  viewType === 'platform' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Platform Courses
              </button>
            </div>

            <Link
              to="/educator/add-course"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Create Course</span>
            </Link>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading || authLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">
                {authLoading ? 'Authenticating...' : 'Loading all platform courses...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            >
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{courses.length}</h3>
                    <p className="text-slate-400 text-sm">
                      {viewType === 'mine' ? 'My Courses' : 'Platform Courses'}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              {viewType === 'mine' ? (
                <>
                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {courses.filter(c => c.status === 'published').length}
                        </h3>
                        <p className="text-slate-400 text-sm">Published</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {courses.filter(c => c.status === 'draft').length}
                        </h3>
                        <p className="text-slate-400 text-sm">Draft</p>
                      </div>
                      <Users className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {courses.reduce((sum, course) => sum + (course.students || 0), 0)}
                        </h3>
                        <p className="text-slate-400 text-sm">My Students</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          ₹{courses.reduce((sum, course) => sum + (course.students * course.price || 0), 0).toLocaleString('en-IN')}
                        </h3>
                        <p className="text-slate-400 text-sm">Total Revenue</p>
                      </div>
                      <Users className="w-8 h-8 text-orange-400" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{courses.filter(c => c.isOwnCourse || false).length}</h3>
                        <p className="text-slate-400 text-sm">My Courses</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{courses.filter(c => !c.isOwnCourse || false).length}</h3>
                        <p className="text-slate-400 text-sm">Other Courses</p>
                      </div>
                      <Users className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{platformStats.totalStudents}</h3>
                        <p className="text-slate-400 text-sm">Platform Students</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{platformStats.totalEducators}</h3>
                        <p className="text-slate-400 text-sm">Platform Educators</p>
                      </div>
                      <Users className="w-8 h-8 text-orange-400" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>

        {/* Filters and Search */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              {/* Ownership Filter */}
              <select
                value={filterOwnership}
                onChange={(e) => setFilterOwnership(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Courses</option>
                <option value="mine">My Courses</option>
                <option value="others">Other Educators</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="students">Most Students</option>
                <option value="revenue">Highest Revenue</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm">
                {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

            {/* Courses Grid */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
            >
              {courses.length === 0 ? (
                <EmptyState />
              ) : sortedCourses.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
                  <p className="text-slate-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bulk Actions - Show when courses exist */}
            {courses.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                      to="/educator/add-course"
                      className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 group"
                    >
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-300 group-hover:text-white transition-colors">New Course</span>
                    </Link>
                    
                    <button className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-300 group">
                      <Copy className="w-5 h-5 text-green-400" />
                      <span className="text-slate-300 group-hover:text-white transition-colors">Duplicate Course</span>
                    </button>
                    
                    <button className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-300 group">
                      <Archive className="w-5 h-5 text-yellow-400" />
                      <span className="text-slate-300 group-hover:text-white transition-colors">Archive Courses</span>
                    </button>
                    
                    <Link
                      to="/educator/analytics"
                      className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 group"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span className="text-slate-300 group-hover:text-white transition-colors">View Analytics</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EducatorAllCourse;