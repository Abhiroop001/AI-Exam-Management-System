import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Submission, Exam } from '../types';
import { 
  HiOutlineArrowLeft, 
  HiOutlineSparkles, 
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineUserGroup,
  HiOutlineTrophy,
  HiOutlineChartBar
} from 'react-icons/hi2';

export const ExamSubmissionsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<'date' | 'score' | 'name'>('date');

  const fetchSubmissions = async () => {
    if (!examId) return;
    try {
      const res = await api.get(`/submissions/exam/${examId}`);
      if (res.data.success) {
        setExam(res.data.exam);
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 8000);
    return () => clearInterval(interval);
  }, [examId]);

  const totalSubmissions = submissions.length;
  const avgPercentage = totalSubmissions > 0
    ? Math.round(submissions.reduce((s, sub) => s + (sub.percentage || 0), 0) / totalSubmissions)
    : 0;
  const highestPercentage = totalSubmissions > 0
    ? Math.max(...submissions.map((s) => s.percentage || 0))
    : 0;

  // Sorting
  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortKey === 'score') return (b.percentage || 0) - (a.percentage || 0);
    if (sortKey === 'name') return (a.studentId?.name || '').localeCompare(b.studentId?.name || '');
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-base font-bold text-slate-700 hover:text-purple-600 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        {exam && (
          <Link
            to={`/monitor/${exam._id}`}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition-colors shadow-sm"
          >
            Live Monitor ({exam.code}) &rarr;
          </Link>
        )}
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-extrabold uppercase tracking-wider">
              <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
              <span>Assessment Results & Class Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">{exam?.title || 'Exam Submissions'}</h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Subject: <span className="font-bold text-slate-900">{exam?.subject}</span> &bull; Total Questions:{' '}
              <span className="font-bold text-slate-900">{exam?.questions.length}</span> &bull; Total Marks:{' '}
              <span className="font-bold text-slate-900">{exam?.totalMarks}</span>
            </p>
          </div>

          {/* Interactive Metric Cards */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setSortKey('date')}
              className={`glass-card p-6 rounded-3xl border transition-all cursor-pointer text-center min-w-[130px] ${
                sortKey === 'date' ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/30' : 'border-slate-200 bg-white hover:border-purple-300'
              }`}
            >
              <span className="text-xs text-slate-500 uppercase font-black tracking-wider block">Turnout</span>
              <span className="text-4xl font-black text-slate-900 font-mono mt-1 block">{totalSubmissions}</span>
              <span className="text-[10px] text-purple-600 font-bold block mt-1">Sort By Date</span>
            </div>

            <div 
              onClick={() => setSortKey('score')}
              className={`glass-card p-6 rounded-3xl border transition-all cursor-pointer text-center min-w-[140px] ${
                sortKey === 'score' ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/30' : 'border-purple-200 bg-purple-50/40 hover:border-purple-400'
              }`}
            >
              <span className="text-xs text-purple-700 uppercase font-black tracking-wider block">Class Average</span>
              <span className="text-4xl font-black text-purple-800 font-mono mt-1 block">{avgPercentage}%</span>
              <span className="text-[10px] text-purple-600 font-bold block mt-1">Sort By Score</span>
            </div>

            <div 
              onClick={() => setSortKey('score')}
              className="glass-card p-6 rounded-3xl border border-emerald-200 text-center min-w-[130px] bg-emerald-50/40 shadow-sm cursor-pointer hover:border-emerald-400 transition-all"
            >
              <span className="text-xs text-emerald-700 uppercase font-black tracking-wider block">Top Score</span>
              <span className="text-4xl font-black text-emerald-800 font-mono mt-1 block">{highestPercentage}%</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Highest Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table - Full Screen Width */}
      <div className="glass-panel rounded-3xl border border-slate-200/90 overflow-hidden bg-white shadow-sm">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <span>Student Submission Records</span>
            <span className="text-xs px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              {submissions.length} Records
            </span>
          </h2>
          <span className="text-sm text-slate-500 font-medium">
            Click any row or 'View Diagnostic Report' to inspect individual student report & feedback
          </span>
        </div>

        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-base font-bold text-slate-600">Loading submission data...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-20 text-center">
            <HiOutlineUserGroup className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800">No student submissions recorded yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 font-medium">
              Once students finish their tests, their long answers and MCQs will be analyzed by the assessment pipeline.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/80 font-black">
                  <th className="py-5 px-8">Student Info</th>
                  <th className="py-5 px-8">Class / ID</th>
                  <th className="py-5 px-8">Score & Accuracy</th>
                  <th className="py-5 px-8">Diagnostic Status</th>
                  <th className="py-5 px-8">Submitted At</th>
                  <th className="py-5 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base">
                {sortedSubmissions.map((sub) => {
                  const submittedTime = new Date(sub.submittedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const isAnalyzing = sub.analysisStatus === 'analyzing';

                  return (
                    <tr 
                      key={sub._id} 
                      onClick={() => navigate(`/report/${sub._id}`)}
                      className="hover:bg-purple-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-5 px-8">
                        <div className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {sub.studentId?.name || 'Unknown Student'}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{sub.studentId?.email}</span>
                      </td>

                      <td className="py-5 px-8 text-sm text-slate-700">
                        <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 font-bold">
                          Class: {sub.studentId?.className || 'N/A'}
                        </span>
                        {sub.studentId?.rollNumber && (
                          <span className="text-xs text-slate-500 block mt-1 font-mono">
                            Roll: #{sub.studentId.rollNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-5 px-8">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-black text-slate-900 font-mono">
                            {sub.totalScore}/{sub.maxScore}
                          </span>
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-full ${
                              sub.percentage >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sub.percentage >= 60
                                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {sub.percentage}%
                          </span>
                        </div>
                      </td>

                      <td className="py-5 px-8">
                        {isAnalyzing ? (
                          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-spin" />
                            <span>5-Min Diagnostic Synthesis...</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Diagnostic Ready</span>
                          </span>
                        )}
                      </td>

                      <td className="py-5 px-8 text-sm text-slate-500">{submittedTime}</td>

                      <td className="py-5 px-8 text-right">
                        <Link
                          to={`/report/${sub._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-sm"
                        >
                          <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
                          <span>View Diagnostic Report</span>
                          <HiOutlineArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
