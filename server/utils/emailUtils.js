import transporter from "../config/nodemailer.js";

// Constants
const EMAIL_CONFIG = {
  SENDER_NAME: "CourseConnect LMS Platform",
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  OTP_EXPIRY_MINUTES: 10,
  RESET_TOKEN_EXPIRY_HOURS: 1,
};

// Base email template styles
const EMAIL_STYLES = `
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .message {
      font-size: 16px;
      color: #666666;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .otp-container {
      background: linear-gradient(135deg, #f8f9ff 0%, #f1f4ff 100%);
      border: 2px dashed #667eea;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      letter-spacing: 4px;
      margin: 10px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .otp-label {
      font-size: 14px;
      color: #888888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      color: #856404;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
      color: #6c757d;
      font-size: 14px;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #667eea;
      text-decoration: none;
      margin: 0 10px;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      padding: 8px;
      background-color: #667eea;
      color: white;
      border-radius: 50%;
      text-decoration: none;
      width: 36px;
      height: 36px;
      text-align: center;
      line-height: 20px;
    }
  </style>
`;

/**
 * Generate a secure 6-digit OTP
 * @returns {string} Generated OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a secure reset token
 * @returns {string} Generated token
 */
export const generateResetToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

/**
 * Create base email template structure
 * @param {string} title - Email title
 * @param {string} content - Email body content
 * @returns {string} Complete HTML email template
 */
const createEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${EMAIL_STYLES}
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f7fa;">
      <div class="email-container">
        <div class="header">
          <h1>${EMAIL_CONFIG.SENDER_NAME}</h1>
          <p>Excellence in Online Learning</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CourseConnect LMS Platform. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a> |
            <a href="#">Terms of Service</a> |
            <a href="#">Support</a>
          </div>
          <div class="social-links">
            <a href="#" title="Facebook">f</a>
            <a href="#" title="Twitter">t</a>
            <a href="#" title="LinkedIn">in</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">
            This email was sent from a secure server. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - Generated OTP
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} Result object with success status
 */
export const sendOTPEmail = async (email, otp, name) => {
  const content = `
    <div class="greeting">Hello ${name}! 👋</div>
    <div class="message">
      Welcome to CourseConnect LMS Platform! We're excited to have you join our learning community.
      <br><br>
      To complete your registration and verify your email address, please use the verification code below:
    </div>
    
    <div class="otp-container">
      <div class="otp-label">Your Verification Code</div>
      <div class="otp-code">${otp}</div>
    </div>
    
    <div class="warning">
      ⏰ <strong>Important:</strong> This verification code will expire in ${EMAIL_CONFIG.OTP_EXPIRY_MINUTES} minutes.
      If you didn't request this verification, please ignore this email.
    </div>
    
    <div class="message">
      Once verified, you'll have access to our extensive course catalog and can start your learning journey immediately.
      <br><br>
      If you have any questions, our support team is here to help!
    </div>
  `;

  const mailOptions = {
    from: `"${EMAIL_CONFIG.SENDER_NAME}" <${EMAIL_CONFIG.SENDER_EMAIL}>`,
    to: email,
    subject: "🔐 Verify Your Email - CourseConnect LMS Platform",
    html: createEmailTemplate("Email Verification", content),
  };

  return await sendEmail(mailOptions, "OTP verification", email);
};

/**
 * Send welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} Result object with success status
 */
export const sendWelcomeEmail = async (email, name) => {
  const content = `
    <div class="greeting">Welcome aboard, ${name}! 🎉</div>
    <div class="message">
      Congratulations on successfully joining CourseConnect LMS Platform! Your account has been verified and you're all set to begin your learning journey.
      <br><br>
      Here's what you can do now:
      <ul style="color: #666666; line-height: 1.8;">
        <li>Explore our extensive course catalog</li>
        <li>Enroll in courses that match your interests</li>
        <li>Track your progress and earn certificates</li>
        <li>Connect with instructors and fellow learners</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/courses" class="button">
        🚀 Explore Courses
      </a>
    </div>
    
    <div class="message">
      Need help getting started? Check out our <a href="#" style="color: #667eea;">Quick Start Guide</a> or reach out to our support team.
      <br><br>
      Happy learning! 📚
    </div>
  `;

  const mailOptions = {
    from: `"${EMAIL_CONFIG.SENDER_NAME}" <${EMAIL_CONFIG.SENDER_EMAIL}>`,
    to: email,
    subject: "🎉 Welcome to CourseConnect LMS Platform!",
    html: createEmailTemplate("Welcome", content),
  };

  return await sendEmail(mailOptions, "welcome", email);
};

