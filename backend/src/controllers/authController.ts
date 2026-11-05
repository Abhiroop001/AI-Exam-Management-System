import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { config } from '../config/config';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string, role: 'teacher' | 'student'): string => {
  return jwt.sign({ id, role }, config.jwtSecret, { expiresIn: '7d' });
};

// ================= TEACHER AUTH =================

export const registerTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, subject, email, phone, password, confirmPassword } = req.body;

    if (!name || !age || !subject || !email || !phone || !password) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const existing = await Teacher.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'A teacher account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await Teacher.create({
      name: name.trim(),
      age: Number(age),
      subject: subject.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
    });

    const token = generateToken(teacher._id.toString(), 'teacher');

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        role: 'teacher',
        age: teacher.age,
        phone: teacher.phone,
      },
    });
  } catch (error: any) {
    console.error('[Register Teacher Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error registering teacher.' });
  }
};

export const loginTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() });
    if (!teacher) {
      res.status(400).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(teacher._id.toString(), 'teacher');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        role: 'teacher',
        age: teacher.age,
        phone: teacher.phone,
      },
    });
  } catch (error: any) {
    console.error('[Login Teacher Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ================= STUDENT AUTH =================

export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, className, email, phone, password, confirmPassword, rollNumber } = req.body;

    if (!name || !age || !className || !email || !phone || !password) {
      res.status(400).json({ success: false, message: 'All required fields must be filled.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const existing = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'A student account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      name: name.trim(),
      age: Number(age),
      className: className.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      rollNumber: rollNumber ? rollNumber.trim() : undefined,
    });

    const token = generateToken(student._id.toString(), 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        className: student.className,
        role: 'student',
        age: student.age,
        phone: student.phone,
        rollNumber: student.rollNumber,
      },
    });
  } catch (error: any) {
    console.error('[Register Student Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error registering student.' });
  }
};

export const loginStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    if (!student) {
      res.status(400).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(student._id.toString(), 'student');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        className: student.className,
        role: 'student',
        age: student.age,
        phone: student.phone,
        rollNumber: student.rollNumber,
      },
    });
  } catch (error: any) {
    console.error('[Login Student Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findById(req.user.id).select('-password');
      res.status(200).json({ success: true, user: { ...teacher?.toObject(), role: 'teacher' } });
    } else {
      const student = await Student.findById(req.user.id).select('-password');
      res.status(200).json({ success: true, user: { ...student?.toObject(), role: 'student' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user.' });
  }
};

