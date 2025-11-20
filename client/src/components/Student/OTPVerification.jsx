import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  ArrowRight,
  ArrowLeft,
  BookOpen,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verifyOTPAndRegister, resendOTP } from '../../Api/authApi.js';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get user data from navigation state
  const { userId, email, name } = location.state || {};
  
  // OTP input refs
  const inputRefs = useRef([]);

  // Redirect if no user data
  useEffect(() => {
    if (!userId || !email) {
      navigate('/signup');
    }
  }, [userId, email, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus next input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (error) setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i] || '';
    }
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Verify OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    console.log('Frontend OTP Verification:', { userId, otpString }); // Debug log
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await verifyOTPAndRegister({
        userId,
        otp: otpString
      });
      
      console.log('OTP Verification Response:', response); // Debug log
      
      if (response.success) {
        setSuccess('Email verified successfully! Welcome to our platform.');
        
        // Log in the user
        login(response.token);
        
        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
        
      } else {
        setError(response.message || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const response = await resendOTP(userId);
      
      if (response.success) {
        setSuccess('New verification code sent to your email!');
        setTimeLeft(600); // Reset timer
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        inputRefs.current[0]?.focus(); // Focus first input
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Verify Your Email</h1>
          <p className="text-slate-300 text-base">
            We've sent a 6-digit code to<br />
            <span className="text-blue-400 font-medium">{email}</span>
          </p>
        </motion.div>

        {/* OTP Form */}
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-xl font-bold bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                      error 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    disabled={isLoading || success}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className={`text-sm ${timeLeft > 60 ? 'text-slate-400' : 'text-orange-400'}`}>
                Code expires in: {formatTime(timeLeft)}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <div className="flex items-center text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
              >
                <div className="flex items-center text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || success || otp.join('').length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
                isLoading || success || otp.join('').length !== 6
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verified!</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-3">
                Didn't receive the code?
              </p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              ) : (
                <p className="text-slate-500 text-sm">
                  Resend available in {formatTime(timeLeft)}
                </p>
              )}
            </div>

            {/* Back to Sign Up */}
            <div className="text-center pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign Up</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerification;
