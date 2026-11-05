import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Submission } from '../types';
import { 
  HiOutlineQrCode, 
  HiOutlineArrowRight, 
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineCamera,
  HiOutlineSignal,
  HiOutlineComputerDesktop,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineClock
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState('');
  
  // Historical submissions
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  // Modals state
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannerSimulating, setScannerSimulating] = useState(false);

  // Fetch past submissions
  const fetchMySubmissions = async () => {
    try {
      const res = await api.get('/submissions/my-submissions');
      if (res.data.success) {
        setPastSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching past student submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, []);

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

  const handleSimulateQRScan = (sampleCode: string) => {
    setScannerSimulating(true);
    setTimeout(() => {
      setScannerSimulating(false);
      setIsScannerModalOpen(false);
      navigate(`/exam/${sampleCode}`);
    }, 1200);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10 font-sans">
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

          {/* Interactive Exam Ready Card */}
          <div 
            onClick={() => setIsReadinessModalOpen(true)}
            className="glass-card p-6 rounded-2xl border border-slate-200 text-center min-w-[200px] bg-indigo-50/40 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider block mb-1 group-hover:text-indigo-600 transition-colors">
              Session Status
            </span>
            <span className="text-2xl font-black text-indigo-700 flex items-center justify-center space-x-2">
              <HiOutlineShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>Exam Ready</span>
            </span>
            <span className="text-[11px] text-indigo-600 font-bold mt-1 block">
              Click to test readiness &rarr;
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
              Type the unique test code provided by your teacher or displayed on the classroom screen to launch your assessment session.
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

          <div className="mt-8 pt-5 border-t border-slate-100 text-sm text-slate-500 font-medium flex items-center justify-between">
            <span>Pre-loaded demo assessment:</span>
            <button
              onClick={() => setExamCode('EX-AI2026')}
              className="font-mono font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl border border-indigo-200 transition-colors"
            >
              Fill EX-AI2026
            </button>
          </div>
        </motion.div>

        {/* QR Code Scanner Card - Interactive Click to Open Scanner */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => setIsScannerModalOpen(true)}
          className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between cursor-pointer group hover:border-cyan-400 hover:shadow-lg transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm group-hover:bg-cyan-100 transition-colors">
                <HiOutlineCamera className="w-9 h-9" />
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold uppercase tracking-wider">
                Interactive Scanner
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 group-hover:text-cyan-700 transition-colors">
              Scan Educator QR Code
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-8 font-medium">
              Click to open the live optical scanner or upload a QR image. Join the examination room instantly without typing.
            </p>

            <div className="space-y-4 text-sm text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-3.5">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Zero-click direct entrance into active room</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Live proctor heartbeat connection streams to instructor</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Automated 5-minute deep diagnostic evaluation & roadmap</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-cyan-700">
            <span>Launch Web Scanner Viewfinder</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </motion.div>
      </div>

      {/* NEW SECTION: My Completed Assessments & Diagnostic Reports Grid */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center space-x-3">
              <span>Your Assessment History & Diagnostic Reports</span>
              <span className="text-xs px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                {pastSubmissions.length}
              </span>
            </h2>
          </div>

          <span className="text-sm text-slate-500 font-medium">
            Click any assessment card to inspect your score, model keys, and personalized learning roadmap.
          </span>
        </div>

        {isLoadingSubmissions ? (
          <div className="p-16 text-center glass-panel rounded-3xl border border-slate-200 bg-white">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Retrieving your assessment diagnostic records...</p>
          </div>
        ) : pastSubmissions.length === 0 ? (
          <div className="p-16 text-center glass-panel rounded-3xl border border-slate-200 bg-white shadow-sm">
            <HiOutlineAcademicCap className="w-14 h-14 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800">No assessment records found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6 font-medium">
              You haven't completed any examinations yet. Enter a test code above or scan your teacher's QR code to begin!
            </p>
            <button
              onClick={() => setExamCode('EX-AI2026')}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white glow-gradient-student shadow-md"
            >
              <span>Load Practice Exam EX-AI2026</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastSubmissions.map((sub) => {
              const exam = typeof sub.examId === 'object' ? (sub.examId as any) : null;
              const formattedDate = new Date(sub.submittedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isAnalyzing = sub.analysisStatus === 'analyzing';

              return (
                <motion.div
                  key={sub._id}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/report/${sub._id}`)}
                  className="glass-card p-7 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-black border border-indigo-200 uppercase tracking-wider">
                        {exam?.subject || 'Assessment'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {exam?.title || 'Examination Benchmark'}
                    </h3>

                    {/* Score summary banner */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Final Score</span>
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {sub.totalScore}
                          <span className="text-sm text-slate-400 font-normal">/{sub.maxScore}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Accuracy</span>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white font-mono">
                          {sub.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-600 font-medium">
                        Tier: <span className="font-bold text-slate-900">{sub.studentReport?.performanceTier || 'Evaluated'}</span>
                      </span>

                      {isAnalyzing ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                          <span className="w-2 h-2 rounded-full bg-purple-600 animate-spin" />
                          <span>5-Min Pipeline Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Diagnostic Ready</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span>View Diagnostic Report & Roadmap</span>
                    <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: System & Protocol Readiness Checklist Modal */}
      <AnimatePresence>
        {isReadinessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                    <HiOutlineShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Testing Arena Readiness Check</h3>
                    <p className="text-xs text-slate-500 font-medium">Verified for Student ID: {user?.id || 'Verified'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReadinessModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <HiOutlineSignal className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-800">Network Latency</span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    22ms &bull; Ultra Low
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <HiOutlineComputerDesktop className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-800">Browser Environment</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Authorized Modern Web Client
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <HiOutlineCamera className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-800">Proctoring Telemetry Ping</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Heartbeat Synchronized
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-slate-800">Student Identity Profile</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    {user?.name} (Class {user?.className})
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsReadinessModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Confirm & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Interactive Webcam QR Scanner Viewfinder Modal */}
      <AnimatePresence>
        {isScannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-8 space-y-6 text-center"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3 text-left">
                  <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600">
                    <HiOutlineCamera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">QR Code Optical Scanner</h3>
                    <p className="text-xs text-slate-500 font-medium">Point camera at classroom screen or upload code</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScannerModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
              </div>

              {/* Viewfinder Simulation with Scanning Laser */}
              <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl bg-slate-900 overflow-hidden flex items-center justify-center border-4 border-slate-200 shadow-inner">
                {/* Crosshairs */}
                <div className="absolute inset-6 border-2 border-dashed border-cyan-400/60 rounded-2xl pointer-events-none" />
                
                {/* Laser animation */}
                <motion.div
                  className="absolute left-4 right-4 h-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                  animate={{ y: [-100, 100, -100] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="text-slate-400 text-xs font-mono font-medium z-10 px-4 text-center">
                  {scannerSimulating ? (
                    <span className="text-cyan-300 font-bold animate-pulse">QR Code Detected! Redirecting...</span>
                  ) : (
                    <span>Align instructor's QR inside the frame</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleSimulateQRScan('EX-AI2026')}
                  disabled={scannerSimulating}
                  className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center space-x-2"
                >
                  <HiOutlineQrCode className="w-5 h-5" />
                  <span>{scannerSimulating ? 'Connecting to Room...' : 'Scan Sample Test QR (EX-AI2026)'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsScannerModalOpen(false);
                    setExamCode('EX-AI2026');
                  }}
                  className="w-full py-3 px-5 rounded-2xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel and Enter Code Manually
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
