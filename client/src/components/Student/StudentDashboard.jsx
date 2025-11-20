import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Play,
  CheckCircle,
  Calendar,
  Target,
  Star,
  BarChart3,
  Filter,
  Search,
  Grid,
  List,
  AlertCircle,
  Loader
} from 'lucide-react';
import { getEnrolledCourses, getUserStats } from '../../Api/userApi';
import { enrollInCourse } from '../../Api/courseApi';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get dashboard title and description based on user role
  const getDashboardContent = () => {
    if (user?.role === 'educator') {
      return {
        title: 'My Learning Dashboard',
        subtitle: 'Track your learning progress as an educator and student'
      };
    }
    return {
      title: 'My Learning Dashboard',
      subtitle: 'Track your progress and continue your learning journey'
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch enrolled courses and stats in parallel
      const [coursesResponse, statsResponse] = await Promise.all([
        getEnrolledCourses(),
        getUserStats()
      ]);

      if (coursesResponse.success) {
        setEnrolledCourses(coursesResponse.courses);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle course enrollment
  const handleEnrollCourse = async (courseId) => {
    try {
      const response = await enrollInCourse(courseId);
      if (response.success) {
        // Refresh data after enrollment
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    }
  };

  // Navigate to course learning page
  const handleStartLearning = (courseId) => {
    if (courseId) {
      navigate(`/course/${courseId}/learn`);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 25) return 'from-yellow-500 to-orange-600';
    return 'from-slate-500 to-slate-600';
  };

  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'in-progress') return matchesSearch && course.progress > 0 && course.progress < 100;
    if (filterStatus === 'completed') return matchesSearch && course.isCompleted;
    if (filterStatus === 'not-started') return matchesSearch && course.progress === 0;
    
    return matchesSearch;
  });

  // Create stats array from API data
  const statsArray = [
    { label: 'Enrolled Courses', value: stats.enrolledCourses?.toString() || '0', icon: BookOpen, color: 'blue' },
    { label: 'Completed Courses', value: stats.completedCourses?.toString() || '0', icon: CheckCircle, color: 'green' },
    { label: 'Learning Hours', value: stats.totalHours?.toString() || '0', icon: Clock, color: 'purple' },
    { label: 'Current Streak', value: `${stats.currentStreak || 0} days`, icon: TrendingUp, color: 'yellow' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-ping mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h3>
          <p className="text-slate-400">Preparing your learning experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Oops! Something went wrong</h3>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
      <div className="container mx-auto px-6 lg:px-8 pb-16">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {getDashboardContent().title}
          </h1>
          <p className="text-xl text-slate-300">
            {getDashboardContent().subtitle}
          </p>
          {user?.role === 'educator' && (
            <div className="mt-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg inline-flex items-center space-x-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">
                Educator Learning Dashboard
              </span>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12"
        >
          {statsArray.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-emerald-600',
              purple: 'from-purple-500 to-purple-600',
              yellow: 'from-yellow-500 to-orange-600'
            };

            return (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[stat.color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors duration-200">
                  {stat.value}
                </h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-200">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Filters and Search */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <h2 className="text-2xl font-bold text-white">My Courses</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-none sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  >
                    <option value="all">All Courses</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="not-started">Not Started</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex border border-slate-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'} transition-all duration-200`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'} transition-all duration-200`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Courses Grid/List */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
              className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
            >
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-300 mb-3">
                      {enrolledCourses.length === 0 ? 'No Enrolled Courses Yet' : 'No Courses Match Your Filter'}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {enrolledCourses.length === 0 
                        ? `Ready to start your learning journey${user?.role === 'educator' ? ' as an educator and learner' : ''}? Explore our course catalog and find the perfect course for you.`
                        : 'Try adjusting your search terms or filter criteria to find what you\'re looking for.'
                      }
                    </p>
                    {enrolledCourses.length === 0 && (
                      <button 
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                        onClick={() => {/* Navigate to courses */}}
                      >
                        Browse Courses
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 group"
                  >
                    {viewMode === 'grid' ? (
                      <>
                        {/* Course Thumbnail */}
                        <div className="relative h-44 lg:h-48 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
                          {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="w-16 h-16 text-white/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                              {course.difficulty || 'Beginner'}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              <span>{course.rating || '4.5'}</span>
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200 hover:scale-110"
                              onClick={() => handleStartLearning(course.id)}
                            >
                              <Play className="w-6 h-6 text-white ml-0.5" />
                            </button>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                              {course.title}
                            </h3>
                          </div>
                          
                          <p className="text-slate-400 text-sm mb-4">by {course.instructor}</p>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-slate-300">Progress</span>
                              <span className="text-white font-medium">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(course.progress)} transition-all duration-300`}
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Course Stats */}
                          <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            <span>{course.category || 'General'}</span>
                          </div>

                          {/* Last Accessed */}
                          <div className="border-t border-slate-700 pt-4">
                            <p className="text-xs text-slate-400 mb-1">Last Accessed:</p>
                            <p className="text-sm text-white">
                              {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'Never'}
                            </p>
                          </div>

                          {/* Action Button */}
                          <button 
                            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
                            onClick={() => handleStartLearning(course.id)}
                          >
                            <Play className="w-4 h-4" />
                            <span>{course.isCompleted ? 'Review Course' : 'Continue Learning'}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-6 p-6">
                        {/* Thumbnail */}
                        <div className="w-20 h-14 lg:w-24 lg:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex-shrink-0 relative overflow-hidden">
                          {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="w-6 h-6 text-white/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => handleStartLearning(course.id)}>
                              <Play className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0 px-4">
                          <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-blue-400 transition-colors duration-200">
                            {course.title}
                          </h3>
                          <p className="text-slate-400 text-sm mb-3">by {course.instructor}</p>
                          
                          {/* Progress */}
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(course.progress)} transition-all duration-300`}
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-white text-sm font-medium min-w-[3rem]">{course.progress}%</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            <span>{course.category || 'General'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end space-y-2 px-2">
                          <div className="flex items-center space-x-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration || '10h'}</span>
                          </div>
                          <button 
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 text-sm"
                            onClick={() => handleStartLearning(course.id)}
                          >
                            {course.isCompleted ? 'Review' : 'Continue'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Activity */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((course, index) => (
                  <div key={course.id} className="flex items-center space-x-3 p-3 bg-slate-900/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{course.title}</p>
                      <p className="text-slate-400 text-xs">
                        {course.lastAccessed ? `Accessed ${new Date(course.lastAccessed).toLocaleDateString()}` : 'Not started yet'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {enrolledCourses.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Learning Goals */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.6 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Learning Goals
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-white text-sm">Complete 5 courses</span>
                  </div>
                  <span className="text-slate-400 text-xs">{Math.min(stats.completedCourses || 0, 5)}/5</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-white text-sm">Study 30 hours</span>
                  </div>
                  <span className="text-slate-400 text-xs">{Math.min(stats.totalHours || 0, 30)}/30h</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-white text-sm">7-day streak</span>
                  </div>
                  <span className="text-slate-400 text-xs">{Math.min(stats.currentStreak || 0, 7)}/7 days</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.7 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Browse Courses</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-200">
                  <BarChart3 className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">View Progress</span>
                </button>
                
                
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;