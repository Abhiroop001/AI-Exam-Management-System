import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Exam, Question } from '../types';
import { QRModal } from '../components/QRModal';
import { 
  HiOutlinePlusCircle, 
  HiOutlineQrCode, 
  HiOutlineRadio, 
  HiOutlineChartBar, 
  HiOutlineTrash,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineDocumentCheck,
  HiOutlineExclamationCircle,
  HiOutlineXMark,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineEye,
  HiOutlineAdjustmentsHorizontal
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state for top metric cards
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'live' | 'submissions'>('all');

  // Modals state
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
  const [selectedExamForDetail, setSelectedExamForDetail] = useState<Exam | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'overview' | 'questions' | 'actions'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [selectedQR, setSelectedQR] = useState<{
    isOpen: boolean;
    title: string;
    code: string;
    qrUrl: string;
    expiresAt: string;
  }>({
    isOpen: false,
    title: '',
    code: '',
    qrUrl: '',
    expiresAt: '',
  });

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams/teacher');
      if (res.data.success) {
        setExams(res.data.exams);
      }
    } catch (err) {
      console.error('Error fetching teacher exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    const interval = setInterval(fetchExams, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteExam = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this exam and its student records?')) {
      return;
    }
    try {
      await api.delete(`/exams/${id}`);
      setExams(exams.filter((e) => e._id !== id));
      if (selectedExamForDetail?._id === id) {
        setSelectedExamForDetail(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting exam.');
    }
  };

  const handleCopyInviteLink = (exam: Exam, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const studentUrl = `${window.location.protocol}//${window.location.hostname}:5174/exam/${exam.code}`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedCode(exam.code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const totalSubmissions = exams.reduce((sum, e) => sum + (e.submissionCount || 0), 0);
  const activeExamsCount = exams.filter((e) => !e.isExpired).length;
  const totalActiveTakers = exams.reduce((sum, e) => sum + (e.activeTakers || 0), 0);

  // Filtered exams according to active card selection
  const filteredExams = exams.filter((e) => {
    if (filterMode === 'active') return !e.isExpired;
    if (filterMode === 'live') return (e.activeTakers || 0) > 0;
    if (filterMode === 'submissions') return (e.submissionCount || 0) > 0;
    return true;
  });

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10 font-sans">
      {/* Hero Welcome & Quick Stats */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-extrabold uppercase tracking-wider">
              <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
              <span>Assessment & Proctoring Studio</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-purple-600">{user?.name}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Department of <span className="font-bold text-slate-900">{user?.subject}</span> &bull; Author assessments, monitor live sessions, and review deep pedagogical analytics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/create-exam"
              className="flex items-center space-x-2.5 px-8 py-4 rounded-2xl font-black text-base text-white glow-gradient-purple hover:brightness-105 shadow-md shadow-purple-600/25 transition-all"
            >
              <HiOutlinePlusCircle className="w-6 h-6" />
              <span>Create New Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Counter Grid - Clickable Interactive Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Active Tests */}
        <div 
          onClick={() => setFilterMode(prev => prev === 'active' ? 'all' : 'active')}
          className={`glass-card p-7 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            filterMode === 'active' 
              ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/20 shadow-md' 
              : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">
              Active Tests
            </span>
            <div className={`p-3 rounded-2xl transition-colors ${filterMode === 'active' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'}`}>
              <HiOutlineDocumentCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-5xl font-black text-slate-900">{activeExamsCount}</span>
            <span className="text-sm text-slate-500 font-bold">of {exams.length} total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>{filterMode === 'active' ? '● Filtering Active Tests' : 'Click to filter list'}</span>
            <span className="text-slate-400">&rarr;</span>
          </div>
        </div>

        {/* Card 2: Live Test-Takers */}
        <div 
          onClick={() => setFilterMode(prev => prev === 'live' ? 'all' : 'live')}
          className={`glass-card p-7 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            filterMode === 'live' 
              ? 'border-cyan-600 ring-2 ring-cyan-600/20 bg-cyan-50/20 shadow-md' 
              : 'border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider group-hover:text-cyan-600 transition-colors">
              Live Test-Takers
            </span>
            <div className={`p-3 rounded-2xl transition-colors ${filterMode === 'live' ? 'bg-cyan-600 text-white' : 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100'}`}>
              <HiOutlineRadio className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-5xl font-black text-cyan-600">{totalActiveTakers}</span>
            <span className="text-sm text-slate-500 font-bold">active right now</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-cyan-600">
            <span>{filterMode === 'live' ? '● Filtering Live Rooms' : 'Click to filter live rooms'}</span>
            <span className="text-slate-400">&rarr;</span>
          </div>
        </div>

        {/* Card 3: Total Submissions */}
        <div 
          onClick={() => setFilterMode(prev => prev === 'submissions' ? 'all' : 'submissions')}
          className={`glass-card p-7 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            filterMode === 'submissions' 
              ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20 shadow-md' 
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              Total Submissions
            </span>
            <div className={`p-3 rounded-2xl transition-colors ${filterMode === 'submissions' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
              <HiOutlineUsers className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-5xl font-black text-indigo-600">{totalSubmissions}</span>
            <span className="text-sm text-slate-500 font-bold">evaluated papers</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>{filterMode === 'submissions' ? '● Filtering Evaluated Tests' : 'Click to filter submitted'}</span>
            <span className="text-slate-400">&rarr;</span>
          </div>
        </div>

        {/* Card 4: Evaluation Engine Diagnostics Modal */}
        <div 
          onClick={() => setIsEngineModalOpen(true)}
          className="glass-card p-7 rounded-3xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
              Evaluation Engine
            </span>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <HiOutlineSparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-2xl font-black text-emerald-700">Dual Reports</span>
            <span className="text-sm text-slate-500 font-bold">&bull; 5-Min Pipeline</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Click to inspect engine telemetry</span>
            <span className="text-slate-400">&rarr;</span>
          </div>
        </div>
      </div>

      {/* Tests List - Full Screen Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center space-x-3">
              <span>Your Authored Assessments</span>
              <span className="text-xs px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                {filteredExams.length}
              </span>
            </h2>

            {filterMode !== 'all' && (
              <button
                onClick={() => setFilterMode('all')}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black hover:bg-purple-100 transition-colors"
              >
                <span>Filtered ({filterMode})</span>
                <HiOutlineXMark className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-sm text-slate-500 font-medium">
            Click any test card to inspect question paper, remarks, or copy direct join links.
          </span>
        </div>

        {isLoading ? (
          <div className="p-20 text-center glass-panel rounded-3xl border border-slate-200 bg-white">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-base font-bold text-slate-600">Loading exams database...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-20 text-center glass-panel rounded-3xl border border-slate-200 bg-white shadow-sm">
            <HiOutlineExclamationCircle className="w-14 h-14 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800">No exams match the selected filter</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6 font-medium">
              {filterMode !== 'all' 
                ? 'Try resetting the filter to show all authored tests.' 
                : 'Launch your first test with multiple question types, automated QR codes, and smart question formatting!'}
            </p>
            {filterMode !== 'all' ? (
              <button
                onClick={() => setFilterMode('all')}
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white glow-gradient-purple shadow-md"
              >
                <span>Reset View to All Exams</span>
              </button>
            ) : (
              <Link
                to="/create-exam"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white glow-gradient-purple shadow-md"
              >
                <HiOutlinePlusCircle className="w-5 h-5" />
                <span>Create First Exam</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExams.map((exam) => {
              const isExpired = exam.isExpired;
              const activeCount = exam.activeTakers || 0;
              const formattedExp = new Date(exam.expiresAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={exam._id}
                  layout
                  onClick={() => {
                    setSelectedExamForDetail(exam);
                    setDetailModalTab('overview');
                  }}
                  className="glass-card p-7 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between relative group hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-black border border-purple-200 uppercase tracking-wider">
                        {exam.subject}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleCopyInviteLink(exam, e)}
                          title="Copy student join URL"
                          className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-800 hover:text-purple-700 border border-slate-200 transition-colors flex items-center space-x-1"
                        >
                          <span>{copiedCode === exam.code ? 'Copied!' : exam.code}</span>
                          <HiOutlineClipboardDocumentCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-slate-900 line-clamp-1 mb-2 group-hover:text-purple-600 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-5 font-medium">
                      {exam.description || 'Comprehensive evaluation covering multiple curriculum concepts.'}
                    </p>

                    {/* Metrics info strip */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-extrabold">
                          Duration
                        </span>
                        <span className="font-black text-slate-900 text-sm">{exam.durationMinutes} Mins</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-extrabold">
                          Items & Marks
                        </span>
                        <span className="font-black text-slate-900 text-sm">{exam.questions.length} Items ({exam.totalMarks} Marks)</span>
                      </div>
                    </div>

                    {/* Live active takers badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-2">
                        {activeCount > 0 ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-black border border-cyan-200">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                            <span>{activeCount} Taking Now</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">
                            No active live takers
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isExpired
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isExpired ? 'Expired' : `Expires ${formattedExp}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQR({
                          isOpen: true,
                          title: exam.title,
                          code: exam.code,
                          qrUrl: exam.qrCodeDataUrl,
                          expiresAt: exam.expiresAt,
                        });
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors shadow-sm"
                      title="View QR Code & Share"
                    >
                      <HiOutlineQrCode className="w-5 h-5" />
                    </button>

                    <Link
                      to={`/monitor/${exam._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center space-x-1 py-3 px-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 transition-colors"
                      title="Live Student Monitoring"
                    >
                      <HiOutlineRadio className="w-4 h-4 text-cyan-600" />
                      <span>Live Radar</span>
                    </Link>

                    <Link
                      to={`/exam/${exam._id}/submissions`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center space-x-1 py-3 px-2 rounded-xl text-xs font-black glow-gradient-purple hover:brightness-105 text-white shadow-md shadow-purple-600/20 transition-all"
                    >
                      <HiOutlineChartBar className="w-4 h-4" />
                      <span>Reports ({exam.submissionCount || 0})</span>
                    </Link>

                    <button
                      onClick={(e) => handleDeleteExam(exam._id, e)}
                      className="p-3 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Exam"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Evaluation Engine Diagnostics & Telemetry Modal */}
      <AnimatePresence>
        {isEngineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                    <HiOutlineSparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Cognitive Assessment & Diagnostic Pipeline</h3>
                    <p className="text-xs text-slate-500 font-medium">Underlying Evaluation Framework & Telemetry</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEngineModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-purple-700 uppercase tracking-wider block">
                    Semantic Vector Alignment & Rubric Scoring
                  </span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Student long answers are evaluated using dense embeddings to compare conceptual alignment against instructor reference remarks and model solutions.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-cyan-700 uppercase tracking-wider block">
                    Algorithmic Syntax & Code File Evaluation (.c, .py, .java)
                  </span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Uploaded source code files undergo static syntax parsing, algorithmic complexity analysis, and edge case evaluation during the 5-minute post-exam window.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
                    Automated High-Resolution Diagram & Vision Inspection
                  </span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Uploaded exam diagrams and figures undergo automated contrast enhancement, super-resolution denoising, and OCR inspection to ensure readable figures for students.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-center">
                    <span className="text-[10px] text-purple-700 font-black uppercase tracking-wider block">Target Pipeline Time</span>
                    <span className="text-2xl font-black text-purple-900 font-mono">5 Minutes</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider block">Dual Report Output</span>
                    <span className="text-2xl font-black text-emerald-900 font-mono">Student & Teacher</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsEngineModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Comprehensive Exam Details & Question Paper Preview Modal */}
      <AnimatePresence>
        {selectedExamForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center space-x-3">
                  <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-black text-xs uppercase border border-purple-200">
                    {selectedExamForDetail.subject}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{selectedExamForDetail.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Join Code: <span className="font-mono font-black text-purple-700">{selectedExamForDetail.code}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExamForDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-2 border-b border-slate-100 pb-2 shrink-0">
                <button
                  onClick={() => setDetailModalTab('overview')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    detailModalTab === 'overview'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Overview & Configuration
                </button>
                <button
                  onClick={() => setDetailModalTab('questions')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    detailModalTab === 'questions'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Question Paper & Remarks ({selectedExamForDetail.questions.length})
                </button>
                <button
                  onClick={() => setDetailModalTab('actions')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    detailModalTab === 'actions'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Launch Actions & QR Link
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="overflow-y-auto flex-1 space-y-6 pr-1">
                {detailModalTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Exam Description & Instructions
                      </span>
                      <p className="text-base text-slate-800 leading-relaxed font-medium">
                        {selectedExamForDetail.description || 'No custom instructions specified. Standard assessment rules apply.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                        <span className="text-xl font-black text-slate-900">{selectedExamForDetail.durationMinutes} Mins</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Items</span>
                        <span className="text-xl font-black text-slate-900">{selectedExamForDetail.questions.length} Questions</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Marks</span>
                        <span className="text-xl font-black text-slate-900">{selectedExamForDetail.totalMarks} Marks</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Submissions</span>
                        <span className="text-xl font-black text-purple-700">{selectedExamForDetail.submissionCount || 0}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
                      <div className="text-xs text-indigo-900 font-medium">
                        <span className="font-bold">Expires: </span>
                        {new Date(selectedExamForDetail.expiresAt).toLocaleString()}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        selectedExamForDetail.isExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {selectedExamForDetail.isExpired ? 'Expired' : 'Active & Accepting Students'}
                      </span>
                    </div>
                  </div>
                )}

                {detailModalTab === 'questions' && (
                  <div className="space-y-4">
                    {selectedExamForDetail.questions.map((q, idx) => (
                      <div key={q.id || idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800">
                            Item #{idx + 1} &bull; {q.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-600">{q.marks} Marks</span>
                        </div>

                        <p className="text-base font-bold text-slate-900 leading-relaxed">
                          {q.questionText}
                        </p>

                        {/* Options if MCQ */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = q.correctAnswers?.includes(opt);
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-3 rounded-xl border text-xs font-medium ${
                                    isCorrect
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {isCorrect && '✓ '} {opt}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Teacher Remarks / Reference Key */}
                        {q.remarks && (
                          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 font-medium">
                            <span className="font-bold block text-purple-950 mb-0.5">Instructor Reference & Model Key:</span>
                            {q.remarks}
                          </div>
                        )}

                        {/* Attachments if any */}
                        {q.attachments && q.attachments.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-2">
                            {q.attachments.map((att, aIdx) => (
                              <a
                                key={aIdx}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:text-purple-600 font-medium shadow-2xs"
                              >
                                <span>{att.originalName}</span>
                                <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {detailModalTab === 'actions' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-black text-slate-900 text-base">Direct Student Join Link</h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">Share this link or the 6-character code directly with your students.</p>
                      </div>
                      <button
                        onClick={() => handleCopyInviteLink(selectedExamForDetail)}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
                      >
                        <HiOutlineClipboardDocumentCheck className="w-4 h-4" />
                        <span>{copiedCode === selectedExamForDetail.code ? 'Copied to Clipboard!' : 'Copy Student Link'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <button
                        onClick={() => {
                          setSelectedQR({
                            isOpen: true,
                            title: selectedExamForDetail.title,
                            code: selectedExamForDetail.code,
                            qrUrl: selectedExamForDetail.qrCodeDataUrl,
                            expiresAt: selectedExamForDetail.expiresAt,
                          });
                        }}
                        className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
                      >
                        <HiOutlineQrCode className="w-8 h-8 text-purple-600" />
                        <span className="font-bold text-sm text-slate-900">Display QR Code</span>
                        <span className="text-[11px] text-slate-500">Project on classroom screen</span>
                      </button>

                      <button
                        onClick={() => navigate(`/monitor/${selectedExamForDetail._id}`)}
                        className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
                      >
                        <HiOutlineRadio className="w-8 h-8 text-cyan-600" />
                        <span className="font-bold text-sm text-slate-900">Launch Live Radar</span>
                        <span className="text-[11px] text-slate-500">Monitor active student sessions</span>
                      </button>

                      <button
                        onClick={() => navigate(`/exam/${selectedExamForDetail._id}/submissions`)}
                        className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
                      >
                        <HiOutlineChartBar className="w-8 h-8 text-indigo-600" />
                        <span className="font-bold text-sm text-slate-900">View All Submissions</span>
                        <span className="text-[11px] text-slate-500">Review scores & diagnostic reports</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-400 font-medium">Assessment System &bull; Secure Protocol</span>
                <button
                  onClick={() => setSelectedExamForDetail(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <QRModal
        isOpen={selectedQR.isOpen}
        onClose={() => setSelectedQR({ ...selectedQR, isOpen: false })}
        examTitle={selectedQR.title}
        examCode={selectedQR.code}
        qrCodeDataUrl={selectedQR.qrUrl}
        expiresAt={selectedQR.expiresAt}
      />
    </div>
  );
};
