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

// Increase server timeout for file uploads
app.timeout = 600000; // 10 minutes

app.use(morgan('dev'));

// CORS configuration
app.use(cors({
  origin: [
    'https://lms-indol-one.vercel.app', 
    
  ],
  credentials: true
}));

app.use(cookieParser());

// Conditional middleware - skip body parsing for file upload routes
app.use((req, res, next) => {
  
  if ((req.path.includes('/api/lecture/') && req.method === 'POST') || 
      (req.path.includes('/api/course/') && req.path.includes('/update') && req.method === 'PATCH') ||
      (req.path.includes('/api/user/profile/upload-avatar') && req.method === 'POST') ||
      (req.path.includes('/api/video/upload') && req.method === 'POST')) {
    if (req.get('Content-Type')?.includes('multipart/form-data')) {
      // Set longer timeout for file uploads
      req.setTimeout(300000); // 5 minutes
      res.setTimeout(300000); // 5 minutes
      return next();
    }
  }
  
  express.json({ limit: '600mb' })(req, res, next);
});

app.use((req, res, next) => {
  if ((req.path.includes('/api/lecture/') && req.method === 'POST') || 
      (req.path.includes('/api/course/') && req.path.includes('/update') && req.method === 'PATCH') ||
      (req.path.includes('/api/user/profile/upload-avatar') && req.method === 'POST') ||
      (req.path.includes('/api/video/upload') && req.method === 'POST')) {
    if (req.get('Content-Type')?.includes('multipart/form-data')) {
      // Set longer timeout for file uploads
      req.setTimeout(300000); // 5 minutes
      res.setTimeout(300000); // 5 minutes
      return next();
    }
  }
  
  express.urlencoded({ limit: '600mb', extended: true })(req, res, next);
});

connectDB();
connectCloudinary();

app.get('/', (req, res) => {
    res.send("Hare Krishna");
});

// all API Endpoints
app.use('/api/video',videoRouter);

app.use('/api/auth',authRouter);

app.use('/api/user', userRouter);

app.use('/api/course',courseRouter);

app.use('/api/chapter', chapterRouter);

app.use('/api/lecture', lectureRouter);

app.use('/api/payment',paymentRouter);
app.use('/api/exec', execRouter);

const server = app.listen(PORT,()=>{
    console.log("Server Started on port", PORT);
});

// Set server timeout for handling large file uploads
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 650000; // Keep alive timeout should be higher than server timeout
server.headersTimeout = 660000; // Headers timeout should be higher than keep alive timeout
