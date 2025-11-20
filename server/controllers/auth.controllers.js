import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import { generateOTP, sendOTPEmail, generateResetToken, sendPasswordResetEmail, sendPasswordResetOTP } from "../utils/emailUtils.js";

// Step 1: Send OTP for registration
export const sendRegistrationOTP = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.json({ success: false, message: "User already exists and verified" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const hashpassword = await bcrypt.hash(password, 10);

    // Create or update user with OTP
    let user;
    if (existingUser) {
      // Update existing unverified user
      user = await User.findByIdAndUpdate(
        existingUser._id,
        {
          name,
          password: hashpassword,
          otp,
          otpExpiry,
          isVerified: false
        },
        { new: true }
      );
    } else {
      // Create new user
      user = new User({
        name,
        email,
        password: hashpassword,
        otp,
        otpExpiry,
        isVerified: false
      });
      await user.save();
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name);
    if (!emailResult.success) {
      // Log the error details for debugging, but don't crash the registration flow.
      console.error(`Failed to send OTP verification email to ${email}:`, emailResult);

      // Respond with userId and emailSent flag so frontend can guide the user to retry or contact support.
      return res.status(200).json({
        success: true,
        message: "User created but verification email could not be sent. Please try resending the OTP or contact support.",
        userId: user._id,
        emailSent: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      userId: user._id
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Step 2: Verify OTP and complete registration
export const verifyOTPAndRegister = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "User ID and OTP are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "User already verified" });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Update user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role  
      }, 
      process.env.JWT_TOKEN, 
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({ 
      success: true, 
      message: "Email verified successfully! Registration completed.",
      token: token
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "User already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.name);
    if (!emailResult.success) {
      console.error(`Failed to resend OTP verification email to ${user.email}:`, emailResult);

      return res.status(200).json({
        success: true,
        message: "User exists and OTP updated, but email could not be sent. Please try again or contact support.",
        emailSent: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "New verification code sent to your email",
      emailSent: true,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashpassword });
    await user.save();
    
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role  
      }, 
      process.env.JWT_TOKEN, 
      { expiresIn: "30d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully", token: token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
    console.log(error.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email.." });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.json({ 
        success: false, 
        message: "Please verify your email first",
        requiresVerification: true,
        userId: user._id
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password.." });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role  
      }, 
      process.env.JWT_TOKEN,
      { expiresIn: "30d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
    console.log(error.message);
  }

  
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // Ensure path matches
    });

    res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Generate new token with extended expiration
    const newToken = jwt.sign(
      { 
        id: user._id,
        role: user.role  
      }, 
      process.env.JWT_TOKEN,
      { expiresIn: "30d" }
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log("Refresh token error:", error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired, please login again",
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Forgot Password - Send reset email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    // Check if user exists and is verified
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User with this email does not exist" });
    }

    if (!user.isVerified) {
      return res.json({ success: false, message: "Please verify your email first before resetting password" });
    }

    // Generate 6-digit OTP for password reset
    const resetOTP = generateOTP();
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset OTP to user (reusing resetToken field for OTP)
    user.resetToken = resetOTP;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset OTP email
    const emailResult = await sendPasswordResetOTP(user.email, user.name, resetOTP);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset OTP"
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset OTP has been sent to your email",
      userId: user._id
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Verify Reset OTP
export const verifyResetOTP = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "User ID and OTP are required" });
  }

  try {
    // Find user with valid reset OTP
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check OTP expiry
    if (user.resetTokenExpiry < new Date()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    // Verify OTP
    if (user.resetToken !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid, generate a temporary token for password reset
    const tempResetToken = generateResetToken();
    user.resetToken = tempResetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes to reset password
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken: tempResetToken
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Reset Password - Set new password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.json({ success: false, message: "Token and new password are required" });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.json({ success: false, message: "Password must be at least 6 characters long" });
  }

  try {
    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


