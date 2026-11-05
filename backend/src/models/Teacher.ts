import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  age: number;
  subject: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18 },
    subject: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);

