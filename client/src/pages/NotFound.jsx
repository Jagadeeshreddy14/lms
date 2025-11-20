import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  BookOpen, 
  AlertTriangle,
  Zap,
  Star
} from 'lucide-react';

const NotFound = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <motion.div 
          {...floatingAnimation}
          className="absolute top-20 left-20 w-4 h-4 bg-blue-500/30 rounded-full blur-sm"
          style={{ animationDelay: '0s' }}
        />
        <motion.div 
          {...floatingAnimation}
          className="absolute top-32 right-32 w-6 h-6 bg-purple-500/20 rounded-full blur-sm"
          style={{ animationDelay: '1s' }}
        />
        <motion.div 
          {...floatingAnimation}
          className="absolute bottom-32 left-16 w-3 h-3 bg-blue-400/40 rounded-full blur-sm"
          style={{ animationDelay: '2s' }}
        />
        <motion.div 
          {...floatingAnimation}
          className="absolute top-1/3 right-16 w-2 h-2 bg-purple-400/30 rounded-full"
          style={{ animationDelay: '0.5s' }}
        />
        <motion.div 
          {...floatingAnimation}
          className="absolute bottom-20 right-20 w-5 h-5 bg-blue-600/20 rounded-full blur-sm"
          style={{ animationDelay: '1.5s' }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-24 h-24 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* 404 Number with Modern Animation */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <motion.h1 
            className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4"
            animate={{ 
              backgroundPosition: ['0%', '100%'],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
            style={{ 
              backgroundSize: '200% 200%'
            }}
          >
            404
          </motion.h1>
          
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500"></div>
            <AlertTriangle className="w-6 h-6 text-blue-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500"></div>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-lg mx-auto">
            The page you're looking for seems to have taken a different path in our learning universe. 
            <br />
            <span className="text-blue-400 font-medium">Let's get you back on track!</span>
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link
            to="/"
            className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            <Home className="w-5 h-5 mr-3 group-hover:animate-pulse" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center justify-center px-8 py-4 border border-slate-600 text-base font-medium rounded-xl text-slate-300 bg-slate-800/50 backdrop-blur-xl hover:bg-slate-700/50 hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:animate-bounce" />
            Go Back
          </button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6 }}
          className="grid sm:grid-cols-3 gap-4 mb-8"
        >
          <Link
            to="/search"
            className="group p-6 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300"
          >
            <Search className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-white font-medium mb-2">Search Courses</h3>
            <p className="text-slate-400 text-sm">Find the perfect course for you</p>
          </Link>

          <Link
            to="/all-courses"
            className="group p-6 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
          >
            <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-white font-medium mb-2">Start Learning</h3>
            <p className="text-slate-400 text-sm">Login to your account</p>
          </Link>

          <Link
            to="/signup"
            className="group p-6 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-300"
          >
            <Star className="w-8 h-8 text-pink-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-white font-medium mb-2">Get Started</h3>
            <p className="text-slate-400 text-sm">Create your account</p>
          </Link>
        </motion.div>

        {/* Help Text */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-slate-500 text-sm">
            Need help?{' '}
            <Link
              to="/contact"
              className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300/50 underline-offset-4 transition-all duration-200"
            >
              Contact Support
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-full animate-pulse"></div>
        
        {/* Animated stars */}
        <motion.div
          className="absolute top-16 right-1/4"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Zap className="w-4 h-4 text-blue-400/30" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-16 left-1/4"
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Star className="w-3 h-3 text-purple-400/30" />
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;