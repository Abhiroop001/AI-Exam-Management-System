import { Router } from 'express';
import {
  submitExam,
  getSubmissionStatus,
  getStudentReport,
  getTeacherExamSubmissions,
  pingLiveSession,
  getLiveExamTakers,
} from '../controllers/submissionController';
import { authenticateStudent, authenticateTeacher, authenticateAny } from '../middleware/auth';

const router = Router();

// Student submission & heartbeat
router.post('/submit', authenticateStudent, submitExam);
router.post('/heartbeat', authenticateStudent, pingLiveSession);
router.get('/status/:submissionId', authenticateAny, getSubmissionStatus);
router.get('/report/:submissionId', authenticateAny, getStudentReport);
router.get('/teacher-report/:submissionId', authenticateTeacher, getStudentReport);

// Teacher live monitoring & submissions
router.get('/live/:examId', authenticateTeacher, getLiveExamTakers);
router.get('/exam/:examId', authenticateTeacher, getTeacherExamSubmissions);

export default router;

