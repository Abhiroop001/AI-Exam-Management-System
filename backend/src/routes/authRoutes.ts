import { Router } from 'express';
import {
  registerTeacher,
  loginTeacher,
  registerStudent,
  loginStudent,
  getCurrentUser,
} from '../controllers/authController';
import { authenticateAny } from '../middleware/auth';

const router = Router();

// Teacher auth
router.post('/teacher/register', registerTeacher);
router.post('/teacher/login', loginTeacher);

// Student auth
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);

// Profile
router.get('/me', authenticateAny, getCurrentUser);

export default router;

