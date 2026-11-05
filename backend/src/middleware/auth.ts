import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'teacher' | 'student';
    email: string;
    name: string;
  };
}

export const authenticateTeacher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };

    if (decoded.role !== 'teacher') {
      res.status(403).json({ success: false, message: 'Forbidden. Teacher authorization required.' });
      return;
    }

    const teacher = await Teacher.findById(decoded.id).select('-password');
    if (!teacher) {
      res.status(401).json({ success: false, message: 'Teacher profile not found.' });
      return;
    }

    req.user = {
      id: teacher._id.toString(),
      role: 'teacher',
      email: teacher.email,
      name: teacher.name,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const authenticateStudent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };

    if (decoded.role !== 'student') {
      res.status(403).json({ success: false, message: 'Forbidden. Student authorization required.' });
      return;
    }

    const student = await Student.findById(decoded.id).select('-password');
    if (!student) {
      res.status(401).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    req.user = {
      id: student._id.toString(),
      role: 'student',
      email: student.email,
      name: student.name,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const authenticateAny = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access denied. Token missing.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: 'teacher' | 'student' };

    if (decoded.role === 'teacher') {
      const teacher = await Teacher.findById(decoded.id).select('-password');
      if (!teacher) {
        res.status(401).json({ success: false, message: 'User not found.' });
        return;
      }
      req.user = { id: teacher._id.toString(), role: 'teacher', email: teacher.email, name: teacher.name };
      return next();
    } else if (decoded.role === 'student') {
      const student = await Student.findById(decoded.id).select('-password');
      if (!student) {
        res.status(401).json({ success: false, message: 'User not found.' });
        return;
      }
      req.user = { id: student._id.toString(), role: 'student', email: student.email, name: student.name };
      return next();
    }

    res.status(403).json({ success: false, message: 'Invalid role.' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

