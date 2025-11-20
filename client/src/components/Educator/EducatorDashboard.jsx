import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Users, 
  
  TrendingUp,
  BarChart3,
  Settings,
  ArrowRight,
  Target,
  Clock,
  Star,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { getAllCourses } from '../../Api/courseApi.js';
import { getAllStudentsAndEducators } from '../../Api/userApi.js';
import { getEducatorCourses } from '../../Api/courseApi.js';

const EducatorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 0,
    totalEducators: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch educator's courses and platform stats in parallel
      const [coursesResponse, platformResponse] = await Promise.all([
        getEducatorCourses(), // Changed from getAllCourses to getEducatorCourses
        getAllStudentsAndEducators()
      ]);
      
      if (coursesResponse.success) {
        const userCourses = coursesResponse.courses; // These are the educator's own courses (published and unpublished)
        setCourses(userCourses);
        
        // Calculate stats
        const totalStudents = userCourses.reduce((total, course) => 
          total + (course.enrolledStudents?.length || 0), 0
        );
        const totalRevenue = userCourses.reduce((total, course) => 
          total + (course.price * (course.enrolledStudents?.length || 0)), 0
        );
        
        setStats({
          totalCourses: userCourses.length,
          totalStudents,
          totalRevenue,
          avgRating: 4.8 // Placeholder - calculate from actual ratings
        });
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
          totalEducators: educators.length,
          allUsers
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Navigation cards for different sections
  const dashboardSections = [
    {
      title: 'Create Course',
      description: 'Create and publish new courses for students',
      icon: Plus,
      path: '/educator/add-course',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'All Courses',
      description: 'View and manage all your published courses',
      icon: BookOpen,
      path: '/educator/all-courses',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Analytics',
      description: 'Track performance and revenue insights',
      icon: BarChart3,
      path: '/educator/analytics',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Students',
      description: 'Manage enrolled students and interactions',
      icon: Users,
      path: '/educator/students',
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      title: 'Assessments',
      description: 'Create and manage video assessments for your courses',
      icon: Star,
      path: '/educator/assessments',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    }
  ];

  // Quick stats with real data
  const quickStats = [
    { label: 'Total Courses', value: stats.totalCourses.toString(), icon: BookOpen, color: 'blue' },
    { label: 'Platform Students', value: platformStats.totalStudents.toString(), icon: Users, color: 'green' },
    { label: 'Platform Educators', value: platformStats.totalEducators.toString(), icon: Users, color: 'purple' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: IndianRupee, color: 'yellow' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
      <div className="container mx-auto px-6 lg:px-8 pb-16">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Educator Dashboard
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Welcome to your teaching hub. Manage courses, track analytics, and engage with students all in one place.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {quickStats.map((stat, index) => {
                const IconComponent = stat.icon;
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600',
                  green: 'from-green-500 to-emerald-600',
                  purple: 'from-purple-500 to-purple-600',
                  yellow: 'from-yellow-500 to-orange-600'
                };

                return (
                  <div
                    key={stat.label}
                    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[stat.color]} rounded-xl flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Recent Courses Preview */}
            {courses.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Recent Courses</h2>
                  <Link
                    to="/educator/all-courses"
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course._id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-600 relative">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white/50" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.isPublished 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-1">{course.title}</h3>
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{course.enrolledStudents?.length || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.totalDuration}h</span>
                            </span>
                          </div>
                          <Link
                            to={`/educator/course/${course._id}/manage`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Dashboard Sections */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {dashboardSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Link
                key={section.title}
                to={section.path}
                className="block group"
              >
                <div className={`${section.bgColor} ${section.borderColor} border backdrop-blur-xl rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-2xl flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {section.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/educator/add-course"
              className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 group"
            >
              <Plus className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300 group-hover:text-white transition-colors">New Course</span>
            </Link>
            
            <Link
              to="/educator/all-courses"
              className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-300 group"
            >
              <BookOpen className="w-5 h-5 text-green-400" />
              <span className="text-slate-300 group-hover:text-white transition-colors">View Courses</span>
            </Link>
            
            <Link
              to="/educator/analytics"
              className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 group"
            >
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300 group-hover:text-white transition-colors">Analytics</span>
            </Link>
            
            <Link
              to="/educator/students"
              className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-300 group"
            >
              <Users className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-300 group-hover:text-white transition-colors">Students</span>
            </Link>
            <Link
              to="/educator/assessments"
              className="flex items-center space-x-3 p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-300 group"
            >
              <Star className="w-5 h-5 text-pink-400" />
              <span className="text-slate-300 group-hover:text-white transition-colors">Assessments</span>
            </Link>
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8">
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Teaching?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Share your expertise with students worldwide. Create engaging courses and build your teaching career.
            </p>
            <Link
              to="/educator/add-course"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Course</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EducatorDashboard;
