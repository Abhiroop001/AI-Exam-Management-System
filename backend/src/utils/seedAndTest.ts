import { connectDB } from '../config/db';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { Exam } from '../models/Exam';
import { Submission } from '../models/Submission';
import { QRService } from '../services/qrService';
import { AIAnalysisEngine } from '../services/aiAnalysisEngine';
import bcrypt from 'bcryptjs';

async function run() {
  await connectDB();
  console.log('--- Initializing Verification & Seed ---');

  // 1. Create or Find Demo Teacher
  const teacherEmail = 'prof.alan@university.edu';
  let teacher = await Teacher.findOne({ email: teacherEmail });
  if (!teacher) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('teacher1234', salt);
    teacher = await Teacher.create({
      name: 'Prof. Alan Turing',
      age: 42,
      subject: 'Computer Science & AI',
      email: teacherEmail,
      phone: '+1 (555) 902-1849',
      password: hashedPassword,
    });
    console.log('Demo Teacher Created:', teacher.email);
  } else {
    console.log('Demo Teacher Exists:', teacher.email);
  }

  // 2. Create or Find Demo Student
  const studentEmail = 'emma.watson@student.edu';
  let student = await Student.findOne({ email: studentEmail });
  if (!student) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student1234', salt);
    student = await Student.create({
      name: 'Emma Watson',
      age: 20,
      className: 'CS Advanced Batch A',
      email: studentEmail,
      phone: '+1 (555) 302-8812',
      password: hashedPassword,
      rollNumber: 'CS-2026-042',
    });
    console.log('Demo Student Created:', student.email);
  } else {
    console.log('Demo Student Exists:', student.email);
  }

  // 3. Create or Check Demo Exam
  const examCode = 'EX-AI2026';
  let exam = await Exam.findOne({ code: examCode });
  if (!exam) {
    const { qrCodeDataUrl } = await QRService.generateExamQRCode(examCode);

    const questions = [
      {
        id: 'q-demo-1',
        questionText: 'What is the time complexity of searching an element in an unsorted array of size N?',
        type: 'single_mcq',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctAnswers: ['O(N)'],
        remarks: 'In an unsorted array, we may need to examine each of the N elements linearly in the worst case.',
        marks: 2,
        negativeMarks: 0.5,
      },
      {
        id: 'q-demo-2',
        questionText: 'Which of the following are valid examples of non-linear data structures?',
        type: 'multi_mcq',
        options: ['Binary Tree', 'Linked List', 'Graph', 'Array'],
        correctAnswers: ['Binary Tree', 'Graph'],
        remarks: 'Trees and graphs are hierarchical and multi-directional non-linear data structures, unlike linear arrays and lists.',
        marks: 3,
        negativeMarks: 0,
      },
      {
        id: 'q-demo-3',
        questionText: 'Explain the working of Breadth-First Search (BFS) on an unweighted graph and discuss its queuing strategy.',
        type: 'long_answer',
        options: [],
        correctAnswers: [],
        idealAnswer: 'BFS explores graph vertices level by level using a FIFO queue. Starting from a source node, it marks it visited and enqueues it. In each iteration, it dequeues a vertex, inspects all unvisited adjacent neighbors, marks them visited, and enqueues them. This level-by-level traversal guarantees finding the shortest path in unweighted graphs.',
        remarks: 'The student must clearly mention level-by-level traversal, FIFO queue mechanics, visited set prevention of cycles, and shortest-path optimality.',
        marks: 5,
        negativeMarks: 0,
      },
    ];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);

    exam = await Exam.create({
      title: 'Advanced Data Structures & Algorithms Benchmark',
      subject: 'Computer Science',
      description: 'Comprehensive test covering computational complexities, non-linear structures, and graph traversal paradigms.',
      teacherId: teacher._id,
      code: examCode,
      durationMinutes: 45,
      expiresAt: tomorrow,
      qrCodeDataUrl,
      questions,
      totalMarks: 10,
      status: 'active',
    });

    console.log(`Demo Exam Created with Code: ${exam.code}, Title: "${exam.title}"`);
  } else {
    console.log(`Demo Exam Exists: ${exam.code}`);
  }

  // 4. Test Submission & AI Engine
  let submission = await Submission.findOne({ examId: exam._id, studentId: student._id });
  if (!submission) {
    const studentAnswers = [
      {
        questionId: 'q-demo-1',
        selectedOptions: ['O(N)'],
        scoreAwarded: 0,
        maxScore: 2,
      },
      {
        questionId: 'q-demo-2',
        selectedOptions: ['Binary Tree', 'Graph'],
        scoreAwarded: 0,
        maxScore: 3,
      },
      {
        questionId: 'q-demo-3',
        textAnswer: 'Breadth-First Search traverses a graph level by level starting from a source node. It uses a First-In-First-Out queue to store visited vertices and examines all immediate neighbor nodes before moving deeper into the graph. This FIFO approach ensures that the shortest distance to any vertex in unweighted graphs is discovered first.',
        scoreAwarded: 0,
        maxScore: 5,
      },
    ];

    submission = await Submission.create({
      examId: exam._id,
      studentId: student._id,
      answers: studentAnswers,
      submittedAt: new Date(),
      analysisStatus: 'analyzing',
      timeSpentSeconds: 420,
    });

    console.log('Testing AI Analysis Engine on submission...');
    const evaluated = await AIAnalysisEngine.processSubmission(submission._id.toString());
    console.log('AI Analysis Finished Successfully! Total Score:', evaluated?.totalScore, '/', evaluated?.maxScore);
    console.log('Student Report Tier:', evaluated?.studentReport?.performanceTier);
    console.log('Teacher Report Rating:', evaluated?.teacherReport?.studentMasteryRating);
  } else {
    console.log('Demo Submission already exists. Score:', submission.totalScore, '/', submission.maxScore);
  }

  console.log('--- Verification Complete: System is Fully Operational ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

