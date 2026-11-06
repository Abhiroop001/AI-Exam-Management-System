import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Exam, IExam } from '../models/Exam';
import { QRService } from '../services/qrService';
import { Submission } from '../models/Submission';
import { LiveSession } from '../models/LiveSession';

const generateExamCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'EX-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      res.status(401).json({ success: false, message: 'Teacher authentication required.' });
      return;
    }

    const {
      title,
      subject,
      description,
      durationMinutes,
      expiresAt,
      questions,
    } = req.body;

    if (!title || !subject || !durationMinutes || !expiresAt) {
      res.status(400).json({ success: false, message: 'Title, subject, duration, and expiration are required.' });
      return;
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ success: false, message: 'At least one question is required to create an exam.' });
      return;
    }

    // Generate unique exam code
    let code = generateExamCode();
    let exists = await Exam.findOne({ code });
    while (exists) {
      code = generateExamCode();
      exists = await Exam.findOne({ code });
    }

    // Infer studentBase from request body, origin, or referer
    const origin = (req.headers.origin || req.headers.referer || '') as string;
    let customStudentBase = (req.body.clientStudentUrl as string | undefined)?.trim();
    if (!customStudentBase) {
      if (origin.includes('vercel.app') || origin.includes('frontend-teacher')) {
        customStudentBase = 'https://frontend-student-nu.vercel.app';
      } else if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        customStudentBase = 'http://localhost:5174';
      }
    }

    // Generate QR code
    const { qrCodeDataUrl, examJoinUrl } = await QRService.generateExamQRCode(code, customStudentBase);

    // Calculate total marks
    const totalMarks = questions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 1), 0);

    const exam = await Exam.create({
      title: title.trim(),
      subject: subject.trim(),
      description: description ? description.trim() : '',
      teacherId,
      code,
      durationMinutes: Number(durationMinutes),
      expiresAt: new Date(expiresAt),
      qrCodeDataUrl,
      questions,
      totalMarks,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam,
      examJoinUrl,
    });
  } catch (error: any) {
    console.error('[Create Exam Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating exam.' });
  }
};

export const getTeacherExams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const exams = await Exam.find({ teacherId }).sort({ createdAt: -1 }).lean();

    // Enrich with submission count and live active students count
    const enriched = await Promise.all(
      exams.map(async (exam) => {
        const submissionCount = await Submission.countDocuments({ examId: exam._id });
        const activeTakers = await LiveSession.countDocuments({
          examId: exam._id,
          status: 'in_progress',
        });
        const isExpired = new Date(exam.expiresAt).getTime() < Date.now();

        return {
          ...exam,
          submissionCount,
          activeTakers,
          isExpired,
        };
      })
    );

    res.status(200).json({ success: true, exams: enriched });
  } catch (error) {
    console.error('[Get Teacher Exams Error]:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving exams.' });
  }
};

export const getExamById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id).lean();

    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    const isTeacher = req.user?.role === 'teacher' && exam.teacherId.toString() === req.user.id;

    if (!isTeacher) {
      // Check expiration
      if (new Date(exam.expiresAt).getTime() < Date.now()) {
        res.status(400).json({ success: false, message: 'This exam has expired.' });
        return;
      }

      // Sanitize questions for student: strip answers and remarks
      const sanitizedQuestions = exam.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        attachments: q.attachments,
      }));

      res.status(200).json({
        success: true,
        exam: {
          ...exam,
          questions: sanitizedQuestions,
        },
      });
      return;
    }

    // Teacher receives full exam
    res.status(200).json({ success: true, exam });
  } catch (error) {
    console.error('[Get Exam By Id Error]:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving exam.' });
  }
};

export const getExamByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const exam = await Exam.findOne({ code: code.toUpperCase().trim() }).lean();

    if (!exam) {
      res.status(404).json({ success: false, message: 'Invalid exam code. No test found.' });
      return;
    }

    const now = Date.now();
    const expiry = new Date(exam.expiresAt).getTime();
    if (expiry < now) {
      res.status(400).json({
        success: false,
        message: 'This test has expired. Submissions are no longer accepted.',
        expired: true,
      });
      return;
    }

    // Check if student has already submitted
    let alreadySubmitted = false;
    let existingSubmissionId = null;
    if (req.user?.id) {
      const existing = await Submission.findOne({
        examId: exam._id,
        studentId: req.user.id,
      });
      if (existing) {
        alreadySubmitted = true;
        existingSubmissionId = existing._id;
      }
    }

    // Sanitize questions for student
    const sanitizedQuestions = exam.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      attachments: q.attachments,
    }));

    res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        description: exam.description,
        code: exam.code,
        durationMinutes: exam.durationMinutes,
        expiresAt: exam.expiresAt,
        totalMarks: exam.totalMarks,
        questionsCount: exam.questions.length,
        questions: sanitizedQuestions,
      },
      alreadySubmitted,
      existingSubmissionId,
    });
  } catch (error) {
    console.error('[Get Exam By Code Error]:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving exam by code.' });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const teacherId = req.user?.id;

    const exam = await Exam.findOneAndDelete({ _id: id, teacherId });
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found or unauthorized.' });
      return;
    }

    // Clean up related submissions & live sessions
    await Submission.deleteMany({ examId: id });
    await LiveSession.deleteMany({ examId: id });

    res.status(200).json({ success: true, message: 'Exam deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting exam.' });
  }
};

