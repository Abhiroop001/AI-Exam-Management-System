import mongoose, { Document, Schema } from 'mongoose';

export interface ILiveSession extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  className?: string;
  status: 'in_progress' | 'submitted';
  joinedAt: Date;
  lastPing: Date;
}

const LiveSessionSchema = new Schema<ILiveSession>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    className: { type: String, default: '' },
    status: {
      type: String,
      enum: ['in_progress', 'submitted'],
      default: 'in_progress',
    },
    joinedAt: { type: Date, default: Date.now },
    lastPing: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-expire sessions older than 3 hours if student leaves abruptly
LiveSessionSchema.index({ lastPing: 1 }, { expireAfterSeconds: 10800 });

export const LiveSession = mongoose.model<ILiveSession>('LiveSession', LiveSessionSchema);

