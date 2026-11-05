export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  subject: string;
  age: number;
  phone: string;
  role: 'teacher';
}

export interface Attachment {
  originalName: string;
  filename: string;
  fileType: 'image' | 'pdf' | 'excel' | 'code' | 'other';
  url: string;
  size: number;
  codeLanguage?: string;
}

export interface Question {
  id: string;
  questionText: string;
  type: 'single_mcq' | 'multi_mcq' | 'long_answer';
  options: string[];
  correctAnswers: string[];
  idealAnswer?: string;
  remarks: string;
  marks: number;
  negativeMarks?: number;
  attachments?: Attachment[];
}

export interface Exam {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  teacherId: string;
  code: string;
  durationMinutes: number;
  expiresAt: string;
  startTime?: string;
  qrCodeDataUrl: string;
  questions: Question[];
  totalMarks: number;
  status: 'active' | 'draft' | 'expired';
  submissionCount?: number;
  activeTakers?: number;
  isExpired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisionAnalysis {
  caption: string;
  imageQualityScore: number;
  clarityAssessment: 'Crystal Clear' | 'Good' | 'Fair - Recommend Higher Contrast' | 'Blurry';
  enhancementSuggestions: string[];
  diagramDetails?: string;
  superResolutionApplied?: boolean;
  enhancedImageUrl?: string;
}

export interface CodeAnalysis {
  language: string;
  syntaxValid: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  vulnerabilities: string[];
  optimizationSuggestions: string[];
  scoreOutOf10: number;
}

export interface StudentSubmissionAnswer {
  questionId: string;
  selectedOptions?: string[];
  textAnswer?: string;
  scoreAwarded: number;
  maxScore: number;
  aiEvaluation?: {
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    scoreRationale: string;
    accuracyPercentage: number;
  };
}

export interface StudentReport {
  overallSummary: string;
  performanceTier: 'Mastery' | 'Proficient' | 'Developing' | 'Needs Attention';
  strengths: string[];
  areasForImprovement: string[];
  personalizedLearningPlan: string[];
  recommendedTopics: string[];
  conceptBreakdown: {
    topic: string;
    masteryPercentage: number;
    status: 'High' | 'Medium' | 'Low';
  }[];
}

export interface TeacherReport {
  overallSummary: string;
  studentMasteryRating: string;
  strengthsObserved: string[];
  misconceptionsIdentified: string[];
  longAnswerQualityScore: number;
  teacherActionItems: string[];
  integrityConfidenceScore: number;
}

export interface Submission {
  _id: string;
  examId: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    className: string;
    rollNumber?: string;
    phone?: string;
  };
  answers: StudentSubmissionAnswer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  analysisStatus: 'analyzing' | 'completed';
  analysisStartedAt?: string;
  analysisCompletedAt?: string;
  studentReport?: StudentReport;
  teacherReport?: TeacherReport;
  timeSpentSeconds?: number;
}

export interface LiveStudentSession {
  _id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  className?: string;
  status: 'in_progress' | 'submitted';
  joinedAt: string;
  lastPing: string;
}

