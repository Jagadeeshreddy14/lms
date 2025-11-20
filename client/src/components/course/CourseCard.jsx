import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Users, BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/course/${course._id}`);
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        layout: { duration: 0.3 }
      }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group h-full flex flex-col"
      onClick={handleCourseClick}
    >
      {/* Course Thumbnail */}
      <div className="relative h-36 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden"> 
        {/* // h-36 instead of h-48 */}
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600" />
        )}
        
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
        
        {/* Course Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
            {course.category || 'General'}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
            <Star className="w-3 h-3 fill-current text-yellow-400" />
            <span>{course.rating || '4.0'}</span>
          </div>
        </div>

        {/* Price */}
        <div className="absolute bottom-2 right-2">
          <div className="px-2 py-0.5 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full text-green-400 text-xs font-semibold">
            ₹{course.price || '0'}
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4 flex-grow flex flex-col"> {/* // reduced from p-6 and added flex properties */}
        <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-slate-400 text-xs mb-2 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center text-slate-300 text-xs mb-2">
          <span className="font-medium">by {course.educator?.name || course.instructor || 'Unknown'}</span>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{course.chapters?.length || 0} chapters</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3.5 h-3.5" />
            <span>{course.enrolledStudents?.length || 0}</span>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              (course.level || course.difficulty) === 'Beginner' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : (course.level || course.difficulty) === 'Intermediate'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {course.level || course.difficulty || 'Beginner'}
          </span>
          
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              handleCourseClick();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
          >
            View
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
