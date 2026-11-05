import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineSparkles, 
  HiOutlineAcademicCap, 
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';

export const StudentNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 px-4 sm:px-8 lg:px-12 py-3.5 backdrop-blur-xl bg-white/90">
      <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl glow-gradient-student flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <HiOutlineSparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-slate-900">ExamAI</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                STUDENT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Interactive Learning & Testing Arena</p>
          </div>
        </Link>

        {/* Profile & Navigation */}
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900 flex items-center justify-end space-x-1.5">
                <span>{user.name}</span>
                <HiOutlineAcademicCap className="w-4 h-4 text-indigo-600" />
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Class: {user.className} &bull; Age {user.age}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all duration-200 shadow-sm"
            >
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white glow-gradient-student hover:brightness-105 shadow-md shadow-indigo-500/20 transition-all"
            >
              Join as Student
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
