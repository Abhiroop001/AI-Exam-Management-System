import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Question } from '../types';
import { FileAttachmentPicker } from '../components/FileAttachmentPicker';
import { AIGrammarModal } from '../components/AIGrammarModal';
import { QRModal } from '../components/QRModal';
import { 
  HiOutlineSparkles, 
  HiOutlineTrash, 
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineArrowLeft,
  HiOutlineInformationCircle,
  HiOutlineCheck
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const CreateExamPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Exam Metadata
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(user?.subject || '');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [expiresAt, setExpiresAt] = useState(tomorrow.toISOString().slice(0, 16));

  // Dynamic Questions list
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-1',
      questionText: 'What is the asymptotic time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black Tree)?',
      type: 'single_mcq',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswers: ['O(log n)'],
      idealAnswer: '',
      remarks: 'In balanced BSTs, height is strictly bounded by O(log n), ensuring logarithmic lookup time.',
      marks: 2,
      negativeMarks: 0.5,
      attachments: [],
    },
    {
      id: 'q-2',
      questionText: 'Which of the following data structures guarantee First-In-First-Out (FIFO) or Last-In-First-Out (LIFO) operational order?',
      type: 'multi_mcq',
      options: ['Stack (LIFO)', 'Queue (FIFO)', 'Hash Table', 'Min-Heap'],
      correctAnswers: ['Stack (LIFO)', 'Queue (FIFO)'],
      idealAnswer: '',
      remarks: 'Stacks follow LIFO while queues follow FIFO. Hash tables and heaps organize data by key hash and priority respectively.',
      marks: 3,
      negativeMarks: 0,
      attachments: [],
    },
    {
      id: 'q-3',
      questionText: 'Explain the mechanism of memory virtualization and page fault handling in modern operating systems.',
      type: 'long_answer',
      options: [],
      correctAnswers: [],
      idealAnswer: 'Memory virtualization maps virtual addresses to physical frames using page tables and the MMU. When a process accesses an unmapped virtual page, the CPU traps a page fault interrupt. The OS locates the page in swap storage, allocates a free physical frame (evicting one via LRU if necessary), copies data from disk, updates the page table entry (PTE) valid bit, and restarts the faulted instruction.',
      remarks: 'Students must detail the MMU translation, page fault trap, disk fetching, page replacement strategy, and instruction restart.',
      marks: 5,
      negativeMarks: 0,
      attachments: [],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Polish modal state
  const [polishingIndex, setPolishingIndex] = useState<number | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishResult, setPolishResult] = useState<any>(null);

  // Success QR Modal State
  const [createdExamModal, setCreatedExamModal] = useState<{
    isOpen: boolean;
    title: string;
    code: string;
    qrUrl: string;
    expiresAt: string;
    examJoinUrl?: string;
  }>({
    isOpen: false,
    title: '',
    code: '',
    qrUrl: '',
    expiresAt: '',
    examJoinUrl: '',
  });

  const handleAddQuestion = (type: 'single_mcq' | 'multi_mcq' | 'long_answer') => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      questionText: '',
      type,
      options: type === 'long_answer' ? [] : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswers: [],
      idealAnswer: '',
      remarks: '',
      marks: type === 'long_answer' ? 5 : 2,
      negativeMarks: 0,
      attachments: [],
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('An exam must contain at least one question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q, i) => (i === idx ? { ...q, ...updates } : q))
    );
  };

  const handleAIPolish = async (idx: number) => {
    const q = questions[idx];
    if (!q.questionText || q.questionText.trim().length === 0) {
      alert('Please enter some question text before triggering AI refinement.');
      return;
    }

    setPolishingIndex(idx);
    setIsPolishing(true);

    try {
      const res = await api.post('/ai/polish', {
        questionText: q.questionText,
        remarks: q.remarks,
        options: q.options,
      });

      if (res.data.success && res.data.result) {
        setPolishResult(res.data.result);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'AI Polish service unavailable.');
      setPolishingIndex(null);
    } finally {
      setIsPolishing(false);
    }
  };

  const applyPolishedText = (refinedText: string) => {
    if (polishingIndex !== null) {
      updateQuestion(polishingIndex, { questionText: refinedText });
      setPolishingIndex(null);
      setPolishResult(null);
    }
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const q = questions[qIdx];
    const newOpts = [...q.options];
    const oldVal = newOpts[optIdx];
    newOpts[optIdx] = val;

    const updatedCorrect = q.correctAnswers.map((c) => (c === oldVal ? val : c));
    updateQuestion(qIdx, { options: newOpts, correctAnswers: updatedCorrect });
  };

  const handleAddOption = (qIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, {
      options: [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`],
    });
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx];
    const removedOpt = q.options[optIdx];
    const newOpts = q.options.filter((_, i) => i !== optIdx);
    const updatedCorrect = q.correctAnswers.filter((c) => c !== removedOpt);
    updateQuestion(qIdx, { options: newOpts, correctAnswers: updatedCorrect });
  };

  const toggleCorrectOption = (qIdx: number, optionVal: string) => {
    const q = questions[qIdx];
    if (q.type === 'single_mcq') {
      updateQuestion(qIdx, { correctAnswers: [optionVal] });
    } else if (q.type === 'multi_mcq') {
      const exists = q.correctAnswers.includes(optionVal);
      if (exists) {
        updateQuestion(qIdx, { correctAnswers: q.correctAnswers.filter((c) => c !== optionVal) });
      } else {
        updateQuestion(qIdx, { correctAnswers: [...q.correctAnswers, optionVal] });
      }
    }
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Exam title is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question #${i + 1} is missing question text.`);
        return;
      }
      if (q.type !== 'long_answer' && q.correctAnswers.length === 0) {
        setError(`Question #${i + 1} requires at least one designated correct answer.`);
        return;
      }
      if (q.type === 'long_answer' && !q.remarks.trim() && !q.idealAnswer?.trim()) {
        setError(`Question #${i + 1} (Long Answer) requires an Ideal Answer or Teacher Remarks for the AI grading engine.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const clientStudentUrl = isLocal
        ? 'http://localhost:5174'
        : 'https://frontend-student-nu.vercel.app';

      const res = await api.post('/exams', {
        title,
        subject,
        description,
        durationMinutes,
        expiresAt,
        questions,
        clientStudentUrl,
      });

      if (res.data.success && res.data.exam) {
        setCreatedExamModal({
          isOpen: true,
          title: res.data.exam.title,
          code: res.data.exam.code,
          qrUrl: res.data.exam.qrCodeDataUrl,
          expiresAt: res.data.exam.expiresAt,
          examJoinUrl: res.data.examJoinUrl || (
            isLocal ? `http://localhost:5174/exam/${res.data.exam.code}` : `https://frontend-student-nu.vercel.app/exam/${res.data.exam.code}`
          ),
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating exam.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8 font-sans">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-purple-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="text-right bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Exam Weight</span>
          <span className="text-sm font-black text-purple-700 font-mono">{totalMarks} Marks &bull; {questions.length} Items</span>
        </div>
      </div>

      <form onSubmit={handleSubmitExam} className="space-y-8">
        {/* Test Configuration Metadata Card */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 bg-white/95">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-3xl font-black text-slate-900">Create New Assessment</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure parameters, expiration cutoff, and embed multimedia materials for students.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Assessment Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Midterm: Advanced Data Structures & Systems"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Subject / Discipline
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Computer Science, Mathematics, Physics"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                <HiOutlineClock className="w-4 h-4 text-purple-600" />
                <span>Duration (Minutes)</span>
              </label>
              <input
                type="number"
                required
                min="5"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                <HiOutlineCalendar className="w-4 h-4 text-cyan-600" />
                <span>Expiration Date & Time (QR & Test Cutoff)</span>
              </label>
              <input
                type="datetime-local"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Teacher Instructions / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students regarding negative marking, attached code snippets, and calculators..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
            />
          </div>
        </div>

        {/* Dynamic Questions Builder */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <span>Questions & Evaluator Criteria</span>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-mono font-bold border border-purple-200">
                  {questions.length} Items
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Single MCQ, Multi-Select MCQ, and Long Answer with AI Evaluation & Teacher Remarks
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleAddQuestion('single_mcq')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors"
              >
                + Single MCQ
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('multi_mcq')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors"
              >
                + Multi MCQ
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('long_answer')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-sm transition-colors"
              >
                + Long Answer
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              return (
                <motion.div
                  key={q.id}
                  layout
                  className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm relative"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center space-x-3">
                      <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-mono font-black text-sm flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                        {q.type === 'single_mcq'
                          ? 'Single Choice MCQ'
                          : q.type === 'multi_mcq'
                          ? 'Multiple Choice (Select All That Apply)'
                          : 'Long Descriptive / Analytical Answer'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                        <label>Marks:</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={q.marks}
                          onChange={(e) => updateQuestion(idx, { marks: Number(e.target.value) })}
                          className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
                        />
                      </div>

                      {q.type !== 'long_answer' && (
                        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                          <label>Negative:</label>
                          <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={q.negativeMarks || 0}
                            onChange={(e) => updateQuestion(idx, { negativeMarks: Number(e.target.value) })}
                            className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-rose-600 focus:outline-none focus:bg-white"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Question"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text with AI Polish CTA */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Question Prompt
                      </label>

                      <button
                        type="button"
                        onClick={() => handleAIPolish(idx)}
                        disabled={isPolishing && polishingIndex === idx}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                      >
                        <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
                        <span>
                          {isPolishing && polishingIndex === idx
                            ? 'Analyzing clarity & phrasing...'
                            : '✨ AI Grammar Polish & Clarity'}
                        </span>
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      required
                      value={q.questionText}
                      onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                      placeholder="Enter the complete question prompt here..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 leading-relaxed font-sans shadow-inner"
                    />
                  </div>

                  {/* MCQ Options Configuration */}
                  {q.type !== 'long_answer' && (
                    <div className="space-y-3 mb-5 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Options & Correct Answer Key (Click checkmark to toggle correct)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddOption(idx)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-bold"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctAnswers.includes(opt);
                          return (
                            <div key={optIdx} className="flex items-center space-x-2.5">
                              <button
                                type="button"
                                onClick={() => toggleCorrectOption(idx, opt)}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white text-slate-400 border-slate-300 hover:border-slate-400'
                                }`}
                                title={isCorrect ? 'Correct Answer' : 'Click to mark as correct'}
                              >
                                <HiOutlineCheck className="w-4 h-4" />
                              </button>

                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                                placeholder={`Option ${optIdx + 1}`}
                                className={`flex-1 bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all ${
                                  isCorrect ? 'border-emerald-500 font-bold' : 'border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100'
                                }`}
                              />

                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx, optIdx)}
                                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                  <HiOutlineTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ideal Answer (For Long Answers) */}
                  {q.type === 'long_answer' && (
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Teacher's Model / Ideal Answer (Crucial benchmark for AI Grading)
                      </label>
                      <textarea
                        rows={3}
                        value={q.idealAnswer || ''}
                        onChange={(e) => updateQuestion(idx, { idealAnswer: e.target.value })}
                        placeholder="Provide the comprehensive model answer that the AI evaluator will use to grade student conceptual understanding..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                      />
                    </div>
                  )}

                  {/* Teacher Remarks & Explanations */}
                  <div className="space-y-2 mb-4">
                    <label className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                      Teacher Remarks & Detailed Rubric
                    </label>
                    <textarea
                      rows={2}
                      value={q.remarks}
                      onChange={(e) => updateQuestion(idx, { remarks: e.target.value })}
                      placeholder="Specific points, common student traps, or formulas that should be emphasized in student reports..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                    />
                  </div>

                  {/* File Attachment & Vision Checker */}
                  <FileAttachmentPicker
                    attachments={q.attachments || []}
                    onChange={(newAttachments) => updateQuestion(idx, { attachments: newAttachments })}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <HiOutlineInformationCircle className="w-5 h-5 text-purple-600 shrink-0" />
            <span>
              Once submitted, the exam will be immediately active and the unique scannable QR Code will be generated.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white glow-gradient-purple hover:brightness-105 shadow-md shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating & Generating QR...' : 'Publish Test & Generate QR Code'}
          </button>
        </div>
      </form>

      {/* AI Grammar Refine Modal */}
      <AIGrammarModal
        isOpen={polishingIndex !== null && polishResult !== null}
        onClose={() => {
          setPolishingIndex(null);
          setPolishResult(null);
        }}
        originalText={polishingIndex !== null ? questions[polishingIndex]?.questionText : ''}
        polishedResult={polishResult}
        onApply={applyPolishedText}
      />

      {/* Exam Created Success QR Modal */}
      <QRModal
        isOpen={createdExamModal.isOpen}
        onClose={() => {
          setCreatedExamModal({ ...createdExamModal, isOpen: false });
          navigate('/');
        }}
        examTitle={createdExamModal.title}
        examCode={createdExamModal.code}
        qrCodeDataUrl={createdExamModal.qrUrl}
        expiresAt={createdExamModal.expiresAt}
        examJoinUrl={createdExamModal.examJoinUrl}
      />
    </div>
  );
};
