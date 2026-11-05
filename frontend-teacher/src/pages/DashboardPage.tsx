import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Exam } from '../types';
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
  HiOutlineExclamationCircle
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleDeleteExam = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exam and its student records?')) {
      return;
    }
    try {
      await api.delete(`/exams/${id}`);
      setExams(exams.filter((e) => e._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting exam.');
    }
  };

  const totalSubmissions = exams.reduce((sum, e) => sum + (e.submissionCount || 0), 0);
  const activeExamsCount = exams.filter((e) => !e.isExpired).length;
  const totalActiveTakers = exams.reduce((sum, e) => sum + (e.activeTakers || 0), 0);

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

      {/* Analytics Counter Grid - Full Screen Span */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-7 rounded-3xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Active Tests
            </span>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <HiOutlineDocumentCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-5xl font-black text-slate-900">{activeExamsCount}</span>
            <span className="text-sm text-slate-500 font-bold">of {exams.length} total</span>
          </div>
        </div>

        <div className="glass-card p-7 rounded-3xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Live Test-Takers
            </span>
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600">
              <HiOutlineRadio className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-5xl font-black text-cyan-600">{totalActiveTakers}</span>
            <span className="text-sm text-slate-500 font-bold">active right now</span>
          </div>
        </div>

        <div className="glass-card p-7 rounded-3xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <HiOutlineUsers className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-5xl font-black text-indigo-600">{totalSubmissions}</span>
            <span className="text-sm text-slate-500 font-bold">evaluated papers</span>
          </div>
        </div>

        <div className="glass-card p-7 rounded-3xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Evaluation Engine
            </span>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <HiOutlineSparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2.5">
            <span className="text-2xl font-black text-emerald-700">Dual Reports</span>
            <span className="text-sm text-slate-500 font-bold">&bull; 5-Min Pipeline</span>
          </div>
        </div>
      </div>

      {/* Tests List - Full Screen Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <span>Your Authored Assessments</span>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              {exams.length}
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="p-20 text-center glass-panel rounded-3xl border border-slate-200 bg-white">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-base font-bold text-slate-600">Loading exams database...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-20 text-center glass-panel rounded-3xl border border-slate-200 bg-white shadow-sm">
            <HiOutlineExclamationCircle className="w-14 h-14 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800">No exams created yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6 font-medium">
              Launch your first test with multiple question types, automated QR codes, and AI grammar checking!
            </p>
            <Link
              to="/create-exam"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white glow-gradient-purple shadow-md"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              <span>Create First Exam</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exams.map((exam) => {
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
                  className="glass-card p-7 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between relative group hover:border-purple-300 transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-black border border-purple-200 uppercase tracking-wider">
                        {exam.subject}
                      </span>
                      <div className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                        {exam.code}
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
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
                    <button
                      onClick={() =>
                        setSelectedQR({
                          isOpen: true,
                          title: exam.title,
                          code: exam.code,
                          qrUrl: exam.qrCodeDataUrl,
                          expiresAt: exam.expiresAt,
                        })
                      }
                      className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors shadow-sm"
                      title="View QR Code & Share"
                    >
                      <HiOutlineQrCode className="w-5 h-5" />
                    </button>

                    <Link
                      to={`/monitor/${exam._id}`}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
                      title="Live Student Monitoring"
                    >
                      <HiOutlineRadio className="w-4 h-4 text-cyan-600" />
                      <span>Live Radar</span>
                    </Link>

                    <Link
                      to={`/exam/${exam._id}/submissions`}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl text-xs font-black glow-gradient-purple hover:brightness-105 text-white shadow-md shadow-purple-600/20 transition-all"
                    >
                      <HiOutlineChartBar className="w-4 h-4" />
                      <span>Reports ({exam.submissionCount || 0})</span>
                    </Link>

                    <button
                      onClick={() => handleDeleteExam(exam._id)}
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
