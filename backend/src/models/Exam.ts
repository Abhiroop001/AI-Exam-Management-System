import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
  originalName: string;
  filename: string;
  fileType: 'image' | 'pdf' | 'excel' | 'code' | 'other';
  url: string;
  size: number;
  codeLanguage?: string;
  content?: string;
}

export interface IQuestion {
  _id?: string;
  id: string;
  questionText: string;
  type: 'single_mcq' | 'multi_mcq' | 'long_answer';
  options: string[];
  correctAnswers: string[]; // Options or text values
  idealAnswer?: string; // For long answers
  remarks: string; // Teacher's explanation & remarks
  marks: number;
  negativeMarks?: number;
  attachments?: IAttachment[];
}

export interface IExam extends Document {
  title: string;
  subject: string;
  description?: string;
  teacherId: mongoose.Types.ObjectId;
  code: string;
  durationMinutes: number;
  expiresAt: Date;
  startTime?: Date;
  qrCodeDataUrl: string;
  questions: IQuestion[];
  totalMarks: number;
  status: 'active' | 'draft' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  fileType: { 
    type: String, 
    enum: ['image', 'pdf', 'excel', 'code', 'other'], 
    default: 'other' 
  },
  url: { type: String, required: true },
  size: { type: Number, default: 0 },
  codeLanguage: { type: String },
  content: { type: String },
});

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  questionText: { type: String, required: true },
  type: {
    type: String,
    enum: ['single_mcq', 'multi_mcq', 'long_answer'],
    required: true,
  },
  options: [{ type: String }],
  correctAnswers: [{ type: String }],
  idealAnswer: { type: String, default: '' },
  remarks: { type: String, default: '' },
  marks: { type: Number, required: true, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  attachments: [AttachmentSchema],
});

const ExamSchema = new Schema<IExam>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    expiresAt: { type: Date, required: true },
    startTime: { type: Date, default: Date.now },
    qrCodeDataUrl: { type: String, default: '' },
    questions: [QuestionSchema],
    totalMarks: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'draft', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);

