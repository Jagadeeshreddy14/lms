import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import CourseCard from "./CourseCard";
import { getAllCourses } from "../../Api/courseApi.js";

const CoursesSection = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchCourses = async () => {
    try {
      console.log("Fetching all courses...");
      setLoading(true);
      setError(null);
      const response = await getAllCourses();
      console.log("Courses API response:", response);
      
      if (response.success && response.courses) {
        // Get only first 6 courses for featured section
        const courses = response.courses.slice(0, 6);
        setFeaturedCourses(courses);
        console.log("Featured courses set:", courses);
        // Small delay to ensure state update is complete
        setTimeout(() => setIsVisible(true), 100);
      } else {
        throw new Error(response.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const courseCardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Featured Courses
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover our most popular courses designed by industry experts to
            help you master new skills and advance your career
          </p>
        </motion.div>

        {/* Courses Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-pulse"
                >
                  <div className="bg-slate-700/50 h-48 rounded-xl mb-4"></div>
                  <div className="bg-slate-700/50 h-4 rounded mb-3"></div>
                  <div className="bg-slate-700/50 h-4 rounded w-3/4 mb-3"></div>
                  <div className="bg-slate-700/50 h-3 rounded w-1/2"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="col-span-full text-center py-12 mb-12"
            >
              <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-red-400 text-lg mb-4">Failed to load courses</p>
                <p className="text-slate-400 mb-6">{error}</p>
                <button
                  onClick={fetchCourses}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  <RefreshCw className={`mr-2 w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Try Again
                </button>
              </div>
            </motion.div>
          ) : featuredCourses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="col-span-full text-center py-12 mb-12"
            >
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-slate-300 text-lg">No courses available</p>
                <p className="text-slate-400 mt-2">Check back later for new courses</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
              {featuredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  variants={courseCardVariants}
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="h-full"
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View All Courses Button */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => navigate("/course")}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            <span>View All Courses</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesSection;
