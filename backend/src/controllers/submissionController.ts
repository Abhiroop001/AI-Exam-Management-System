import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Exam } from '../models/Exam';
import { Submission } from '../models/Submission';
import { LiveSession } from '../models/LiveSession';
import { Student } from '../models/Student';
import { AIAnalysisEngine } from '../services/aiAnalysisEngine';

export const submitExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ success: false, message: 'Student authentication required.' });
      return;
    }

    const { examId, answers, timeSpentSeconds } = req.body;

    if (!examId || !answers || !Array.isArray(answers)) {
      res.status(400).json({ success: false, message: 'Exam ID and answers array are required.' });
      return;
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    // Check expiration with 2-minute grace period for network latency
    const gracePeriodMs = 2 * 60 * 1000;
    if (new Date(exam.expiresAt).getTime() + gracePeriodMs < Date.now()) {
      res.status(400).json({ success: false, message: 'Exam deadline has expired.' });
      return;
    }

    // Check if already submitted
    let submission = await Submission.findOne({ examId, studentId });
    if (submission) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted this exam.',
        submissionId: submission._id,
      });
      return;
    }

    // Format initial answers
    const formattedAnswers = answers.map((a: any) => ({
      questionId: a.questionId,
      selectedOptions: a.selectedOptions || [],
      textAnswer: a.textAnswer || '',
      scoreAwarded: 0,
      maxScore: 0,
    }));

    submission = await Submission.create({
      examId,
      studentId,
      answers: formattedAnswers,
      submittedAt: new Date(),
      analysisStatus: 'analyzing',
      analysisStartedAt: new Date(),
      timeSpentSeconds: timeSpentSeconds || 0,
    });

    // Update live session status
    await LiveSession.findOneAndUpdate(
      { examId, studentId },
      { status: 'submitted', lastPing: new Date() }
    );

    // Trigger AI analysis pipeline asynchronously
    setImmediate(async () => {
      try {
        await AIAnalysisEngine.processSubmission(submission!._id.toString());
      } catch (err) {
        console.error('[Async AI Analysis Error]:', err);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully! AI analysis pipeline initialized.',
      submissionId: submission._id,
      analysisDurationMinutes: 5,
    });
  } catch (error: any) {
    console.error('[Submit Exam Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error submitting exam.' });
  }
};

export const getSubmissionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId).lean();

    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      submissionId: submission._id,
      analysisStatus: submission.analysisStatus,
      analysisStartedAt: submission.analysisStartedAt,
      analysisCompletedAt: submission.analysisCompletedAt,
      percentage: submission.percentage,
      totalScore: submission.totalScore,
      maxScore: submission.maxScore,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving status.' });
  }
};

export const getStudentReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user?.id;

    const submission = await Submission.findById(submissionId).lean();
    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission record not found.' });
      return;
    }

    // Verify student ownership or teacher access
    if (req.user?.role === 'student' && submission.studentId.toString() !== studentId) {
      res.status(403).json({ success: false, message: 'Unauthorized access to this report.' });
      return;
    }

    const exam = await Exam.findById(submission.examId).lean();
    const student = await Student.findById(submission.studentId).select('-password').lean();

    res.status(200).json({
      success: true,
      submission,
      exam,
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving student report.' });
  }
};

export const getTeacherExamSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const teacherId = req.user?.id;

    // Verify teacher owns this exam
    const exam = await Exam.findOne({ _id: examId, teacherId }).lean();
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found or unauthorized.' });
      return;
    }

    const submissions = await Submission.find({ examId })
      .populate('studentId', 'name email className rollNumber phone')
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      exam,
      submissions,
    });
  } catch (error) {
    console.error('[Get Teacher Exam Submissions Error]:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving submissions.' });
  }
};

// ================= LIVE EXAM MONITORING =================

export const pingLiveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { examId } = req.body;

    if (!studentId || !examId) {
      res.status(400).json({ success: false, message: 'Missing examId.' });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    await LiveSession.findOneAndUpdate(
      { examId, studentId },
      {
        studentName: student.name,
        studentEmail: student.email,
        className: student.className,
        status: 'in_progress',
        lastPing: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Live heartbeat recorded.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error recording live session.' });
  }
};

export const getLiveExamTakers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;

    // Active within last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const activeSessions = await LiveSession.find({
      examId,
      status: 'in_progress',
      lastPing: { $gte: twoMinutesAgo },
    }).lean();

    const submittedCount = await Submission.countDocuments({ examId });

    res.status(200).json({
      success: true,
      activeCount: activeSessions.length,
      activeStudents: activeSessions,
      submittedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting live test takers.' });
  }
};

