import React from 'react';
import { Question } from '../types';
import { AttachmentBadge } from './AttachmentBadge';
import { 
  HiOutlineCheck, 
  HiOutlineBookmark, 
  HiOutlineArrowUturnLeft
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedOptions: string[];
  textAnswer: string;
  isFlagged: boolean;
  onSelectOption: (option: string) => void;
  onTextChange: (text: string) => void;
  onToggleFlag: () => void;
  onClearAnswer: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  selectedOptions,
  textAnswer,
  isFlagged,
  onSelectOption,
  onTextChange,
  onToggleFlag,
  onClearAnswer,
}) => {
  const isMulti = question.type === 'multi_mcq';
  const isLong = question.type === 'long_answer';
  const wordCount = textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-panel p-8 sm:p-14 rounded-3xl border border-slate-200/90 shadow-sm bg-white relative font-sans"
    >
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100 mb-8">
        <div className="flex items-center space-x-4">
          <span className="w-14 h-14 rounded-2xl glow-gradient-student text-white font-mono font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
            #{index + 1}
          </span>
          <div>
            <span className="text-sm font-extrabold uppercase tracking-wider text-indigo-700 block">
              {isLong
                ? 'Long Explanatory Response'
                : isMulti
                ? 'Multiple Choice (Select All That Apply)'
                : 'Single Choice MCQ'}
            </span>
            <div className="text-sm text-slate-500 font-semibold mt-0.5">
              Weight: <span className="text-slate-900 font-bold">{question.marks} Marks</span>
              {question.negativeMarks ? (
                <span className="text-rose-600 ml-1.5 font-bold">
                  (-{question.negativeMarks} penalty for incorrect answer)
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onToggleFlag}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              isFlagged
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <HiOutlineBookmark className="w-4 h-4 text-amber-500" />
            <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
          </button>

          {(selectedOptions.length > 0 || textAnswer) && (
            <button
              type="button"
              onClick={onClearAnswer}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Clear Answer"
            >
              <HiOutlineArrowUturnLeft className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug mb-8 select-text">
        {question.questionText}
      </div>

      {/* Attachments if any */}
      {question.attachments && question.attachments.length > 0 && (
        <AttachmentBadge attachments={question.attachments} />
      )}

      {/* Options or Long Answer Form */}
      {isLong ? (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between text-sm text-slate-600 font-semibold">
            <span>Compose your comprehensive answer below:</span>
            <span className="font-mono text-indigo-700 font-black">
              {wordCount} Words &bull; {textAnswer.length} Characters
            </span>
          </div>

          <textarea
            rows={8}
            value={textAnswer}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Write your in-depth solution, algorithm logic, or theoretical derivation here..."
            className="w-full bg-slate-50 border border-slate-300 rounded-3xl p-6 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 leading-relaxed font-sans shadow-inner transition-all"
          />
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {question.options.map((opt, optIdx) => {
            const isSelected = selectedOptions.includes(opt);
            return (
              <motion.button
                key={optIdx}
                type="button"
                whileHover={{ scale: 1.002 }}
                whileTap={{ scale: 0.998 }}
                onClick={() => onSelectOption(opt)}
                className={`w-full p-5 sm:p-6 rounded-2xl border text-left flex items-center space-x-4 transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-500 shadow-md text-indigo-950 font-bold'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                }`}
              >
                {/* Indicator Circle/Box */}
                <div
                  className={`w-7 h-7 rounded-${isMulti ? 'lg' : 'full'} border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <HiOutlineCheck className="w-4 h-4 stroke-[3]" />}
                </div>

                <div className="flex items-center space-x-3.5 text-lg sm:text-xl flex-1">
                  <span className="font-mono text-sm font-black text-slate-400">
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  <span>{opt}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
