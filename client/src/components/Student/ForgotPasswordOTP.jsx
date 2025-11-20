import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { verifyResetOTP, forgotPassword } from '../../Api/authApi.js';

const ForgotPasswordOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  
  const { userId, email, name } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      navigate('/forgot-password');
      return;
    }

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userId, email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');

    // Focus on the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await verifyResetOTP({
        userId,
        otp: otpString
      });
      
      if (response.success) {
        // Navigate to reset password with the reset token
        navigate('/reset-password', {
          state: {
            resetToken: response.resetToken,
            email
          }
        });
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (isResending || timer > 0) return;

    setIsResending(true);
    setError('');
    
    try {
      const response = await forgotPassword(email);
      
      if (response.success) {
        setTimer(300); // Reset timer to 5 minutes
        setOtp(['', '', '', '', '', '']);
        // You might want to show a success message
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
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
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Reset Code</h1>
          <p className="text-slate-300 text-sm">
            We've sent a 6-digit code to<br />
            <span className="font-medium text-blue-400">{email}</span>
          </p>
        </motion.div>

        {/* OTP Form */}
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300 text-center">
                Enter 6-Digit Reset Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-bold bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                ))}
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs flex items-center justify-center mt-2"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </motion.p>
              )}
            </div>

            {/* Timer and Resend */}
            <div className="text-center space-y-3">
              {timer > 0 ? (
                <p className="text-slate-400 text-xs">
                  Code expires in <span className="font-mono font-bold text-blue-400">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-red-400 text-xs font-medium">Code has expired</p>
              )}
              
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={timer > 0 || isResending}
                className={`text-xs transition-colors duration-200 flex items-center justify-center space-x-1 w-full ${
                  timer > 0 || isResending
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                {isResending ? (
                  <>
                    <div className="w-3 h-3 border border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                isLoading || otp.join('').length !== 6
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Back Button */}
            <div className="text-center pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center justify-center space-x-1 w-full"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Email Entry</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordOTP;
