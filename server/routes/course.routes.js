import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleaare.js';
import { upload } from '../config/multer.js';
import {
  createCourse,
  getAllCourses,
  deleteCourse,
  getCourseEducator,
  getCourseById,
  togglePublishCourse,
  enrollInCourse,
  checkPurchaseStatus,
  updateCourse,
  searchCourses,
  getEducatorAnalytics
} from '../controllers/course.controllers.js';

const courseRouter = express.Router();

// Public routes (no authentication required)
courseRouter.get('/all', getAllCourses); 
courseRouter.get('/search', searchCourses);

// Protected routes (authentication required)
courseRouter.post('/create', authenticate, authorize('educator'), createCourse); 
courseRouter.get('/my-courses', authenticate, authorize('educator'), getCourseEducator);
courseRouter.get('/analytics', authenticate, authorize('educator'), getEducatorAnalytics); 

// Routes with courseId parameter - more specific routes first
courseRouter.patch('/:courseId/update', authenticate, authorize('educator'), upload.single('thumbnail'), updateCourse);
courseRouter.patch('/:courseId/toggle-publish', authenticate, authorize('educator'), togglePublishCourse);
courseRouter.post('/enroll/:courseId', authenticate, enrollInCourse);
courseRouter.get('/:courseId/purchase-status', authenticate, checkPurchaseStatus);
courseRouter.delete('/:courseId', authenticate, authorize('educator'), deleteCourse);

// Generic courseId route - must come last
courseRouter.get('/:courseId', getCourseById); 

export default courseRouter;