/**
 * Send password reset OTP email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetOTP - 6-digit reset OTP
 * @returns {Promise<Object>} Result object with success status
 */
export const sendPasswordResetOTP = async (email, name, resetOTP) => {
  const content = `
    <div class="greeting">Hello ${name},</div>
    <div class="message">
      We received a request to reset your password for your CourseConnect LMS Platform account.
      <br><br>
      If you requested this password reset, please use the verification code below:
    </div>
    
    <div class="otp-container">
      <div class="otp-label">Password Reset Code</div>
      <div class="otp-code">${resetOTP}</div>
    </div>
    
    <div class="warning">
      ⏰ <strong>Security Notice:</strong> This password reset code will expire in 10 minutes.
      If you didn't request a password reset, please ignore this email and your password will remain unchanged.
    </div>
    
    <div class="message">
      For your security, never share this code with anyone. Our support team will never ask for this code.
    </div>
  `;

  const mailOptions = {
    from: `"${EMAIL_CONFIG.SENDER_NAME}" <${EMAIL_CONFIG.SENDER_EMAIL}>`,
    to: email,
    subject: "🔐 Password Reset Code - CourseConnect LMS Platform",
    html: createEmailTemplate("Password Reset", content),
  };

  return await sendEmail(mailOptions, "password reset OTP", email);
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} Result object with success status
 */
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const content = `
    <div class="greeting">Hello ${name},</div>
    <div class="message">
      We received a request to reset your password for your CourseConnect Learning Platform account.
      <br><br>
      If you requested this password reset, click the button below to create a new password:
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">
        🔑 Reset Password
      </a>
    </div>
    
    <div class="warning">
      ⏰ <strong>Security Notice:</strong> This password reset link will expire in ${EMAIL_CONFIG.RESET_TOKEN_EXPIRY_HOURS} hour(s).
      If you didn't request a password reset, please ignore this email and your password will remain unchanged.
    </div>
    
    <div class="message">
      For security reasons, if you're having trouble with the button above, you can copy and paste this link into your browser:
      <br>
      <code style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">${resetUrl}</code>
    </div>
  `;

  const mailOptions = {
    from: `"${EMAIL_CONFIG.SENDER_NAME}" <${EMAIL_CONFIG.SENDER_EMAIL}>`,
    to: email,
    subject: "🔐 Reset Your Password - CourseConnect LMS Platform",
    html: createEmailTemplate("Password Reset", content),
  };

  return await sendEmail(mailOptions, "password reset", email);
};

/**
 * Send course enrollment confirmation email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {Object} course - Course details
 * @returns {Promise<Object>} Result object with success status
 */
export const sendCourseEnrollmentEmail = async (email, name, course) => {
  const content = `
    <div class="greeting">Congratulations, ${name}! 🎊</div>
    <div class="message">
      You have successfully enrolled in "<strong>${course.title}</strong>"!
      <br><br>
      Course Details:
      <ul style="color: #666666; line-height: 1.8;">
        <li><strong>Course:</strong> ${course.title}</li>
        <li><strong>Instructor:</strong> ${course.instructor}</li>
        <li><strong>Duration:</strong> ${course.duration}</li>
        <li><strong>Level:</strong> ${course.level}</li>
        ${course.startDate ? `<li><strong>Start Date:</strong> ${new Date(course.startDate).toLocaleDateString()}</li>` : ''}
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/my-courses" class="button">
        📚 Access Course
      </a>
    </div>
    
    <div class="message">
      You can now access all course materials, assignments, and resources. Start learning at your own pace and don't forget to participate in discussions!
      <br><br>
      Best of luck with your studies! 🌟
    </div>
  `;

  const mailOptions = {
    from: `"${EMAIL_CONFIG.SENDER_NAME}" <${EMAIL_CONFIG.SENDER_EMAIL}>`,
    to: email,
    subject: `🎓 Course Enrollment Confirmed - ${course.title}`,
    html: createEmailTemplate("Course Enrollment", content),
  };

  return await sendEmail(mailOptions, "course enrollment", email);
};

