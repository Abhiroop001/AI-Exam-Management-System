import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Submission, Exam } from '../types';
import { 
  HiOutlineArrowLeft, 
  HiOutlineSparkles, 
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineUserGroup
} from 'react-icons/hi2';

export const ExamSubmissionsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-purple-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {exam && (
          <Link
            to={`/monitor/${exam._id}`}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition-colors shadow-sm"
          >
            Live Monitor ({exam.code}) &rarr;
          </Link>
        )}
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
              <span>Assessment Results & AI Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{exam?.title || 'Exam Submissions'}</h1>
            <p className="text-sm text-slate-500 font-medium">
              Subject: <span className="font-bold text-slate-800">{exam?.subject}</span> &bull; Total Questions:{' '}
              <span className="font-bold text-slate-800">{exam?.questions.length}</span> &bull; Total Marks:{' '}
              <span className="font-bold text-slate-800">{exam?.totalMarks}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-200 text-center min-w-[120px] bg-slate-50 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Turnout</span>
              <span className="text-3xl font-black text-slate-900 font-mono">{totalSubmissions}</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-purple-200 text-center min-w-[120px] bg-purple-50/40 shadow-sm">
              <span className="text-[10px] text-purple-600 uppercase font-bold tracking-wider block">Class Average</span>
              <span className="text-3xl font-black text-purple-700 font-mono">{avgPercentage}%</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-emerald-200 text-center min-w-[120px] bg-emerald-50/40 shadow-sm">
              <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider block">Top Score</span>
              <span className="text-3xl font-black text-emerald-700 font-mono">{highestPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table - Full Screen Width */}
      <div className="glass-panel rounded-3xl border border-slate-200/90 overflow-hidden bg-white shadow-sm">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Student Submission Records</span>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              {submissions.length} Records
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Click 'View AI Diagnostic' to inspect individual student report & feedback
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Loading submission data...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-16 text-center">
            <HiOutlineUserGroup className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No student submissions recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Once students finish their tests, their long answers and MCQs will be analyzed by the AI engine.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/80">
                  <th className="py-4 px-6">Student Info</th>
                  <th className="py-4 px-6">Class / ID</th>
                  <th className="py-4 px-6">Score & Marks</th>
                  <th className="py-4 px-6">AI Pipeline Status</th>
                  <th className="py-4 px-6">Submitted At</th>
                  <th className="py-4 px-6 text-right">Teacher Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {submissions.map((sub) => {
                  const submittedTime = new Date(sub.submittedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const isAnalyzing = sub.analysisStatus === 'analyzing';

                  return (
                    <tr key={sub._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {sub.studentId?.name || 'Unknown Student'}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{sub.studentId?.email}</span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold">
                          Class: {sub.studentId?.className || 'N/A'}
                        </span>
                        {sub.studentId?.rollNumber && (
                          <span className="text-[11px] text-slate-500 block mt-1 font-mono">
                            Roll: #{sub.studentId.rollNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-extrabold text-slate-900 font-mono">
                            {sub.totalScore}/{sub.maxScore}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
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

                      <td className="py-4 px-6">
                        {isAnalyzing ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-spin" />
                            <span>AI 5-Min Analysis...</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Analyzed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">{submittedTime}</td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/report/${sub._id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-sm"
                        >
                          <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
                          <span>View AI Diagnostic</span>
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
