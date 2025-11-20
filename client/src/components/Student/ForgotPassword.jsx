import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { forgotPassword } from '../../Api/authApi.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await forgotPassword(email);
      
      if (response.success) {
        // Navigate to OTP verification with user data
        navigate('/forgot-password/verify-otp', {
          state: {
            userId: response.userId,
            email: email,
            name: 'User' // We don't have name from forgot password
          }
        });
      } else {
        setError(response.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-sm relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-slate-300">We've sent password reset instructions to your email</p>
          </motion.div>

          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
          >
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Reset link sent to {email}</span>
                </div>
              </div>
              
              <div className="text-slate-300 text-sm space-y-2">
                <p>Please check your email and click the reset link to create a new password.</p>
                <p className="text-slate-400 text-xs">The link will expire in 1 hour for security reasons.</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50"
                >
                  Send to different email
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-slate-300">Enter your email to reset your password</p>
        </motion.div>

        {/* Forgot Password Form */}
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-4 w-4 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-blue-400' : 'text-slate-400'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                    error 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : focusedField === 'email'
                      ? 'border-blue-500 focus:ring-blue-500/20'
                      : 'border-slate-600 focus:border-slate-500'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs flex items-center mt-1"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                isLoading
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Back to Login */}
            <div className="text-center pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center justify-center space-x-1 w-full"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
