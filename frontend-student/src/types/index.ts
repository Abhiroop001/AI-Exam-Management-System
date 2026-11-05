export interface StudentUser {
  id: string;
  name: string;
  email: string;
  className: string;
  age: number;
  phone: string;
  rollNumber?: string;
  role: 'student';
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
  marks: number;
  negativeMarks?: number;
  remarks?: string;
  attachments?: Attachment[];
}

export interface Exam {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  code: string;
  durationMinutes: number;
  expiresAt: string;
  totalMarks: number;
  questionsCount?: number;
  questions: Question[];
}

export interface StudentSubmissionAnswer {
  questionId: string;
  selectedOptions?: string[];
  textAnswer?: string;
  scoreAwarded?: number;
  maxScore?: number;
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

export interface Submission {
  _id: string;
  examId: string;
  studentId: string;
  answers: StudentSubmissionAnswer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  analysisStatus: 'analyzing' | 'completed';
  analysisStartedAt?: string;
  analysisCompletedAt?: string;
  studentReport?: StudentReport;
  timeSpentSeconds?: number;
}
