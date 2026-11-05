import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/config';
import { connectDB } from './config/db';

// Route imports
import authRoutes from './routes/authRoutes';
import examRoutes from './routes/examRoutes';
import submissionRoutes from './routes/submissionRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();
const server = http.createServer(app);

// Socket.io for live exam monitoring
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  // Join a specific exam monitoring room
  socket.on('join_exam_room', (examId: string) => {
    socket.join(`exam_${examId}`);
  });

  socket.on('leave_exam_room', (examId: string) => {
    socket.leave(`exam_${examId}`);
  });

  // Student active test heartbeat broadcast
  socket.on('student_exam_ping', (data: { examId: string; studentName: string }) => {
    io.to(`exam_${data.examId}`).emit('exam_active_ping', data);
  });
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    models: {
      groqConfigured: !!config.groqApiKey,
      huggingFaceConfigured: !!config.huggingFaceApiKey,
    },
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  server.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 Exam Management Backend running on PORT: ${config.port}`);
    console.log(`🌐 Teacher Frontend URL: ${config.clientTeacherUrl}`);
    console.log(`🌐 Student Frontend URL: ${config.clientStudentUrl}`);
    console.log(`🤖 Groq Key: ${config.groqApiKey ? 'Configured' : 'Missing (Local Heuristics Active)'}`);
    console.log(`🤗 Hugging Face Key: ${config.huggingFaceApiKey ? 'Configured' : 'Missing (Local Heuristics Active)'}`);
    console.log(`====================================================`);
  });
};

startServer();

export { app, server, io };

