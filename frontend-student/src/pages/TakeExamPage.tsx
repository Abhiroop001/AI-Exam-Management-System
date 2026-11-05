import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Exam, Question } from '../types';
import { ExamTopbar } from '../components/ExamTopbar';
import { QuestionCard } from '../components/QuestionCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight, 
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

export const TakeExamPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers store
  const [answers, setAnswers] = useState<Record<string, { selectedOptions: string[]; textAnswer: string }>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Timer in seconds
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // Load Exam
  useEffect(() => {
    const fetchExam = async () => {
      if (!code) return;
      try {
        const res = await api.get(`/exams/code/${code}`);
        if (res.data.success && res.data.exam) {
          if (res.data.alreadySubmitted && res.data.existingSubmissionId) {
            navigate(`/report/${res.data.existingSubmissionId}`);
            return;
          }

          const examData = res.data.exam;
          setExam(examData);

          const durationSeconds = examData.durationMinutes * 60;
          const expiryTime = new Date(examData.expiresAt).getTime();
          const now = Date.now();
          const secondsUntilExpiry = Math.max(0, Math.floor((expiryTime - now) / 1000));
          const effectiveSeconds = Math.min(durationSeconds, secondsUntilExpiry);

          setTimeRemainingSeconds(effectiveSeconds > 0 ? effectiveSeconds : durationSeconds);
        }
      } catch (err: any) {
        setLoadError(err.response?.data?.message || 'Failed to load test. Please check the code.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [code]);

  // Heartbeat ping to teacher live tracker
  useEffect(() => {
    if (!exam?._id) return;

    const ping = async () => {
      try {
        await api.post('/submissions/heartbeat', { examId: exam._id });
      } catch (err) {
        console.warn('Live heartbeat skipped');
      }
    };

    ping();
    const heartbeatInterval = setInterval(ping, 15000);
    return () => clearInterval(heartbeatInterval);
  }, [exam?._id]);

  // Countdown Timer
  useEffect(() => {
    if (isLoading || !exam) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, exam]);

  // Handle Option selection
  const handleSelectOption = (q: Question, option: string) => {
    const current = answers[q.id] || { selectedOptions: [], textAnswer: '' };

    if (q.type === 'single_mcq') {
      setAnswers({
        ...answers,
        [q.id]: { ...current, selectedOptions: [option] },
      });
    } else if (q.type === 'multi_mcq') {
      const exists = current.selectedOptions.includes(option);
      const updated = exists
        ? current.selectedOptions.filter((o) => o !== option)
        : [...current.selectedOptions, option];
      setAnswers({
        ...answers,
        [q.id]: { ...current, selectedOptions: updated },
      });
    }
  };

  const handleTextChange = (qId: string, text: string) => {
    const current = answers[qId] || { selectedOptions: [], textAnswer: '' };
    setAnswers({
      ...answers,
      [qId]: { ...current, textAnswer: text },
    });
  };

  const handleClearAnswer = (qId: string) => {
    setAnswers({
      ...answers,
      [qId]: { selectedOptions: [], textAnswer: '' },
    });
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions({
      ...flaggedQuestions,
      [qId]: !flaggedQuestions[qId],
    });
  };

  // Submit test
  const handleSubmitExam = async (isAutoSubmit = false) => {
    if (!exam || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const formattedAnswers = exam.questions.map((q) => {
      const ans = answers[q.id] || { selectedOptions: [], textAnswer: '' };
      return {
        questionId: q.id,
        selectedOptions: ans.selectedOptions,
        textAnswer: ans.textAnswer,
      };
    });

    try {
      const res = await api.post('/submissions/submit', {
        examId: exam._id,
        answers: formattedAnswers,
        timeSpentSeconds,
      });

      if (res.data.success && res.data.submissionId) {
        navigate(`/analyzing/${res.data.submissionId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting exam.');
      setIsSubmitting(false);
      setIsConfirmSubmitOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Decrypting Exam & Initializing AI Proctoring..." />;
  }

  if (loadError || !exam) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-200 text-center bg-white shadow-lg">
          <HiOutlineExclamationTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Join Exam</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">{loadError}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white glow-gradient-student shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIndex];
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOptions.length > 0 || a.textAnswer.trim().length > 0
  ).length;

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans relative z-10">
      {/* Sleek Animated Topbar */}
      <ExamTopbar
        title={exam.title}
        subject={exam.subject}
        timeRemainingSeconds={timeRemainingSeconds}
        totalQuestions={exam.questions.length}
        currentIndex={currentIndex}
        answeredCount={answeredCount}
        onToggleNavigator={() => setIsNavigatorOpen(!isNavigatorOpen)}
        onSubmit={() => setIsConfirmSubmitOpen(true)}
      />

      {/* Main Test Arena - Full Screen Expansive Container */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 flex-1 flex flex-col justify-between">
        {/* Animated Question Card */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              index={currentIndex}
              selectedOptions={answers[currentQuestion.id]?.selectedOptions || []}
              textAnswer={answers[currentQuestion.id]?.textAnswer || ''}
              isFlagged={!!flaggedQuestions[currentQuestion.id]}
              onSelectOption={(opt) => handleSelectOption(currentQuestion, opt)}
              onTextChange={(text) => handleTextChange(currentQuestion.id, text)}
              onToggleFlag={() => toggleFlag(currentQuestion.id)}
              onClearAnswer={() => handleClearAnswer(currentQuestion.id)}
            />
          )}
        </AnimatePresence>

        {/* Question Pagination Bottom Controls */}
        <div className="flex items-center justify-between pt-8 pb-4">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 hover:text-slate-900 border border-slate-200 text-sm font-bold shadow-sm transition-all"
          >
            <HiOutlineChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-sm font-mono font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            Question {currentIndex + 1} of {exam.questions.length}
          </span>

          {currentIndex < exam.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
              className="flex items-center space-x-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>Next</span>
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmSubmitOpen(true)}
              className="flex items-center space-x-2 px-7 py-3 rounded-xl glow-gradient-student text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Review & Submit</span>
              <HiOutlineCheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Jump-to-Question Grid Navigator Modal */}
      <AnimatePresence>
        {isNavigatorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavigatorOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Questions Navigation Grid</h3>
                <button
                  onClick={() => setIsNavigatorOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-4 text-xs text-slate-500 mb-5">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Answered</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Flagged</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300" />
                  <span>Unanswered</span>
                </span>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto p-1">
                {exam.questions.map((q, idx) => {
                  const isAnswered =
                    (answers[q.id]?.selectedOptions?.length || 0) > 0 ||
                    (answers[q.id]?.textAnswer?.trim()?.length || 0) > 0;
                  const isFlagged = flaggedQuestions[q.id];
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsNavigatorOpen(false);
                      }}
                      className={`h-11 rounded-xl font-mono text-xs font-bold border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-indigo-600 scale-105'
                          : ''
                      } ${
                        isFlagged
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : isAnswered
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Submit Modal */}
      <AnimatePresence>
        {isConfirmSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmSubmitOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 text-center bg-white shadow-2xl z-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm">
                <HiOutlineCheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Submit Exam?</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                You have answered <span className="font-bold text-slate-900">{answeredCount}</span> of{' '}
                <span className="font-bold text-slate-900">{exam.questions.length}</span> questions. Once
                submitted, your responses will immediately enter the 5-minute deep AI analysis pipeline.
              </p>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmSubmitOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitExam(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white glow-gradient-student hover:brightness-105 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
