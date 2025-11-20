import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  BookOpen,
  Code2,
  
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../Api/authApi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  
  // Refs for click outside detection
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const menuButton = event.target.closest('[data-mobile-menu-button]');
        if (!menuButton) {
          setIsMenuOpen(false);
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowProfileDropdown(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowProfileDropdown(false);
  }, [window.location?.pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      setShowProfileDropdown(false);
      setIsMenuOpen(false);
    }
  };

  // Toggle dropdown with better state management
  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/50 z-50 shadow-lg"
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-white">
              Course<span className="text-blue-400">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Icon */}
            <Link
              to="/search"
              className="p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
              title="Search Courses"
            >
              <Search className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            </Link>

            {/* Playground */}
            <Link
              to="/playground"
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 flex items-center gap-2"
              title="Code Playground"
            >
              <Code2 className="w-5 h-5" />
              <span className="font-medium">Playground</span>
            </Link>

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
               

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <div className="relative">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user?.name || 'Profile'}
                          className="w-8 h-8 rounded-full object-cover group-hover:scale-110 transition-transform duration-200 shadow-lg border-2 border-slate-700"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg ${
                          user?.role === 'educator' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600'
                        }`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        user?.role === 'educator' ? 'bg-purple-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                    
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        showProfileDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        {/* User Info Header */}
                        <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-slate-700/50">
                          <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user?.name || 'Profile'}
                                className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-slate-600"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                user?.role === 'educator' 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
                              }`}>
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-white font-semibold text-lg">
                                {user?.name || "User"}
                              </p>
                              <p className="text-slate-400 text-sm">{user?.email}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <div className={`w-2 h-2 rounded-full ${user?.role === 'educator' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                <span className={`text-xs font-medium capitalize ${user?.role === 'educator' ? 'text-purple-400' : 'text-blue-400'}`}>
                                  {user?.role || 'Student'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="p-2">
                          {user?.role === 'educator' ? (
                            // Educator Navigation - can access both dashboards
                            <>
                              <Link
                                to="/educator/dashboard"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 p-4 text-slate-300 hover:text-purple-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                              >
                                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                <div>
                                  <span className="font-medium">Educator Dashboard</span>
                                  <p className="text-xs text-slate-500">Manage your courses</p>
                                </div>
                              </Link>
                              
                              <Link
                                to="/student/dashboard"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                              >
                                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                <div>
                                  <span className="font-medium">Student Dashboard</span>
                                  <p className="text-xs text-slate-500">View enrolled courses</p>
                                </div>
                              </Link>
                            </>
                          ) : (
                            // Student Navigation - only student dashboard
                            <Link
                              to="/student/dashboard"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                            >
                              <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                              <div>
                                <span className="font-medium">Student Dashboard</span>
                                <p className="text-xs text-slate-500">View your courses</p>
                              </div>
                            </Link>
                          )}
                          
                          <Link
                            to={user?.role === 'educator'  ? "/student/account" : "/student/account"}
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                          >
                            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <div>
                              <span className="font-medium">Account Settings</span>
                              <p className="text-xs text-slate-500">Manage your profile</p>
                            </div>
                          </Link>
                          
                          

                          <hr className="border-slate-700/50 my-3" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full text-left group"
                          >
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <div>
                              <span className="font-medium">Sign Out</span>
                              <p className="text-xs text-slate-500">Logout from account</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-6 py-3 text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            data-mobile-menu-button
            className="md:hidden p-3 text-slate-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50"
            >
              <div className="p-6 space-y-4">
                {/* Search */}
                <Link
                  to="/search"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                >
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Search Courses</span>
                </Link>

                {/* Playground (Mobile) */}
                <Link
                  to="/playground"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                >
                  <Code2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Playground</span>
                </Link>

                {isLoggedIn ? (
                  <>
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-slate-700/50">
                      <div className="flex items-center space-x-3">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user?.name || 'Profile'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 shadow-lg"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.role === 'educator' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">{user?.name || "User"}</p>
                          <p className="text-slate-400 text-sm">{user?.email}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${user?.role === 'educator' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                            <span className={`text-xs font-medium capitalize ${user?.role === 'educator' ? 'text-purple-400' : 'text-blue-400'}`}>
                              {user?.role || 'Student'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-2">
                      {user?.role === 'educator' ? (
                        // Educator Mobile Navigation - can access both dashboards
                        <>
                          <Link
                            to="/educator/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-purple-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                          >
                            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Educator Dashboard</span>
                          </Link>
                          
                          <Link
                            to="/student/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                          >
                            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Student Dashboard</span>
                          </Link>
                        </>
                      ) : (
                        // Student Mobile Navigation - only student dashboard
                        <Link
                          to="/student/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                        >
                          <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">Student Dashboard</span>
                        </Link>
                      )}
                      
                      <Link
                        to="/student/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 p-4 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                      >
                        <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Account Settings</span>
                      </Link>

                      <hr className="border-slate-700/50 my-4" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-4 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full text-left group"
                      >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-4 px-6 text-slate-300 hover:text-white transition-colors duration-200 font-medium text-center border border-slate-600 rounded-xl hover:border-slate-500 hover:bg-slate-800/30"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center transform hover:scale-[1.02] shadow-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
