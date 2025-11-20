import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  BookOpen,
  AlertCircle,
  User,
  Phone,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sendRegistrationOTP } from '../../Api/authApi.js';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Prepare data for OTP sending
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      };

      // Send OTP instead of direct registration
      const response = await sendRegistrationOTP(userData);
      
      if (response.success) {
        // Navigate to OTP verification with user data
        navigate('/verify-otp', {
          state: {
            userId: response.userId,
            email: formData.email,
            name: userData.name
          }
        });
        
      } else {
        setErrors({ submit: response.message || 'Failed to send verification code. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Failed to send verification code. Please try again.' });
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

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[a-z]/.test(formData.password)) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/\d/.test(formData.password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
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
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-300">Join thousands of learners worldwide</p>
        </motion.div>

        {/* Sign Up Form */}
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div className="space-y-1">
                <label htmlFor="firstName" className="block text-xs font-medium text-slate-300">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-4 w-4 transition-colors duration-200 ${
                      focusedField === 'firstName' ? 'text-blue-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                      errors.firstName 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : focusedField === 'firstName'
                        ? 'border-blue-500 focus:ring-blue-500/20'
                        : 'border-slate-600 focus:border-slate-500'
                    }`}
                    placeholder="First name"
                  />
                </div>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center mt-1"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.firstName}
                  </motion.p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label htmlFor="lastName" className="block text-xs font-medium text-slate-300">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-4 w-4 transition-colors duration-200 ${
                      focusedField === 'lastName' ? 'text-blue-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                      errors.lastName 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : focusedField === 'lastName'
                        ? 'border-blue-500 focus:ring-blue-500/20'
                        : 'border-slate-600 focus:border-slate-500'
                    }`}
                    placeholder="Last name"
                  />
                </div>
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center mt-1"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : focusedField === 'email'
                      ? 'border-blue-500 focus:ring-blue-500/20'
                      : 'border-slate-600 focus:border-slate-500'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs flex items-center mt-1"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-xs font-medium text-slate-300">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className={`h-4 w-4 transition-colors duration-200 ${
                    focusedField === 'phone' ? 'text-blue-400' : 'text-slate-400'
                  }`} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : focusedField === 'phone'
                      ? 'border-blue-500 focus:ring-blue-500/20'
                      : 'border-slate-600 focus:border-slate-500'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs flex items-center mt-1"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.phone}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-blue-400' : 'text-slate-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-9 pr-9 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : focusedField === 'password'
                      ? 'border-blue-500 focus:ring-blue-500/20'
                      : 'border-slate-600 focus:border-slate-500'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength <= 25 ? 'bg-red-500' :
                          passwordStrength <= 50 ? 'bg-yellow-500' :
                          passwordStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 25 ? 'text-red-400' :
                      passwordStrength <= 50 ? 'text-yellow-400' :
                      passwordStrength <= 75 ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {passwordStrength <= 25 ? 'Weak' :
                       passwordStrength <= 50 ? 'Fair' :
                       passwordStrength <= 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs flex items-center mt-1"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 transition-colors duration-200 ${
                    focusedField === 'confirmPassword' ? 'text-blue-400' : 'text-slate-400'
                  }`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-9 pr-9 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : focusedField === 'confirmPassword'
                      ? 'border-blue-500 focus:ring-blue-500/20'
                      : 'border-slate-600 focus:border-slate-500'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-9 flex items-center pr-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs flex items-center mt-1"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-1">
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-600 bg-slate-800 rounded mt-0.5"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-xs text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.agreeToTerms}
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
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-center text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              </motion.div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Sign in here
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;