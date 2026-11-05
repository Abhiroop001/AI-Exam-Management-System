import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  age: number;
  className: string;
  email: string;
  phone: string;
  password: string;
  rollNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 5 },
    className: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    rollNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', StudentSchema);

