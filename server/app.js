import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import { connectCloudinary } from './config/cloudnary.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import courseRouter from './routes/course.routes.js';
import chapterRouter from './routes/chapter.routes.js';
import lectureRouter from './routes/lecture.routes.js';
import videoRouter from './routes/video.routes.js';
import paymentRouter from './routes/payment.routes.js';
import execRouter from './routes/exec.routes.js';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

// CORS configuration - FIXED: Added your frontend URLs
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://advanced-lms.vercel.app',
    'http://localhost:5174', // Added for Vite default port
    'https://lms-indol-one.vercel.app' // Added your frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cookie',
    'Set-Cookie'
  ],
  exposedHeaders: [
    'Set-Cookie',
    'Authorization'
  ]
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// Morgan logging
app.use(morgan('dev'));

// Cookie parser
app.use(cookieParser());

// Body parsing middleware with conditional handling for file uploads
app.use((req, res, next) => {
  // Skip body parsing for multipart/form-data (file uploads)
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Set longer timeout for file uploads
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
    return next();
  }
  
  // Apply JSON parsing for other requests
  express.json({ limit: '600mb' })(req, res, (err) => {
    if (err) {
      console.error('JSON parsing error:', err);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON payload'
      });
    }
    next();
  });
});

// URL-encoded parsing
app.use(express.urlencoded({ 
  limit: '600mb', 
  extended: true,
  parameterLimit: 1000000 // Increase parameter limit for large payloads
}));

// Database connections
connectDB();
connectCloudinary();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 LMS Backend Server is running successfully",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    cors: {
      enabled: true,
      allowed_origins: corsOptions.origin
    }
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/chapter', chapterRouter);
app.use('/api/lecture', lectureRouter);
app.use('/api/video', videoRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/exec', execRouter);

// Manual CORS headers for all responses (additional safety)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie');
  next();
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      '/api/auth',
      '/api/user', 
      '/api/course',
      '/api/chapter',
      '/api/lecture',
      '/api/video',
      '/api/payment',
      '/api/exec'
    ]
  });
});

// Global 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Started on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log(`⏰ Timeout settings: ${server.timeout}ms`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Server timeout configuration for handling large file uploads
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 650000; // Keep alive timeout should be higher than server timeout
server.headersTimeout = 660000; // Headers timeout should be higher than keep alive timeout

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
