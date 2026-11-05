import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Submission, Exam } from '../types';
import { 
  HiOutlineArrowLeft, 
  HiOutlineSparkles, 
  HiOutlineAcademicCap, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

export const StudentReportDetailPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!submissionId) return;
      try {
        const res = await api.get(`/submissions/report/${submissionId}`);
        if (res.data.success) {
          setSubmission(res.data.submission);
          setExam(res.data.exam);
          setStudent(res.data.student);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading AI diagnostic report...</p>
      </div>
    );
  }

  if (!submission || !exam) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 font-semibold mb-3">Report not found.</p>
        <Link to="/" className="text-purple-600 underline text-sm font-semibold inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const teacherReport = submission.teacherReport;

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/exam/${exam._id}/submissions`}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-purple-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Submissions</span>
        </Link>

        <span className="text-xs px-3.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold flex items-center space-x-1.5 shadow-sm">
          <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
          <span>Teacher Diagnostic Report</span>
        </span>
      </div>

      {/* Student & Performance Summary Card - Expansive Full Width */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm">
                <HiOutlineAcademicCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{student?.name || 'Student'}</h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Class: <span className="text-slate-800 font-bold">{student?.className || 'N/A'}</span> &bull; Email:{' '}
                  <span className="text-slate-800 font-bold">{student?.email}</span> &bull; Age:{' '}
                  <span className="text-slate-800 font-bold">{student?.age}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              Exam: <span className="text-slate-900 font-bold">{exam.title}</span> ({exam.subject})
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-card p-6 rounded-3xl border border-slate-200 text-center min-w-[150px] bg-slate-50 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Score</span>
              <span className="text-4xl font-black text-slate-900 font-mono">
                {submission.totalScore}/{submission.maxScore}
              </span>
              <span className="text-xs text-purple-700 font-bold block mt-1">
                {submission.percentage}% Total
              </span>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-purple-200 text-center min-w-[150px] bg-purple-50/40 shadow-sm">
              <span className="text-[10px] text-purple-600 uppercase font-bold tracking-wider block">Mastery Rating</span>
              <span className="text-2xl font-black text-purple-900 font-mono">
                {teacherReport?.studentMasteryRating || 'In Review'}
              </span>
              <span className="text-[11px] text-emerald-700 flex items-center justify-center space-x-1 mt-1 font-bold">
                <HiOutlineShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{teacherReport?.integrityConfidenceScore || 98}% Trust</span>
              </span>
            </div>
          </div>
        </div>

        {/* AI Synthesis Summary */}
        {teacherReport?.overallSummary && (
          <div className="mt-8 p-6 rounded-2xl bg-purple-50/60 border border-purple-100">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center space-x-1.5 mb-2">
              <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
              <span>AI Pedagogical Assessment & Classroom Diagnostic</span>
            </span>
            <p className="text-base text-slate-800 leading-relaxed font-sans font-medium">
              {teacherReport.overallSummary}
            </p>
          </div>
        )}
      </div>

      {/* AI Diagnostic Breakdown: Strengths vs Misconceptions */}
      {teacherReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths Observed */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-200 bg-white/95 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-2 mb-4">
              <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Demonstrated Cognitive Strengths</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              {(teacherReport.strengthsObserved || []).map((s, idx) => (
                <li key={idx} className="flex items-start space-x-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span className="font-medium">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Misconceptions Identified */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200 bg-white/95 shadow-sm">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-2 mb-4">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-600" />
              <span>Identified Gaps & Misconceptions</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              {(teacherReport.misconceptionsIdentified || []).map((m, idx) => (
                <li key={idx} className="flex items-start space-x-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-2 shrink-0" />
                  <span className="font-medium">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Teacher Action Items */}
      {teacherReport?.teacherActionItems && teacherReport.teacherActionItems.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-200 bg-white/95 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <HiOutlineLightBulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Recommended Pedagogical Interventions
              </h3>
              <p className="text-xs text-slate-500">
                Actionable steps for targeted 1-on-1 coaching and homework differentiation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {teacherReport.teacherActionItems.map((action, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 hover:border-indigo-300 transition-colors">
                <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider block mb-1.5">
                  Intervention #{idx + 1}
                </span>
                <p className="leading-relaxed font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Deep Inspection */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <span>Question-by-Question Audit & Teacher Remarks</span>
        </h2>

        <div className="space-y-5">
          {exam.questions.map((q, idx) => {
            const studentAns = submission.answers.find((a) => a.questionId === q.id);
            const score = studentAns ? studentAns.scoreAwarded : 0;
            const isFullScore = score >= q.marks;

            return (
              <div
                key={q.id}
                className={`glass-panel p-6 sm:p-8 rounded-3xl border bg-white shadow-sm ${
                  isFullScore ? 'border-slate-200' : 'border-rose-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                      Q#{idx + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-mono font-extrabold text-slate-900">
                      Score: {score} / {q.marks} Marks
                    </span>
                    {isFullScore ? (
                      <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <HiOutlineXCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-base font-bold text-slate-900 mb-5 leading-relaxed">
                  {q.questionText}
                </p>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm mb-4">
                  {/* Student Submission */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1.5">
                      Student's Submitted Answer
                    </span>
                    <div className="text-slate-900 font-medium">
                      {q.type === 'long_answer' ? (
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {studentAns?.textAnswer || '<No answer recorded>'}
                        </p>
                      ) : (
                        <p className="font-mono text-indigo-700 font-bold">
                          {studentAns?.selectedOptions?.join(', ') || '<No option selected>'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Teacher's Reference & Remarks */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <span className="text-xs text-purple-700 uppercase font-bold tracking-wider block mb-1.5">
                      Teacher's Reference / Model Answer
                    </span>
                    <div className="text-slate-800">
                      {q.type === 'long_answer' ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                          {q.idealAnswer || 'N/A'}
                        </p>
                      ) : (
                        <p className="font-mono text-emerald-700 font-bold">
                          {q.correctAnswers?.join(', ')}
                        </p>
                      )}
                    </div>

                    {q.remarks && (
                      <div className="mt-3 pt-3 border-t border-purple-100 text-xs text-purple-800">
                        <span className="font-bold">Teacher Remark: </span>
                        {q.remarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Evaluation Rationale */}
                {studentAns?.aiEvaluation && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 flex items-start space-x-3">
                    <HiOutlineSparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">AI Grading Rationale: </span>
                      <span>{studentAns.aiEvaluation.scoreRationale || studentAns.aiEvaluation.feedback}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
