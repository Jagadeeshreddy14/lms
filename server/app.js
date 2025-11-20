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

// --------- CORS CONFIGURATION ---------
const allowedOrigins = [
  'https://lms-indol-one.vercel.app',
  'https://advanced-lms.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all Vercel preview deployments
      if (origin && origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      // Allow explicit whitelisted domains and local development (no Origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browsers
  })
);

// Handle preflight across all routes
app.options('*', cors({
  origin: (origin, callback) => {
    if (origin && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// --------------------------------------

// Cookie parser
app.use(cookieParser());

// Body parser, skipping for file uploads
const fileUploadRoutes = [
  { path: '/api/lecture/', method: 'POST' },
  { path: '/api/course/', method: 'PATCH' },
  { path: '/api/user/profile/upload-avatar', method: 'POST' },
  { path: '/api/video/upload', method: 'POST' }
];

app.use((req, res, next) => {
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

// --------- ERROR HANDLER (CORS HEADERS ENSURED) ----------
app.use((err, req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
// ---------------------------------------------------------

// Start server
const server = app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});

server.timeout = 600000;
server.keepAliveTimeout = 650000;
server.headersTimeout = 660000;
