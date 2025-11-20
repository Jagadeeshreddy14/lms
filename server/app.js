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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Increase server timeout for file uploads
app.timeout = 600000;

// Logging
app.use(morgan('dev'));

// -------------------------
// FIXED CORS CONFIGURATION
// -------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://lms-indol-one.vercel.app',
       ' https://lms-indol-one.vercel.app/'
      ];

      // Allow all Vercel Preview deployments
      if (origin && origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow local development
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// Cookie parser
app.use(cookieParser());

// Body parser with conditional skip for file uploads
app.use((req, res, next) => {
  const fileUploadRoutes = [
    { path: '/api/lecture/', method: 'POST' },
    { path: '/api/course/', method: 'PATCH' },
    { path: '/api/user/profile/upload-avatar', method: 'POST' },
    { path: '/api/video/upload', method: 'POST' }
  ];

  const skip = fileUploadRoutes.some(
    route =>
      req.path.includes(route.path) &&
      req.method === route.method &&
      req.get('Content-Type')?.includes('multipart/form-data')
  );

  if (skip) {
    req.setTimeout(300000);
    res.setTimeout(300000);
    return next();
  }

  express.json({ limit: '600mb' })(req, res, next);
});

app.use((req, res, next) => {
  const fileUploadRoutes = [
    { path: '/api/lecture/', method: 'POST' },
    { path: '/api/course/', method: 'PATCH' },
    { path: '/api/user/profile/upload-avatar', method: 'POST' },
    { path: '/api/video/upload', method: 'POST' }
  ];

  const skip = fileUploadRoutes.some(
    route =>
      req.path.includes(route.path) &&
      req.method === route.method &&
      req.get('Content-Type')?.includes('multipart/form-data')
  );

  if (skip) {
    req.setTimeout(300000);
    res.setTimeout(300000);
    return next();
  }

  express.urlencoded({ limit: '600mb', extended: true })(req, res, next);
});

// DB + Cloudinary
connectDB();
connectCloudinary();

// Root route
app.get('/', (req, res) => {
  res.send('Hare Krishna');
});

// API Routes
app.use('/api/video', videoRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/chapter', chapterRouter);
app.use('/api/lecture', lectureRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/exec', execRouter);

// Start server
const server = app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});

// Server timeouts
server.timeout = 600000;
server.keepAliveTimeout = 650000;
server.headersTimeout = 660000;
