import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlineArrowRight,
  HiOutlineAcademicCap 
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/student/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('emma.watson@student.edu');
    setPassword('student1234');
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-lg bg-white/95 relative"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl glow-gradient-student flex items-center justify-center shadow-md shadow-indigo-500/25 mx-auto mb-4">
            <HiOutlineAcademicCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Student Portal Sign In</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Access your active tests, AI evaluation reports, and personalized study roadmaps
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <HiOutlineEnvelope className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@academy.edu"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white glow-gradient-student hover:brightness-105 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to Student Arena'}</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-indigo-600 hover:text-indigo-800 font-bold"
          >
            ✨ Quick Demo Fill
          </button>
          <div className="text-slate-500 font-medium">
            Need an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-bold">
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
