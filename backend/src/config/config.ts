import dotenv from 'dotenv';
import path from 'path';

// Load from both backend and root directories
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/exam_management',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_exam_mgmt_jwt_token_2026_modern_ai_key',
  groqApiKey: process.env.GROQ_API_KEY || '',
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  clientTeacherUrl: process.env.CLIENT_TEACHER_URL || 'http://localhost:5173',
  clientStudentUrl: process.env.CLIENT_STUDENT_URL || 'http://localhost:5174',
  nodeEnv: process.env.NODE_ENV || 'development',
};
