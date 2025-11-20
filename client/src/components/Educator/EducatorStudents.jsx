import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Users,
  BookOpen,
  RefreshCw,
  Download,
  TrendingUp,
  Mail,
  Award,
  MessageCircle
} from 'lucide-react';
 import {getAllStudentsAndEducators} from '../../Api/userApi.js'
const EducatorStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Placeholder data - replace with your backend data
  const [students, setStudents] = useState([]);

  const [courses, setCourses] = useState([]);
 
  // fetch and normalize data
  const fetchData = async () => {
    try {
      const res = await getAllStudentsAndEducators();
      const payload = res?.data ?? res;
      // try common response shapes
      let rawStudents = [];
      let rawCourses = [];

      if (Array.isArray(payload)) {
        rawStudents = payload;
      } else {
        rawStudents = payload.students ?? payload.users ?? payload.data ?? [];
        rawCourses = payload.courses ?? [];
      }

      const normalizeStudent = (s) => {
        const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.fullName || s.email || 'Unknown';
        const courseObj = s.course || s.enrolledCourse || (s.courses && s.courses[0]) || null;
        return {
          id: s._id || s.id || s.userId || Math.random().toString(36).slice(2, 9),
          name,
          email: s.email || s.contactEmail || '',
          avatar: s.avatar || s.avatarUrl || s.photo || s.profilePic || s.image || null,
          status: s.status || (s.isActive ? 'active' : 'inactive') || 'active',
          courseId: courseObj?._id || courseObj?.id || s.courseId || s.course_id || 'unknown',
          courseName: courseObj?.title || courseObj?.name || s.courseName || s.courseTitle || 'Unassigned',
          progress: typeof s.progress === 'number' ? s.progress : s.completion ?? s.progressPercent ?? 0,
          lessonsCompleted: s.lessonsCompleted ?? s.completedLessons ?? 0,
          timeSpent: s.timeSpent ?? s.hoursSpent ?? 0,
          rating: s.rating ?? s.avgRating ?? 0,
          createdAt: s.createdAt || s.created || s.joinedAt || null
        };
      };

      const studentsList = (Array.isArray(rawStudents) ? rawStudents : []).map(normalizeStudent);

      // derive courses either from payload.courses or from students
      let coursesList = [];
      if (Array.isArray(rawCourses) && rawCourses.length > 0) {
        coursesList = rawCourses.map(c => ({
          id: c._id || c.id || c.courseId,
          title: c.title || c.name || 'Untitled Course'
        }));
      } else {
        // build unique list from students
        const map = {};
        studentsList.forEach(s => {
          if (s.courseId && !map[s.courseId]) {
            map[s.courseId] = { id: s.courseId, title: s.courseName || 'Untitled Course' };
          }
        });
        coursesList = Object.values(map);
      }

      setStudents(studentsList);
      setCourses(coursesList);
    } catch (error) {
      console.error('Failed to fetch students/courses:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const studentStats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    completedCourses: students.filter(s => s.progress === 100).length,
    avgProgress: students.length > 0 ? students.reduce((sum, s) => sum + s.progress, 0) / students.length : 0
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || student.courseId === filterCourse;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });
  
  // apply sorting to filtered results
  const sortedStudents = (() => {
    const list = [...filteredStudents];
    if (sortBy === 'progress') return list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    if (sortBy === 'time') return list.sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
    if (sortBy === 'name') return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    // recent/default - sort by createdAt desc (fallback to id)
    return list.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta || (b.id || '').localeCompare(a.id || '');
    });
  })();

  const EmptyState = () => (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="text-center py-16"
    >
      <Users className="w-20 h-20 text-slate-600 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-white mb-4">No students yet</h3>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Once students start enrolling in your courses, you'll be able to track their progress and interact with them here.
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

  const InitialsAvatar = ({ name }) => {
    const initials = (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0,2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
        {initials || '?'}
      </div>
    );
  };

  const StudentCard = ({ student }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex items-center space-x-4">
        {student.avatar ? (
          <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <InitialsAvatar name={student.name} />
        )}

        <div>
          <h3 className="text-white font-semibold">{student.name}</h3>
          <p className="text-slate-400 text-sm">{student.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
      <div className="container mx-auto px-6 lg:px-8 pb-16">
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
                Student Management
              </h1>
              <p className="text-slate-300 mt-2">
                Track student progress and engagement
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={fetchData} className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{studentStats.totalStudents}</h3>
                <p className="text-slate-400 text-sm">Total Students</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{studentStats.activeStudents}</h3>
                <p className="text-slate-400 text-sm">Active Students</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{studentStats.completedCourses}</h3>
                <p className="text-slate-400 text-sm">Completed</p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{Math.round(studentStats.avgProgress)}%</h3>
                <p className="text-slate-400 text-sm">Avg Progress</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64"
                />
              </div>

              {/* Course Filter */}
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="recent">Most Recent</option>
                <option value="progress">Highest Progress</option>
                <option value="time">Most Time Spent</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          {students.length === 0 ? (
            <EmptyState />
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No students found</h3>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-700/40">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Enrolled Course</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-3 align-middle">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            { (student.name || '?').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() }
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 align-middle text-white">{student.name}</td>
                      <td className="py-3 px-3 align-middle text-slate-400 text-sm">{student.email}</td>
                      <td className="py-3 px-3 align-middle text-slate-300 text-sm">{student.courseName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        
      </div>
    </div>
  );
};

export default EducatorStudents;