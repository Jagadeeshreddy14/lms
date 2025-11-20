import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleaare.js';
import { upload } from '../config/multer.js';
import {
  createLecture,
  getLecturesByChapter,
  getLecturesByCourse,
  getLectureById,
  deleteLecture,
  reorderLectures,
  getLectureWithAccess
} from '../controllers/lecture.controllers.js';

const lectureRouter = express.Router();

// Public routes
lectureRouter.get('/chapter/:chapterId', getLecturesByChapter); 
lectureRouter.get('/course/:courseId', getLecturesByCourse); 
lectureRouter.get('/:lectureId', getLectureById); 

// Protected routes for accessing lecture content (requires enrollment)
lectureRouter.get('/access/:lectureId', authenticate, getLectureWithAccess);

// Protected routes (educators only)
lectureRouter.post('/:courseId/:chapterId', authenticate, authorize('educator'), upload.single('video'), createLecture); 
lectureRouter.delete('/:lectureId', authenticate, authorize('educator'), deleteLecture); 
lectureRouter.put('/reorder/:chapterId', authenticate, authorize('educator'), reorderLectures); 

export default lectureRouter;
