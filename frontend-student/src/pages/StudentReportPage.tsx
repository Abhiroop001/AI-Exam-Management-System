import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Submission, Exam } from '../types';
import { 
  HiOutlineSparkles, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle, 
  HiOutlineArrowLeft, 
  HiOutlineChartBar, 
  HiOutlineLightBulb,
  HiOutlineAcademicCap,
  HiOutlinePrinter,
  HiOutlineTrophy
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const StudentReportPage: React.FC = () => {
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

          // Confetti celebration if score is good
          if (res.data.submission?.percentage >= 60) {
            confetti({
              particleCount: 100,
              spread: 85,
              origin: { y: 0.5 },
            });
          }
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
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-bold text-slate-700">Loading your comprehensive assessment diagnostic report...</p>
      </div>
    );
  }

  if (!submission || !exam) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 text-center">
        <p className="text-slate-700 font-bold text-lg mb-4">Report data not available.</p>
        <Link to="/" className="text-indigo-600 underline font-bold text-base">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const report = submission.studentReport;

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10 font-sans relative z-10">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-base font-bold text-slate-700 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-200 text-base font-bold shadow-sm transition-colors"
        >
          <HiOutlinePrinter className="w-5 h-5 text-indigo-600" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Hero Performance Card - Expansive Full-Screen Design */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden bg-white/95">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold uppercase tracking-wider">
              <HiOutlineTrophy className="w-4 h-4 text-amber-500" />
              <span>Assessment Diagnostic &bull; {exam.title}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Assessment Report for <span className="text-indigo-600">{student?.name || 'Student'}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Class: <span className="font-bold text-slate-900">{student?.className}</span> &bull; Discipline:{' '}
              <span className="font-bold text-slate-900">{exam.subject}</span> &bull; Submitted on{' '}
              {new Date(submission.submittedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Big Score Summary Ring */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-indigo-200/90 text-center min-w-[260px] bg-gradient-to-b from-indigo-50/50 to-white shadow-md shrink-0">
            <span className="text-xs text-slate-500 uppercase font-black tracking-wider block mb-2">
              Final Total Score
            </span>
            <div className="text-6xl sm:text-7xl font-black text-slate-900 font-mono tracking-tight">
              {submission.totalScore}
              <span className="text-3xl text-slate-400 font-normal">/{submission.maxScore}</span>
            </div>
            <div className="mt-4 inline-block px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              {submission.percentage}% &bull; {report?.performanceTier || 'Evaluated'}
            </div>
          </div>
        </div>

        {/* AI Synthesis Narrative */}
        {report?.overallSummary && (
          <div className="mt-10 p-7 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 flex items-center space-x-2 mb-3">
              <HiOutlineSparkles className="w-4 h-4 text-indigo-600" />
              <span>Pedagogical Assessment & Diagnostic Summary</span>
            </span>
            <p className="text-lg text-slate-900 leading-relaxed font-sans font-medium">
              {report.overallSummary}
            </p>
          </div>
        )}
      </div>

      {/* Concept Breakdown Progress - Full Width Grid */}
      {report?.conceptBreakdown && report.conceptBreakdown.length > 0 && (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2.5">
              <HiOutlineChartBar className="w-6 h-6 text-indigo-600" />
              <span>Curriculum Concept Mastery Breakdown</span>
            </h3>
            <span className="text-xs sm:text-sm text-slate-500 font-semibold">
              Measured by question taxonomy and cognitive accuracy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {report.conceptBreakdown.map((c, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                  <span className="truncate pr-2">{c.topic}</span>
                  <span className="font-mono text-indigo-600 text-base font-black">{c.masteryPercentage}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.masteryPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 rounded-full"
                  />
                </div>
                <div className="text-xs text-slate-600 flex justify-between font-medium">
                  <span>Proficiency:</span>
                  <span className="font-bold text-slate-800">
                    {c.masteryPercentage >= 75 ? 'Mastery' : c.masteryPercentage >= 50 ? 'Developing' : 'Review Needed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Focus Areas - 2-Column Responsive Layout */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Strengths */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-200 bg-white/95 shadow-sm">
            <h3 className="text-base font-extrabold text-emerald-800 uppercase tracking-wider flex items-center space-x-2.5 mb-5">
              <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
              <span>Key Strengths Observed</span>
            </h3>
            <ul className="space-y-3.5 text-base text-slate-800">
              {(report.strengths || []).map((s, idx) => (
                <li key={idx} className="flex items-start space-x-3.5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Growth */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-200 bg-white/95 shadow-sm">
            <h3 className="text-base font-extrabold text-amber-800 uppercase tracking-wider flex items-center space-x-2.5 mb-5">
              <HiOutlineLightBulb className="w-6 h-6 text-amber-600" />
              <span>Areas for Targeted Growth</span>
            </h3>
            <ul className="space-y-3.5 text-base text-slate-800">
              {(report.areasForImprovement || []).map((a, idx) => (
                <li key={idx} className="flex items-start space-x-3.5 bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                  <span className="font-semibold">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Personalized Learning Roadmap */}
      {report?.personalizedLearningPlan && report.personalizedLearningPlan.length > 0 && (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-200 bg-white/95 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
              <HiOutlineAcademicCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                Personalized Learning Roadmap
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Actionable milestones tailored to what you answered and teacher recommendations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {report.personalizedLearningPlan.map((planStep, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-base text-slate-800 hover:border-indigo-300 transition-colors">
                <span className="text-xs font-mono font-black text-indigo-600 uppercase tracking-wider block mb-2">
                  Milestone #{idx + 1}
                </span>
                <p className="leading-relaxed font-semibold">{planStep}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Review with Teacher Remarks - Expansive Full Width */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <span>Detailed Question-by-Question Audit</span>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              {exam.questions.length} Questions
            </span>
          </h2>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            Compare your response with model answer keys and diagnostic rationale
          </span>
        </div>

        <div className="space-y-6">
          {exam.questions.map((q, idx) => {
            const studentAns = submission.answers.find((a) => a.questionId === q.id);
            const score = studentAns?.scoreAwarded ?? 0;
            const isFull = score >= q.marks;

            return (
              <div
                key={q.id}
                className={`glass-panel p-8 sm:p-10 rounded-3xl border bg-white shadow-sm transition-all ${
                  isFull ? 'border-slate-200' : 'border-rose-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
                  <div className="flex items-center space-x-3.5">
                    <span className="font-mono text-xs font-black px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
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
                    {isFull ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Full Marks</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                        <HiOutlineXCircle className="w-4 h-4 text-rose-600" />
                        <span>Partial / Incorrect</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Prompt */}
                <p className="text-xl sm:text-2xl font-black text-slate-900 mb-6 leading-relaxed">
                  {q.questionText}
                </p>

                {/* Answers Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-base mb-5">
                  {/* Student Answer */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 uppercase font-black tracking-wider block mb-2">
                      Your Submitted Response
                    </span>
                    <div className="text-slate-900 font-medium">
                      {q.type === 'long_answer' ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-base font-medium">
                          {studentAns?.textAnswer || '<No answer recorded>'}
                        </p>
                      ) : (
                        <p className="font-mono text-indigo-700 font-bold text-base">
                          {studentAns?.selectedOptions?.join(', ') || '<No option selected>'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Teacher Remarks & Model Key */}
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <span className="text-xs text-indigo-700 uppercase font-black tracking-wider block mb-2">
                      Instructor's Model Key & Remarks
                    </span>
                    {q.remarks ? (
                      <p className="text-slate-800 leading-relaxed font-medium text-base">
                        {q.remarks}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-base">No additional remarks provided.</p>
                    )}
                  </div>
                </div>

                {/* AI Rationale / Feedback */}
                {studentAns?.aiEvaluation && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-base text-slate-800 flex items-start space-x-3.5">
                    <HiOutlineSparkles className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Diagnostic Rationale: </span>
                      <span className="font-medium">{studentAns.aiEvaluation.feedback || studentAns.aiEvaluation.scoreRationale}</span>
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
