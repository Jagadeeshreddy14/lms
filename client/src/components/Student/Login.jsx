import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../Api/authApi.js";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call the real login API
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // Use AuthContext login method
        login(response.token);

        // Reset form
        setFormData({
          email: "",
          password: "",
          rememberMe: false,
        });

        // Redirect to home page
        navigate("/");
      } else {
        // Check if the error is due to email verification required
        if (response.requiresVerification && response.userId) {
          // Navigate to OTP verification with user data
          navigate("/verify-otp", {
            state: {
              userId: response.userId,
              email: formData.email,
              name: "User", // We don't have the name from login
            },
          });
          return;
        }

        setErrors({
          submit: response.message || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: error.message || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
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
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-300">
            Sign in to continue your learning journey
          </p>
        </motion.div>

        {/* Login Form */}
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
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    className={`h-4 w-4 transition-colors duration-200 ${
                      focusedField === "email"
                        ? "text-blue-400"
                        : "text-slate-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/20"
                      : focusedField === "email"
                      ? "border-blue-500 focus:ring-blue-500/20"
                      : "border-slate-600 focus:border-slate-500"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>
                )}
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

            {/* Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    className={`h-4 w-4 transition-colors duration-200 ${
                      focusedField === "password"
                        ? "text-blue-400"
                        : "text-slate-400"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-9 pr-9 py-2.5 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500/20"
                      : focusedField === "password"
                      ? "border-blue-500 focus:ring-blue-500/20"
                      : "border-slate-600 focus:border-slate-500"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-600 bg-slate-800 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-xs text-slate-300"
                >
                  Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                isLoading
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
              } text-white`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
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

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Sign up here
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
