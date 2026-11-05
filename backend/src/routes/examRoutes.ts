import { Router } from 'express';
import {
  createExam,
  getTeacherExams,
  getExamById,
  getExamByCode,
  deleteExam,
} from '../controllers/examController';
import { authenticateTeacher, authenticateAny } from '../middleware/auth';

const router = Router();

// Teacher routes
router.post('/', authenticateTeacher, createExam);
router.get('/teacher', authenticateTeacher, getTeacherExams);
router.delete('/:id', authenticateTeacher, deleteExam);

// Joint / Student accessible
router.get('/code/:code', authenticateAny, getExamByCode);
router.get('/:id', authenticateAny, getExamById);

export default router;

