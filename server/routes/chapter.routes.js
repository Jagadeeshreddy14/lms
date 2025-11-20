import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleaare.js';
import {
  createChapter,
  getChaptersByCourse,
  getChapterById,
  deleteChapter
} from '../controllers/chapter.controllers.js';

const chapterRouter = express.Router();

// Public routes
chapterRouter.get('/course/:courseId', getChaptersByCourse); 
chapterRouter.get('/:chapterId', getChapterById); 

// Protected routes (educators only)
chapterRouter.post('/:courseId', authenticate, authorize('educator'), createChapter); 
chapterRouter.delete('/:chapterId', authenticate, authorize('educator'), deleteChapter); 

export default chapterRouter;
