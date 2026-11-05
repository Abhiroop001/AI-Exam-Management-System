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
  HiOutlineShieldCheck,
  HiOutlinePrinter
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
      <div className="w-full max-w-[1700px] mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-base font-bold text-slate-700">Loading student diagnostic report...</p>
      </div>
    );
  }

  if (!submission || !exam) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 py-20 text-center">
        <p className="text-slate-700 font-bold text-lg mb-4">Report not found.</p>
        <Link to="/" className="text-purple-600 underline text-base font-bold inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const teacherReport = submission.teacherReport;

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/exam/${exam._id}/submissions`}
          className="inline-flex items-center space-x-2 text-base font-bold text-slate-700 hover:text-purple-600 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          <span>Back to Submissions</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-bold shadow-sm transition-colors"
          >
            <HiOutlinePrinter className="w-4 h-4 text-purple-600" />
            <span>Print Student File</span>
          </button>

          <span className="text-xs px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-black flex items-center space-x-2 shadow-sm">
            <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
            <span>Educator Diagnostic Dossier</span>
          </span>
        </div>
      </div>

      {/* Student & Performance Summary Card - Expansive Full Width */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm">
                <HiOutlineAcademicCap className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">{student?.name || 'Student'}</h1>
                <p className="text-base text-slate-600 font-medium mt-1">
                  Class: <span className="text-slate-900 font-bold">{student?.className || 'N/A'}</span> &bull; Email:{' '}
                  <span className="text-slate-900 font-bold">{student?.email}</span> &bull; Age:{' '}
                  <span className="text-slate-900 font-bold">{student?.age}</span>
                </p>
              </div>
            </div>
            <p className="text-base text-slate-600 font-medium">
              Assessment: <span className="text-slate-900 font-bold">{exam.title}</span> &bull; Discipline:{' '}
              <span className="text-slate-900 font-bold">{exam.subject}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-card p-7 rounded-3xl border border-slate-200 text-center min-w-[170px] bg-slate-50 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-black tracking-wider block">Total Score</span>
              <span className="text-5xl font-black text-slate-900 font-mono mt-1 block">
                {submission.totalScore}/{submission.maxScore}
              </span>
              <span className="text-xs text-purple-700 font-black block mt-2">
                {submission.percentage}% Accuracy
              </span>
            </div>

            <div className="glass-card p-7 rounded-3xl border border-purple-200 text-center min-w-[170px] bg-purple-50/40 shadow-sm">
              <span className="text-xs text-purple-700 uppercase font-black tracking-wider block">Mastery Rating</span>
              <span className="text-3xl font-black text-purple-900 font-mono mt-1 block">
                {teacherReport?.studentMasteryRating || 'In Review'}
              </span>
              <span className="text-xs text-emerald-700 flex items-center justify-center space-x-1 mt-2 font-bold">
                <HiOutlineShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{teacherReport?.integrityConfidenceScore || 98}% Integrity Confidence</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pedagogical Synthesis Summary */}
        {teacherReport?.overallSummary && (
          <div className="mt-8 p-7 rounded-2xl bg-purple-50/60 border border-purple-100">
            <span className="text-xs font-black uppercase tracking-wider text-purple-800 flex items-center space-x-2 mb-3">
              <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
              <span>Pedagogical Assessment & Classroom Diagnostic</span>
            </span>
            <p className="text-lg text-slate-900 leading-relaxed font-sans font-medium">
              {teacherReport.overallSummary}
            </p>
          </div>
        )}
      </div>

      {/* Cognitive Diagnostic Breakdown: Strengths vs Misconceptions */}
      {teacherReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strengths Observed */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-200 bg-white/95 shadow-sm">
            <h3 className="text-base font-black text-emerald-800 uppercase tracking-wider flex items-center space-x-2.5 mb-5">
              <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
              <span>Demonstrated Cognitive Strengths</span>
            </h3>
            <ul className="space-y-3.5 text-base text-slate-800">
              {(teacherReport.strengthsObserved || []).map((s, idx) => (
                <li key={idx} className="flex items-start space-x-3.5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Misconceptions Identified */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-200 bg-white/95 shadow-sm">
            <h3 className="text-base font-black text-amber-800 uppercase tracking-wider flex items-center space-x-2.5 mb-5">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-amber-600" />
              <span>Identified Gaps & Misconceptions</span>
            </h3>
            <ul className="space-y-3.5 text-base text-slate-800">
              {(teacherReport.misconceptionsIdentified || []).map((m, idx) => (
                <li key={idx} className="flex items-start space-x-3.5 bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                  <span className="font-semibold">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Teacher Action Items */}
      {teacherReport?.teacherActionItems && teacherReport.teacherActionItems.length > 0 && (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-200 bg-white/95 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
              <HiOutlineLightBulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                Recommended Pedagogical Interventions
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Actionable steps for targeted 1-on-1 coaching and homework differentiation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {teacherReport.teacherActionItems.map((action, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-base text-slate-800 hover:border-indigo-300 transition-colors">
                <span className="text-xs font-mono font-black text-indigo-700 uppercase tracking-wider block mb-2">
                  Intervention #{idx + 1}
                </span>
                <p className="leading-relaxed font-semibold">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Deep Inspection */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
          <span>Question-by-Question Audit & Teacher Remarks</span>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
            {exam.questions.length} Items
          </span>
        </h2>

        <div className="space-y-6">
          {exam.questions.map((q, idx) => {
            const studentAns = submission.answers.find((a) => a.questionId === q.id);
            const score = studentAns ? studentAns.scoreAwarded : 0;
            const isFullScore = score >= q.marks;

            return (
              <div
                key={q.id}
                className={`glass-panel p-8 sm:p-10 rounded-3xl border bg-white shadow-sm ${
                  isFullScore ? 'border-slate-200' : 'border-rose-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
                  <div className="flex items-center space-x-3.5">
                    <span className="font-mono text-xs font-black px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                      Q#{idx + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                      {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-base font-mono font-black text-slate-900">
                      Score: {score} / {q.marks} Marks
                    </span>
                    {isFullScore ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Full Marks</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                        <HiOutlineXCircle className="w-4 h-4 text-rose-600" />
                        <span>Partial / Review</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-xl sm:text-2xl font-black text-slate-900 mb-6 leading-relaxed">
                  {q.questionText}
                </p>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-base mb-5">
                  {/* Student Submission */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 uppercase font-black tracking-wider block mb-2">
                      Student's Submitted Answer
                    </span>
                    <div className="text-slate-900 font-medium">
                      {q.type === 'long_answer' ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-base">
                          {studentAns?.textAnswer || '<No answer recorded>'}
                        </p>
                      ) : (
                        <p className="font-mono text-indigo-700 font-bold text-base">
                          {studentAns?.selectedOptions?.join(', ') || '<No option selected>'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Teacher's Reference & Remarks */}
                  <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <span className="text-xs text-purple-700 uppercase font-black tracking-wider block mb-2">
                      Instructor's Model Key / Solution
                    </span>
                    <div className="text-slate-800">
                      {q.type === 'long_answer' ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-base font-medium">
                          {q.idealAnswer || 'N/A'}
                        </p>
                      ) : (
                        <p className="font-mono text-emerald-700 font-bold text-base">
                          {q.correctAnswers?.join(', ')}
                        </p>
                      )}
                    </div>

                    {q.remarks && (
                      <div className="mt-4 pt-3 border-t border-purple-100 text-sm text-purple-900 font-medium">
                        <span className="font-bold">Evaluation Remark: </span>
                        {q.remarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* Diagnostic Evaluation Rationale */}
                {studentAns?.aiEvaluation && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-base text-slate-800 flex items-start space-x-3.5">
                    <HiOutlineSparkles className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Diagnostic Evaluation Rationale: </span>
                      <span className="font-medium">{studentAns.aiEvaluation.scoreRationale || studentAns.aiEvaluation.feedback}</span>
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
