import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineQrCode, 
  HiOutlineArrowRight, 
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = examCode.trim().toUpperCase();
    if (!cleaned) {
      setError('Please input a valid test code.');
      return;
    }

    navigate(`/exam/${cleaned}`);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-8 font-sans">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <HiOutlineSparkles className="w-4 h-4 text-indigo-600" />
              <span>Student Testing Arena</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-indigo-600">{user?.name}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Class: <span className="text-slate-900 font-bold">{user?.className}</span> &bull; Roll Number:{' '}
              <span className="text-slate-900 font-bold">{user?.rollNumber || 'Active'}</span> &bull; Age:{' '}
              <span className="text-slate-900 font-bold">{user?.age}</span>
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200 text-center min-w-[180px] bg-indigo-50/40 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider block mb-1">Status</span>
            <span className="text-2xl font-black text-indigo-700 flex items-center justify-center space-x-2">
              <HiOutlineShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>Exam Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Action Grid - Expansive Full Screen Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Join by Code Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm bg-white relative flex flex-col justify-between"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
              <HiOutlineQrCode className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Enter Exam Join Code</h2>
            <p className="text-base text-slate-600 mb-8 leading-relaxed font-medium">
              Type the unique 6-character test code provided by your teacher or displayed on the classroom screen to start testing.
            </p>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleJoinByCode} className="space-y-5">
              <div>
                <input
                  type="text"
                  required
                  value={examCode}
                  onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EX-AI2026"
                  maxLength={12}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-5 text-center text-2xl font-mono font-black tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 uppercase transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2.5 py-4 sm:py-5 px-6 rounded-2xl font-bold text-base text-white glow-gradient-student hover:brightness-105 shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>Launch Assessment Session</span>
                <HiOutlineArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 text-sm text-slate-500 font-medium">
            Tip: Try pre-loaded demo code <span className="font-mono font-black text-indigo-600 cursor-pointer hover:underline" onClick={() => setExamCode('EX-AI2026')}>EX-AI2026</span>
          </div>
        </motion.div>

        {/* QR Code Scanner Notice Card */}
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-6 shadow-sm">
              <HiOutlineSparkles className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Scan Educator QR Code</h2>
            <p className="text-base text-slate-600 leading-relaxed mb-8 font-medium">
              When your instructor displays the test QR code on the classroom projector or screen, point your camera to join instantly with secure session verification.
            </p>

            <div className="space-y-4 text-sm text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-3.5">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Direct zero-click entrance into active examination room</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Live proctor heartbeat connection streams to instructor monitor</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Automated 5-minute deep AI diagnostic evaluation & roadmap</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 text-sm text-slate-500 text-center font-bold">
            Intelligent Cognitive Assessment Engine Active &bull; Secure Protocol
          </div>
        </div>
      </div>
    </div>
  );
};
