import api from "./config.js";



// Send OTP for registration
export const sendRegistrationOTP = async (userData) => {
  try {
    const res = await api.post("/auth/send-registration-otp", userData);
    return res.data;
  } catch (error) {
    console.error("Send OTP error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Verify OTP and complete registration
export const verifyOTPAndRegister = async (otpData) => {
  try {
    const res = await api.post("/auth/verify-otp", otpData);
    return res.data;
  } catch (error) {
    console.error("Verify OTP error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Resend OTP
export const resendOTP = async (userId) => {
  try {
    const res = await api.post("/auth/resend-otp", { userId });
    return res.data;
  } catch (error) {
    console.error("Resend OTP error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

//  Register User (keeping original for backward compatibility)
export const registerUser = async (userData) => {
  try {
    const res = await api.post("/auth/register", userData);
    return res.data;
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

//  Login User
export const loginUser = async (credentials) => {
  try {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

//  Logout User
export const logoutUser = async () => {
  try {
    const res = await api.post("/auth/logout");
    return res.data;
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

//  Refresh Token
export const refreshTokenApi = async () => {
  try {
    const res = await api.post("/auth/refresh-token");
    return res.data;
  } catch (error) {
    console.error("Refresh token error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Forgot Password - Request reset
export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  } catch (error) {
    console.error("Forgot password error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Verify Reset OTP
export const verifyResetOTP = async (otpData) => {
  try {
    const res = await api.post("/auth/verify-reset-otp", otpData);
    return res.data;
  } catch (error) {
    console.error("Verify reset OTP error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Reset Password - Set new password with token
export const resetPassword = async (resetData) => {
  try {
    const res = await api.post("/auth/reset-password", resetData);
    return res.data;
  } catch (error) {
    console.error("Reset password error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// educator routes
export const getEducatorProfile = async () => {
  try {
    const res = await api.get("/auth/educator/profile");
    return res.data;
  } catch (error) {
    console.error("Get educator profile error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};