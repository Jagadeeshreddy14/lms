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
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Allow current file path ---------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB + Cloud
connectDB();
connectCloudinary();

// Logs
app.use(morgan('dev'));

// ----------- Correct CORS -------------
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://lms-indol-one.vercel.app",
  credentials: true
}));

app.use(cookieParser());

// ----------- Body Parsers -------------
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

// ---------- Test Route ----------
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: "Backend Connected 🔥" });
});

// ---------- Home Route ----------
app.get("/", (req, res) => {
  res.send("Jagadish 🎉 Backend Running");
});

// ---------- API Routes ----------
app.use('/api/video', videoRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/chapter', chapterRouter);
app.use('/api/lecture', lectureRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/exec', execRouter);

// ---------- Serve Frontend Build (After Deployment) ----------
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ---------- Start Server ----------
const server = app.listen(PORT, () => {
  console.log(`🚀 Server Started on PORT ${PORT}`);
});

// Larger Upload Timeout
server.timeout = 600000;
server.keepAliveTimeout = 650000;
server.headersTimeout = 660000;
