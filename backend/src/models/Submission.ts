import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentAnswer {
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

export interface IStudentReport {
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

export interface ITeacherReport {
  overallSummary: string;
  studentMasteryRating: string;
  strengthsObserved: string[];
  misconceptionsIdentified: string[];
  longAnswerQualityScore: number;
  teacherActionItems: string[];
  integrityConfidenceScore: number;
}

export interface ISubmission extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IStudentAnswer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  submittedAt: Date;
  analysisStatus: 'analyzing' | 'completed';
  analysisStartedAt?: Date;
  analysisCompletedAt?: Date;
  studentReport?: IStudentReport;
  teacherReport?: ITeacherReport;
  timeSpentSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentAnswerSchema = new Schema<IStudentAnswer>({
  questionId: { type: String, required: true },
  selectedOptions: [{ type: String }],
  textAnswer: { type: String, default: '' },
  scoreAwarded: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  aiEvaluation: {
    feedback: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    scoreRationale: { type: String, default: '' },
    accuracyPercentage: { type: Number, default: 0 },
  },
});

const SubmissionSchema = new Schema<ISubmission>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    answers: [StudentAnswerSchema],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    analysisStatus: {
      type: String,
      enum: ['analyzing', 'completed'],
      default: 'analyzing',
    },
    analysisStartedAt: { type: Date, default: Date.now },
    analysisCompletedAt: { type: Date },
    studentReport: {
      overallSummary: { type: String, default: '' },
      performanceTier: { type: String, default: 'Developing' },
      strengths: [{ type: String }],
      areasForImprovement: [{ type: String }],
      personalizedLearningPlan: [{ type: String }],
      recommendedTopics: [{ type: String }],
      conceptBreakdown: [
        {
          topic: { type: String },
          masteryPercentage: { type: Number },
          status: { type: String },
        },
      ],
    },
    teacherReport: {
      overallSummary: { type: String, default: '' },
      studentMasteryRating: { type: String, default: '' },
      strengthsObserved: [{ type: String }],
      misconceptionsIdentified: [{ type: String }],
      longAnswerQualityScore: { type: Number, default: 0 },
      teacherActionItems: [{ type: String }],
      integrityConfidenceScore: { type: Number, default: 100 },
    },
    timeSpentSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);

