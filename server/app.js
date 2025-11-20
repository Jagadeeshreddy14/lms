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

const cors = require('cors');
// Allow requests only from your frontend during development:
app.use(cors({
  origin: 'http://localhost:5174',
  "https://lms-indol-one.vercel.app"
  credentials: true, // if you use cookies/sessions
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
