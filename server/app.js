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

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'https://lms-642sk3so5-jagadeeshreddy14s-projects.vercel.app', // Add this domain
    'https://lms-indol-one.vercel.app', 
    'https://advanced-lms.vercel.app',
    'http://localhost:3000', // For local development
    'http://localhost:5173'  // For Vite development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(cookieParser());

// Apply JSON and URL-encoded middleware first
app.use(express.json({ limit: '600mb' }));
app.use(express.urlencoded({ limit: '600mb', extended: true }));

// Timeout middleware for file uploads
app.use((req, res, next) => {
  if ((req.path.includes('/api/lecture/') && req.method === 'POST') || 
      (req.path.includes('/api/course/') && req.path.includes('/update') && req.method === 'PATCH') ||
      (req.path.includes('/api/user/profile/upload-avatar') && req.method === 'POST') ||
      (req.path.includes('/api/video/upload') && req.method === 'POST')) {
    if (req.get('Content-Type')?.includes('multipart/form-data')) {
      // Set longer timeout for file uploads
      req.setTimeout(300000); // 5 minutes
      res.setTimeout(300000); // 5 minutes
    }
  }
  next();
});

connectDB();
connectCloudinary();

app.get('/', (req, res) => {
    res.send("Jagdish - LMS Backend is running");
});

// Manual CORS headers as additional safety
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://lms-642sk3so5-jagadeeshreddy14s-projects.vercel.app',
    'https://lms-indol-one.vercel.app', 
    'https://advanced-lms.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// API Endpoints
app.use('/api/video', videoRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/chapter', chapterRouter);
app.use('/api/lecture', lectureRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/exec', execRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});

// Set server timeout for handling large file uploads
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 650000; // Keep alive timeout should be higher than server timeout
server.headersTimeout = 660000; // Headers timeout should be higher than keep alive timeout

export default app;
