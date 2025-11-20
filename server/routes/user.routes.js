import { 
  getUserData, 
  updateUserData,
  uploadProfilePicture,
  userEnrollCourse, 
  userPurchaseCourse, 
  updateUserCourseProgress, 
  getUserCourseProgress, 
  userRating,
  checkCoursePurchase,
  getEnrolledCourses,
  getUserStats,
  getAllStudentsAndEducators
} from "../controllers/user.controllers.js";
import { getCourseCertificate } from "../controllers/user.controllers.js";
import express from 'express';
import { authenticate, authorize } from "../middleware/authMiddleaare.js";
import { upload } from "../config/multer.js";

const userRouter = express.Router();

// User profile routes
userRouter.get('/profile', authenticate, getUserData); 
userRouter.put('/profile', authenticate, updateUserData);
userRouter.post('/profile/upload-avatar', authenticate, upload.single('avatar'), uploadProfilePicture); 

// Get enrolled courses with progress
userRouter.get('/enrolled-courses', authenticate, authorize('student', 'educator'), getEnrolledCourses);

// Get user stats
userRouter.get('/stats', authenticate, authorize('student', 'educator'), getUserStats);

// Course enrollment routes (students only)
// userRouter.post('/enroll/:courseId', authenticate, authorize('student'), userEnrollCourse);
userRouter.post('/purchase/:courseId', authenticate, authorize('student','educator'), userPurchaseCourse);

// Check purchase status
userRouter.get('/purchase-status/:courseId', authenticate, checkCoursePurchase);

// Course progress routes (students only)
userRouter.put('/progress/:courseId', authenticate, authorize('student','educator'), updateUserCourseProgress);
userRouter.get('/progress/:courseId', authenticate, authorize('student','educator'), getUserCourseProgress);

// Course rating routes (students only)
userRouter.post('/rating/:courseId', authenticate, authorize('student','educator'), userRating);

// Certificate download (requires 100% progress)
userRouter.get('/certificate/:courseId', authenticate, authorize('student','educator'), getCourseCertificate);

// Get All Students and Educators
userRouter.get('/all-students-and-educators', authenticate, authorize('student','educator'), getAllStudentsAndEducators);

export default userRouter;




