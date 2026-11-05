import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  HiOutlineSparkles, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineArrowRight,
  HiOutlineCpuChip
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const AnalysisWaitPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  // 5 Minutes = 300 Seconds Countdown Timer
  const [countdownSeconds, setCountdownSeconds] = useState(300);
  const [isBackendCompleted, setIsBackendCompleted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Ingesting Assessment Data & Response Artifacts',
      desc: 'Compiling questions, student selections, code files, and teacher evaluation rubrics...',
    },
    {
      title: 'Semantic Vector & Conceptual Alignment Scoring',
      desc: 'Evaluating dense semantic similarity between student long responses and teacher rubric standards...',
    },
    {
      title: 'Algorithm Inspection & Diagram Fidelity Evaluation',
      desc: 'Static analysis of submitted algorithms (.c, .py, .java) and high-resolution diagram quality inspection...',
    },
    {
      title: 'Cognitive Domain & Concept Mastery Calculation',
      desc: 'Mapping question accuracy to Bloom’s taxonomy and error classification across curriculum topics...',
    },
    {
      title: 'Dual Pedagogical Diagnostic Report Synthesis',
      desc: 'Finalizing personalized student roadmap and comprehensive educator diagnostics...',
    },
  ];

  // 1-second countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/report/${submissionId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submissionId, navigate]);

  // Rotate through steps smoothly based on elapsed time
  useEffect(() => {
    const elapsed = 300 - countdownSeconds;
    if (elapsed < 30) setActiveStep(0);
    else if (elapsed < 90) setActiveStep(1);
    else if (elapsed < 180) setActiveStep(2);
    else if (elapsed < 240) setActiveStep(3);
    else setActiveStep(4);
  }, [countdownSeconds]);

  // Poll backend submission status every 4 seconds
  useEffect(() => {
    if (!submissionId) return;

    const checkStatus = async () => {
      try {
        const res = await api.get(`/submissions/status/${submissionId}`);
        if (res.data.success && res.data.analysisStatus === 'completed') {
          setIsBackendCompleted(true);
        }
      } catch (err) {
        console.warn('Status poll skipped');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [submissionId]);

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const progressPercent = Math.round(((300 - countdownSeconds) / 300) * 100);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans z-10">
      <div className="max-w-4xl w-full glass-panel p-8 sm:p-14 rounded-3xl border border-slate-200/90 text-center relative z-10 shadow-lg bg-white/95">
        {/* Animated Radar Pulse Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-100"
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-indigo-200 border-t-indigo-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <div className="w-16 h-16 rounded-2xl glow-gradient-student flex items-center justify-center shadow-md shadow-indigo-500/30">
            <HiOutlineCpuChip className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold uppercase tracking-wider mb-4">
          <HiOutlineSparkles className="w-4 h-4 text-indigo-600" />
          <span>Cognitive Assessment & Diagnostic Pipeline</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
          AI Deep Diagnostic Analysis
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
          Your answers are being analyzed against teacher remarks, rubric standards, and conceptual depth criteria. Dual reports are being synthesized for you and your instructor.
        </p>

        {/* 5-Minute Timer Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-100 mb-8 max-w-lg mx-auto bg-gradient-to-b from-indigo-50/50 to-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-600 uppercase font-extrabold tracking-wider flex items-center space-x-2">
              <HiOutlineClock className="w-4 h-4 text-indigo-600" />
              <span>5-Minute Analysis Window</span>
            </span>
            <span className="font-mono text-sm font-extrabold text-indigo-600">{progressPercent}%</span>
          </div>

          <div className="text-5xl sm:text-6xl font-mono font-black text-slate-900 tracking-wider mb-5">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          {/* Progress bar */}
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Multi-step progressive pipeline indicator */}
        <div className="text-left space-y-3.5 max-w-2xl mx-auto mb-8">
          {steps.map((s, idx) => {
            const isDone = idx < activeStep || isBackendCompleted;
            const isCurrent = idx === activeStep && !isBackendCompleted;

            return (
              <div
                key={idx}
                className={`flex items-start space-x-4 p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-50/80 border-indigo-300 text-slate-900 shadow-sm'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : 'bg-slate-50 border-slate-200/80 text-slate-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* If backend completed analysis early, offer instant report link */}
        {isBackendCompleted ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => navigate(`/report/${submissionId}`)}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base text-white glow-gradient-student hover:brightness-105 shadow-md shadow-indigo-600/30 transition-all inline-flex items-center justify-center space-x-2.5"
            >
              <span>AI Analysis Complete &bull; View Your Report</span>
              <HiOutlineArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <p className="text-sm text-slate-500 font-medium">
            Please keep this tab open. Your personalized report will automatically load when countdown reaches zero.
          </p>
        )}
      </div>
    </div>
  );
};
