import mongoose, { Document, Schema } from 'mongoose';

export interface IFileAsset extends Document {
  filename: string;
  originalName: string;
  fileType: 'image' | 'pdf' | 'excel' | 'code' | 'other';
  mimeType: string;
  size: number;
  codeLanguage?: string;
  content?: string; // Text / source code content for code and text files
  dataBase64?: string; // Base64 data for binary files, images, PDFs
  createdAt: Date;
  updatedAt: Date;
}

const FileAssetSchema = new Schema<IFileAsset>(
  {
    filename: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'excel', 'code', 'other'],
      default: 'other',
    },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    codeLanguage: { type: String },
    content: { type: String },
    dataBase64: { type: String },
  },
  {
    timestamps: true,
  }
);

export const FileAsset = mongoose.model<IFileAsset>('FileAsset', FileAssetSchema);
