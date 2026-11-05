import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineBookOpen, 
  HiOutlineCalendar, 
  HiOutlineLockClosed, 
  HiOutlineArrowRight,
  HiOutlineAcademicCap 
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    subject: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (Number(formData.age) < 18) {
      setError('Age must be at least 18 for teacher verification.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/teacher/register', formData);
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error registering teacher account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 py-10 relative z-10 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-lg bg-white/95 relative"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl glow-gradient-purple flex items-center justify-center shadow-md shadow-purple-500/25 mx-auto mb-4">
            <HiOutlineAcademicCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Teacher Registration</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Create your educator profile to author AI tests, grade long answers & analyze performance
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1) Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <HiOutlineUser className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Alan Walker"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* 2) Age */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Age (18+)
              </label>
              <div className="relative">
                <HiOutlineCalendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  name="age"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="34"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 3) Subject */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Teaching Subject
              </label>
              <div className="relative">
                <HiOutlineBookOpen className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Computer Science, Physics, Math"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* 5) Phone */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <HiOutlinePhone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* 4) Mail */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <HiOutlineEnvelope className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="teacher@university.edu"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 6) Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* 7) Confirm Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white glow-gradient-purple hover:brightness-105 shadow-md shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Teacher Registration'}</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-purple-600 hover:underline font-bold">
            Sign In here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