/**
 * Send course completion certificate email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {Object} course - Course details
 * @param {string} certificateUrl - Certificate download URL
 * @returns {Promise<Object>} Result object with success status
 */
export const sendCertificateEmail = async (email, name, course, certificateUrl) => {
  const content = `
    <div class="greeting">Outstanding achievement, ${name}! 🏆</div>
    <div class="message">
      Congratulations on successfully completing "<strong>${course.title}</strong>"!
      <br><br>
      You have demonstrated dedication and perseverance throughout this learning journey. Your certificate of completion is now ready for download.
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${certificateUrl}" class="button">
        📜 Download Certificate
      </a>
    </div>
    
    <div class="message">
      Share your achievement:
      <ul style="color: #666666; line-height: 1.8;">
        <li>Add it to your LinkedIn profile</li>
        <li>Include it in your resume</li>
        <li>Share it with your network</li>
      </ul>
      <br>
      Keep up the great work and continue your learning journey with us! 🚀
    </div>
  `;

  const mailOptions = {
    from: `"${EMAIL_CONFIG.SENDER_NAME}" <${EMAIL_CONFIG.SENDER_EMAIL}>`,
    to: email,
    subject: `🎉 Certificate Ready - ${course.title}`,
    html: createEmailTemplate("Certificate of Completion", content),
  };

  return await sendEmail(mailOptions, "certificate", email);
};

/**
 * Send general notification email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @param {string} actionUrl - Optional action URL
 * @param {string} actionText - Optional action button text
 * @returns {Promise<Object>} Result object with success status
 */
export const sendNotificationEmail = async (email, name, subject, message, actionUrl = null, actionText = "Learn More") => {
  let content = `
    <div class="greeting">Hello ${name},</div>
    <div class="message">${message}</div>
  `;
  
  if (actionUrl) {
    content += `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" class="button">${actionText}</a>
      </div>
    `;
  }
  
  const mailOptions = {
    from: `"${EMAIL_CONFIG.SENDER_NAME}" <${EMAIL_CONFIG.SENDER_EMAIL}>`,
    to: email,
    subject: subject,
    html: createEmailTemplate("Notification", content),
  };

  return await sendEmail(mailOptions, "notification", email);
};

/**
 * Core email sending function with enhanced error handling and logging
 * @param {Object} mailOptions - Nodemailer mail options
 * @param {string} emailType - Type of email being sent (for logging)
 * @param {string} recipient - Recipient email (for logging)
 * @returns {Promise<Object>} Result object with success status
 */
const sendEmail = async (mailOptions, emailType, recipient) => {
  try {
    // Validate email options
    if (!mailOptions.to || !mailOptions.subject || !mailOptions.html) {
      throw new Error("Missing required email parameters");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mailOptions.to)) {
      throw new Error("Invalid email format");
    }

    
    
    const info = await transporter.sendMail(mailOptions);
    
    
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(` Failed to send ${emailType} email to ${recipient}:`);
    console.error(` Error details:`, error);
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Validate transporter configuration
 * @returns {Promise<Object>} Validation result
 */
export const validateEmailConfig = async () => {
  try {
    
    await transporter.verify();
    
    return { success: true, message: "Email configuration is valid" };
  } catch (error) {
    console.error("❌ Email configuration validation failed:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Email utility statistics and health check
 * @returns {Object} Email service status
 */
export const getEmailServiceStatus = () => {
  return {
    service: "CourseConnect Learning Email Service",
    version: "2.0.0",
    provider: "Brevo SMTP",
    features: [
      "OTP Verification",
      "Welcome Emails",
      "Password Reset",
      "Course Enrollment",
      "Certificate Delivery",
      "General Notifications"
    ],
    lastUpdated: new Date().toISOString()
  };
};
