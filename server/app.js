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

// 1. CORS MIDDLEWARE - PUT THIS FIRST
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
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 2. CORS PACKAGE AS BACKUP
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for now to fix the issue
    callback(null, true);
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(cookieParser());

// 3. BODY PARSING MIDDLEWARE
app.use(express.json({ limit: '600mb' }));
app.use(express.urlencoded({ limit: '600mb', extended: true }));

// 4. MANUAL CORS FOR ALL RESPONSES
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

connectDB();
connectCloudinary();

// Routes
app.get('/', (req, res) => {
  res.json({ message: "LMS Backend is running with CORS fixed" });
});

app.use('/api/video', videoRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/chapter', chapterRouter);
app.use('/api/lecture', lectureRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/exec', execRouter);

// Global CORS handler for all routes
app.use('*', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

const server = app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT} with CORS fixed`);
});

server.timeout = 600000;
